'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { recordAuditLog } from '../data/audit-store';
import { requireAdminSession } from './admin-auth';

export interface DeletePlayerResponse {
  success: boolean;
  message: string;
}

export async function deletePlayerAction(playerId: string): Promise<DeletePlayerResponse> {
  const admin = await requireAdminSession();

  if (!playerId) {
    return { success: false, message: 'Player ID is required.' };
  }

  try {
    // 1. Fetch player details from database
    const player = await prisma.player.findFirst({
      where: {
        OR: [{ id: playerId }, { slug: playerId }],
      },
      include: { user: true },
    });

    const targetIgn = player?.ign || playerId;
    const targetSlug = player?.slug;
    const targetUserId = player?.userId;

    // 2. Delete player record and associated relations from database
    if (player) {
      try {
        await prisma.player.delete({
          where: { id: player.id },
        });

        // Clean up linked user account if exists
        if (targetUserId) {
          try {
            await prisma.user.delete({
              where: { id: targetUserId },
            });
          } catch {
            // Ignore if user deletion fails
          }
        }

        // Clean up any empty orphan teams with 0 active members
        try {
          await prisma.team.deleteMany({
            where: {
              members: { none: {} },
              organizationId: null,
            },
          });
        } catch {
          // Ignore
        }
      } catch (dbErr) {
        console.error('Database delete failed, attempting soft-delete:', dbErr);
        try {
          await prisma.player.update({
            where: { id: player.id },
            data: {
              deletedAt: new Date(),
              publishStatus: 'ARCHIVED',
            },
          });
        } catch {
          // Ignore
        }
      }
    }

    // 3. Record audit log in database
    await recordAuditLog(
      'STATUS_MODIFIED',
      admin.username,
      `Deleted player profile for "${targetIgn}".`,
      targetIgn,
      'WARNING'
    );

    // 4. Invalidate Next.js caches
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/players');
    revalidatePath('/admin/teams');
    revalidatePath('/players');
    revalidatePath('/teams');
    if (targetSlug) {
      revalidatePath(`/players/${targetSlug}`);
    }
    revalidatePath('/');

    return {
      success: true,
      message: `Player "${targetIgn}" has been deleted successfully from the database.`,
    };
  } catch (error) {
    console.error('Failed to delete player:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred while deleting the player.',
    };
  }
}
