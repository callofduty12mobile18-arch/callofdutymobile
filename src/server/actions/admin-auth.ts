'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { recordAuditLog } from '../data/audit-store';
import { RoleType } from '@prisma/client';
import { verifyPassword } from '@/lib/auth/password';
import { getClientIp, rateLimit } from '@/lib/auth/rate-limit';
import { signSession, verifySession } from '@/lib/auth/session-token';
import { passwordComplexitySchema } from '@/lib/validation/auth';
import { sendAccountLockoutEmail } from '@/lib/email/mailer';
import { logger } from '@/lib/logger';

export interface AdminSession {
  email: string;
  role: 'ADMIN';
  username: string;
  loggedInAt: string;
}

export interface AdminAuthResponse {
  success: boolean;
  message: string;
  redirectUrl?: string;
}

const ADMIN_COOKIE_NAME = 'codm_admin_session';

/**
 * Retrieve and cryptographically verify the current admin session from cookie.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await verifySession<AdminSession>(token);
    if (session && session.role === 'ADMIN') {
      return session;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Guard function to be called inside admin server actions.
 * If the user is unauthenticated or session has expired, redirect cleanly to /admin/login.
 */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  // Verify against database to ensure admin has not been deleted or demoted
  try {
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: session.email, mode: 'insensitive' } },
          { email: { equals: `${session.email}@callofdutymobile.in`, mode: 'insensitive' } },
          { email: { equals: session.username, mode: 'insensitive' } },
        ],
        role: RoleType.ADMIN,
      },
      select: { id: true },
    });

    if (!dbUser) {
      redirect('/admin/login');
    }
  } catch (err) {
    // If it's a Next.js redirect exception, rethrow it so Next.js handles the redirection
    if (err && typeof err === 'object' && 'digest' in err && typeof (err as { digest?: string }).digest === 'string' && (err as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error('Database check error in requireAdminSession:', err);
    redirect('/admin/login');
  }

  return session;
}

/**
 * Admin login server action.
 * Authenticates exclusively against the database without hardcoded credentials.
 */
export async function loginAdminAction(
  prevState: AdminAuthResponse | null,
  formData: FormData
): Promise<AdminAuthResponse> {
  const identifier = (formData.get('identifier') as string)?.trim().toLowerCase();
  const password = (formData.get('password') as string)?.trim();

  if (!identifier || !password) {
    return { success: false, message: 'Please provide both admin username/email and password.' };
  }

  // Enforce password complexity check on admin login (min 12 chars, uppercase, digit, special char)
  const complexityResult = passwordComplexitySchema.safeParse(password);
  if (!complexityResult.success) {
    return {
      success: false,
      message: 'Password must be at least 12 characters and include an uppercase letter, a number, and a special character.',
    };
  }

  const ip = await getClientIp();
  const [ipAllowed, idAllowed] = await Promise.all([
    rateLimit(`login:admin:ip:${ip}`, 20, 15 * 60 * 1000),
    rateLimit(`login:admin:id:${identifier}`, 5, 15 * 60 * 1000),
  ]);

  if (!ipAllowed || !idAllowed) {
    return { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' };
  }

  let authenticated = false;
  let adminEmail = identifier;
  let adminUsername = identifier;
  let matchingDbUser: {
    id: string;
    email: string;
    passwordHash: string | null;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
  } | null = null;

  // Query administrator account from PostgreSQL database
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: 'insensitive' } },
          { email: { equals: `${identifier}@callofdutymobile.in`, mode: 'insensitive' } },
        ],
        role: RoleType.ADMIN,
      },
    });

    if (user) {
      matchingDbUser = user;

      // Account Lockout Protection: verify if account is currently locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (60 * 1000));
        return {
          success: false,
          message: `Account is temporarily locked due to repeated failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
        };
      }

      if (user.passwordHash) {
        const isMatch = await verifyPassword(password, user.passwordHash);
        if (isMatch) {
          authenticated = true;
          adminEmail = user.email;
          adminUsername = user.email.includes('@') ? user.email.split('@')[0] : user.email;

          // Reset failed attempts upon successful authentication
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lockedUntil: null,
            },
          });
        } else {
          // Increment failed attempts and trigger 30-min lockout if reaching 5 attempts
          const newFailedAttempts = user.failedLoginAttempts + 1;
          const shouldLock = newFailedAttempts >= 5;
          const lockTime = shouldLock ? new Date(Date.now() + 30 * 60 * 1000) : null;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: shouldLock ? 0 : newFailedAttempts,
              lockedUntil: lockTime,
            },
          });

          if (shouldLock) {
            await sendAccountLockoutEmail({
              to: user.email,
              ip,
              lockoutMinutes: 30,
            });

            return {
              success: false,
              message: 'Account locked for 30 minutes due to 5 consecutive failed login attempts. A security alert email has been sent.',
            };
          }
        }
      }
    }
  } catch (err) {
    logger.error('Database query error during admin authentication:', err);
    return {
      success: false,
      message: 'Database authentication error. Please ensure database connection is healthy.',
    };
  }

  if (!authenticated || !matchingDbUser) {
    return {
      success: false,
      message: 'Access Denied: Invalid admin username or password.',
    };
  }

  // Generate cryptographically signed session token
  const sessionData: AdminSession = {
    email: adminEmail,
    username: adminUsername,
    role: 'ADMIN',
    loggedInAt: new Date().toISOString(),
  };

  const signedToken = await signSession(sessionData);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  // Record database audit log
  await recordAuditLog(
    'STATUS_MODIFIED',
    adminUsername,
    `Administrator authenticated with verified DB credentials (${adminEmail})`,
    'ADMIN_PORTAL',
    'SUCCESS'
  );

  return {
    success: true,
    message: 'Authentication successful. Redirecting to admin console...',
    redirectUrl: '/admin/dashboard',
  };
}

export async function logoutAdminAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  revalidatePath('/admin', 'layout');
  redirect('/admin/login');
}
