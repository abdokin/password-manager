/**
 * Password generator with configurable options
 */

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
}

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS = "0O1lI";

/**
 * Generates a random password based on options
 */
export function generatePassword(options: PasswordGeneratorOptions): string {
  const {
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    excludeAmbiguous,
  } = options;

  // Build character set
  let charset = "";
  if (includeUppercase) {
    charset += excludeAmbiguous ? UPPERCASE.replace(/[O1I]/g, "") : UPPERCASE;
  }
  if (includeLowercase) {
    charset += excludeAmbiguous ? LOWERCASE.replace(/[0l]/g, "") : LOWERCASE;
  }
  if (includeNumbers) {
    charset += excludeAmbiguous ? NUMBERS.replace(/[01]/g, "") : NUMBERS;
  }
  if (includeSymbols) {
    charset += SYMBOLS;
  }

  if (charset.length === 0) {
    throw new Error("At least one character set must be selected");
  }

  // Generate password
  const password = Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((byte) => charset[byte % charset.length])
    .join("");

  return password;
}

/**
 * Calculates password entropy (bits of entropy)
 */
export function calculateEntropy(password: string): number {
  const charsetSize = getCharsetSize(password);
  const length = password.length;
  return Math.log2(charsetSize) * length;
}

/**
 * Determines the size of the character set used in the password
 */
function getCharsetSize(password: string): number {
  let size = 0;
  let hasLower = false;
  let hasUpper = false;
  let hasNumber = false;
  let hasSymbol = false;

  for (const char of password) {
    if (LOWERCASE.includes(char) && !hasLower) {
      size += 26;
      hasLower = true;
    } else if (UPPERCASE.includes(char) && !hasUpper) {
      size += 26;
      hasUpper = true;
    } else if (NUMBERS.includes(char) && !hasNumber) {
      size += 10;
      hasNumber = true;
    } else if (SYMBOLS.includes(char) && !hasSymbol) {
      size += SYMBOLS.length;
      hasSymbol = true;
    }
  }

  return size;
}

/**
 * Gets password strength rating based on entropy
 */
export function getPasswordStrength(password: string): {
  strength: "weak" | "fair" | "good" | "strong" | "very-strong";
  score: number; // 0-100
  entropy: number;
} {
  const entropy = calculateEntropy(password);
  let strength: "weak" | "fair" | "good" | "strong" | "very-strong";
  let score: number;

  if (entropy < 28) {
    strength = "weak";
    score = Math.min(25, (entropy / 28) * 25);
  } else if (entropy < 36) {
    strength = "fair";
    score = 25 + ((entropy - 28) / 8) * 25;
  } else if (entropy < 60) {
    strength = "good";
    score = 50 + ((entropy - 36) / 24) * 25;
  } else if (entropy < 80) {
    strength = "strong";
    score = 75 + ((entropy - 60) / 20) * 20;
  } else {
    strength = "very-strong";
    score = 95 + Math.min(5, (entropy - 80) / 20) * 5;
  }

  return {
    strength,
    score: Math.round(score),
    entropy: Math.round(entropy * 10) / 10,
  };
}

/**
 * Default password generator options
 */
export const defaultPasswordOptions: PasswordGeneratorOptions = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: false,
};
