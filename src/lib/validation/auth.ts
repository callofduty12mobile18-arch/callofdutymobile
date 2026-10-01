import { z } from 'zod';

/**
 * Password complexity schema:
 * - Minimum 12 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export const passwordComplexitySchema = z
  .string()
  .min(12, 'Password must be at least 12 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter (A-Z)')
  .regex(/[0-9]/, 'Password must contain at least one number (0-9)')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character (!@#$%^&* etc.)');

export const adminLoginSchema = z.object({
  identifier: z.string().min(2, 'Username or email is required').max(150),
  password: z.string().min(1, 'Password is required'),
});

export const playerSignupSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  gamerTag: z.string().min(2, 'Gamer tag must be at least 2 characters').max(50),
  password: passwordComplexitySchema.optional(),
});
