'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { recordAuditLog } from '../data/audit-store';
import { RoleType } from '@prisma/client';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { signSession, verifySession } from '@/lib/auth/session-token';

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
 * Guard function to be called inside every admin server action.
 * Throws an Unauthorized error if the caller is not an authenticated Admin.
 */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized: Administrator privilege required to perform this action.');
  }
  return session;
}

/**
 * Admin login server action.
 * Authenticates exclusively against the database without any hardcoded credentials.
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

  let authenticated = false;
  let adminEmail = identifier;
  let adminUsername = identifier;
  let matchingDbUser: { id: string; email: string; passwordHash: string | null } | null = null;

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

    if (user && user.passwordHash) {
      const isMatch = await verifyPassword(password, user.passwordHash);
      if (isMatch) {
        authenticated = true;
        adminEmail = user.email;
        adminUsername = user.email.includes('@') ? user.email.split('@')[0] : user.email;
        matchingDbUser = user;
      }
    }
  } catch (err) {
    console.error('Database query error during admin authentication:', err);
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

  // Automatically migrate legacy plaintext password to bcrypt hash in DB if needed
  if (!matchingDbUser.passwordHash?.startsWith('$2')) {
    try {
      const newHash = await hashPassword(password);
      await prisma.user.update({
        where: { id: matchingDbUser.id },
        data: { passwordHash: newHash },
      });
    } catch (migErr) {
      console.error('Password hash upgrade failed:', migErr);
    }
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
