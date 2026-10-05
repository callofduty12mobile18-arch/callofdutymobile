import { createHash } from 'crypto';

/**
 * Hash raw security tokens (email verification, password reset) with SHA-256
 * before storing them in the database.
 */
export function hashToken(token: string): string {
  if (!token) return '';
  return createHash('sha256').update(token).digest('hex');
}
