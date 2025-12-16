import QRCode from "qrcode";
import speakeasy from "speakeasy";

import { decryptPassword, encryptPassword } from "./encryption";

/**
 * Generate a TOTP secret for 2FA setup
 */
export function generate2FASecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `Password Manager (${email})`,
    issuer: "Password Manager",
    length: 32,
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
  };
}

/**
 * Generate QR code for 2FA setup
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Verify TOTP token
 */
export function verify2FAToken(secret: string, token: string): boolean {
  try {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: token,
      window: 2, // Allow 2 time steps (60 seconds) of tolerance
    });
  } catch (error) {
    console.error("Error verifying 2FA token:", error);
    return false;
  }
}

/**
 * Generate backup codes for 2FA
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-digit codes
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    codes.push(code);
  }
  return codes;
}

/**
 * Encrypt 2FA secret for storage
 */
export function encrypt2FASecret(secret: string, masterKey: string): string {
  return encryptPassword(secret, masterKey);
}

/**
 * Decrypt 2FA secret from storage
 */
export function decrypt2FASecret(encryptedSecret: string, masterKey: string): string {
  return decryptPassword(encryptedSecret, masterKey);
}

/**
 * Verify backup code
 */
export function verifyBackupCode(code: string, backupCodes: string[]): boolean {
  return backupCodes.includes(code);
}
