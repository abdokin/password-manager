import crypto from "crypto";

// Encryption configuration
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64; // 512 bits
const TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits
const PBKDF2_ITERATIONS = 100000; // High iteration count for security

/**
 * Derives an encryption key from a master password using PBKDF2
 */
function deriveKey(masterPassword: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(masterPassword, salt, PBKDF2_ITERATIONS, KEY_LENGTH, "sha512");
}

/**
 * Encrypts a password using AES-256-GCM
 * Returns a string format: salt:iv:tag:encryptedData (all base64 encoded)
 */
export function encryptPassword(plaintext: string, masterPassword: string): string {
  if (!plaintext || !masterPassword) {
    throw new Error("Plaintext and master password are required");
  }

  // Generate random salt and IV
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  // Derive key from master password
  const key = deriveKey(masterPassword, salt);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt
  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  // Get authentication tag
  const tag = cipher.getAuthTag();

  // Return format: salt:iv:tag:encryptedData
  return [salt.toString("base64"), iv.toString("base64"), tag.toString("base64"), encrypted].join(
    ":"
  );
}

/**
 * Decrypts a password using AES-256-GCM
 * Expects format: salt:iv:tag:encryptedData (all base64 encoded)
 */
export function decryptPassword(encryptedData: string, masterPassword: string): string {
  if (!encryptedData || !masterPassword) {
    throw new Error("Encrypted data and master password are required");
  }

  try {
    // Split the encrypted data
    const parts = encryptedData.split(":");
    if (parts.length !== 4) {
      throw new Error("Invalid encrypted data format");
    }

    const [saltBase64, ivBase64, tagBase64, encrypted] = parts;

    // Decode from base64
    const salt = Buffer.from(saltBase64, "base64");
    const iv = Buffer.from(ivBase64, "base64");
    const tag = Buffer.from(tagBase64, "base64");

    // Derive key from master password
    const key = deriveKey(masterPassword, salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    // Decrypt
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error(
      `Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generates a secure random master key (for user master passwords)
 * This should be used when creating a new user account
 */
export function generateMasterKey(): string {
  return crypto.randomBytes(32).toString("base64");
}

/**
 * Hashes a master password for storage (using PBKDF2)
 * This is different from encryption - this is for storing the master password hash
 */
export function hashMasterPassword(masterPassword: string): {
  hash: string;
  salt: string;
} {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const hash = crypto.pbkdf2Sync(masterPassword, salt, PBKDF2_ITERATIONS, KEY_LENGTH, "sha512");

  return {
    hash: hash.toString("base64"),
    salt: salt.toString("base64"),
  };
}

/**
 * Verifies a master password against a stored hash
 */
export function verifyMasterPassword(
  masterPassword: string,
  storedHash: string,
  storedSalt: string
): boolean {
  const salt = Buffer.from(storedSalt, "base64");
  const hash = crypto.pbkdf2Sync(masterPassword, salt, PBKDF2_ITERATIONS, KEY_LENGTH, "sha512");

  return hash.toString("base64") === storedHash;
}
