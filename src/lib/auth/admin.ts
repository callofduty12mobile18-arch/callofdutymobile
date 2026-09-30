import { createServerSupabaseClient } from './supabase-server';
import { prisma } from '../db/prisma';

export interface AdminSession {
  userId: string;
  email: string;
  role: 'ADMIN' | 'MODERATOR';
}

/**
 * Checks if the current authenticated user has an active session and ADMIN/MODERATOR role.
 * Returns the admin session if authorized, otherwise null.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return null;
    }

    // Check user in database
    const dbUser = await prisma.user.findUnique({
      where: { supabaseUid: user.id },
      select: { id: true, email: true, role: true },
    });

    if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'MODERATOR')) {
      return null;
    }

    return {
      userId: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
    };
  } catch (err) {
    console.error('Error verifying admin session:', err);
    return null;
  }
}
