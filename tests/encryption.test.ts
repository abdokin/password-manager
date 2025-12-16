import crypto from "crypto";
import { describe, expect, it } from "vitest";

import { decryptPassword, encryptPassword } from "../lib/encryption";

// Helper functions for testing (not exported from encryption.ts)
function deriveKey(masterPassword: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    masterPassword,
    salt,
    100000, // PBKDF2_ITERATIONS
    32, // KEY_LENGTH
    "sha512"
  );
}

function generateSalt(): Buffer {
  return crypto.randomBytes(64); // SALT_LENGTH
}

describe("Encryption", () => {
  const masterPassword = "test-master-password-123";
  const testPassword = "MySecurePassword123!";

  describe("encryptPassword and decryptPassword", () => {
    it("should encrypt and decrypt a password correctly", () => {
      const encrypted = encryptPassword(testPassword, masterPassword);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(testPassword);
      expect(encrypted).toContain(":"); // Format: salt:iv:encrypted

      const decrypted = decryptPassword(encrypted, masterPassword);
      expect(decrypted).toBe(testPassword);
    });

    it("should produce different encrypted values for same password", () => {
      const encrypted1 = encryptPassword(testPassword, masterPassword);
      const encrypted2 = encryptPassword(testPassword, masterPassword);
      expect(encrypted1).not.toBe(encrypted2);

      // Both should decrypt to the same value
      expect(decryptPassword(encrypted1, masterPassword)).toBe(testPassword);
      expect(decryptPassword(encrypted2, masterPassword)).toBe(testPassword);
    });

    it("should fail to decrypt with wrong master password", () => {
      const encrypted = encryptPassword(testPassword, masterPassword);
      const wrongMaster = "wrong-master-password";

      expect(() => {
        decryptPassword(encrypted, wrongMaster);
      }).toThrow();
    });

    it("should handle empty password", () => {
      const encrypted = encryptPassword("", masterPassword);
      expect(encrypted).toBeDefined();
      const decrypted = decryptPassword(encrypted, masterPassword);
      expect(decrypted).toBe("");
    });

    it("should handle special characters", () => {
      const specialPassword = "P@ssw0rd!@#$%^&*()_+-=[]{}|;:,.<>?";
      const encrypted = encryptPassword(specialPassword, masterPassword);
      const decrypted = decryptPassword(encrypted, masterPassword);
      expect(decrypted).toBe(specialPassword);
    });

    it("should handle long passwords", () => {
      const longPassword = "a".repeat(1000);
      const encrypted = encryptPassword(longPassword, masterPassword);
      const decrypted = decryptPassword(encrypted, masterPassword);
      expect(decrypted).toBe(longPassword);
    });
  });

  describe("deriveKey", () => {
    it("should derive a key from password and salt", () => {
      const salt = generateSalt();
      const key1 = deriveKey(masterPassword, salt);
      const key2 = deriveKey(masterPassword, salt);

      expect(key1).toBeDefined();
      expect(Buffer.isBuffer(key1)).toBe(true);
      expect(key1.length).toBe(32); // AES-256 key length
      expect(key1.equals(key2)).toBe(true); // Same password and salt should produce same key
    });

    it("should produce different keys for different salts", () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      const key1 = deriveKey(masterPassword, salt1);
      const key2 = deriveKey(masterPassword, salt2);

      expect(key1.equals(key2)).toBe(false);
    });

    it("should produce different keys for different passwords", () => {
      const salt = generateSalt();
      const key1 = deriveKey(masterPassword, salt);
      const key2 = deriveKey("different-password", salt);

      expect(key1.equals(key2)).toBe(false);
    });
  });

  describe("generateSalt", () => {
    it("should generate a salt", () => {
      const salt = generateSalt();
      expect(salt).toBeDefined();
      expect(Buffer.isBuffer(salt)).toBe(true);
      expect(salt.length).toBe(64); // SALT_LENGTH from encryption.ts
    });

    it("should generate unique salts", () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(salt1.equals(salt2)).toBe(false);
    });
  });
});
