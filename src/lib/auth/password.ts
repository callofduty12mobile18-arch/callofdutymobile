import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password with bcrypt.
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

/**
 * Verify a plain text password against a hashed password.
 */
export async function verifyPassword(plainText: string, storedHash: string): Promise<boolean> {
  if (!plainText || !storedHash) return false;

  // If stored value is a bcrypt hash ($2a$, $2b$, $2y$)
  if (
    storedHash.startsWith('$2a$') ||
    storedHash.startsWith('$2b$') ||
    storedHash.startsWith('$2y$')
  ) {
    try {
      return await bcrypt.compare(plainText, storedHash);
    } catch {
      return false;
    }
  }

  // Non-bcrypt stored values (legacy plaintext) are rejected.
  return false;
}
