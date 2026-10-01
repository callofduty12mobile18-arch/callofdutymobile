import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password with bcrypt.
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

/**
 * Verify a plain text password against a hashed (or legacy plain text) password.
 */
export async function verifyPassword(plainText: string, storedHashOrPlain: string): Promise<boolean> {
  if (!plainText || !storedHashOrPlain) return false;

  // If stored value is a bcrypt hash ($2a$, $2b$, $2y$)
  if (
    storedHashOrPlain.startsWith('$2a$') ||
    storedHashOrPlain.startsWith('$2b$') ||
    storedHashOrPlain.startsWith('$2y$')
  ) {
    try {
      return await bcrypt.compare(plainText, storedHashOrPlain);
    } catch {
      return false;
    }
  }

  // Fallback for legacy plain text passwords
  return plainText === storedHashOrPlain;
}
