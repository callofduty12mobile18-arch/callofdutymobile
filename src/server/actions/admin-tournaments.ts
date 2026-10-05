'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { PublishStatus, TournamentTier, TournamentStatus } from '@prisma/client';
import { requireAdminSession } from './admin-auth';
import { recordAuditLog } from '../data/audit-store';
import { getClientIp } from '@/lib/auth/rate-limit';
import { randomUUID } from 'crypto';

export interface CreateTournamentAdminInput {
  name: string;
  organizer: string;
  tier: TournamentTier;
  status: TournamentStatus;
  publishStatus: PublishStatus;
  startDate: string;
  endDate?: string;
  prizePoolInr?: number;
  location?: string;
  formatDescription?: string;
  bannerUrl?: string;
}

/**
 * Admin: Fetch all tournaments including DRAFT, PUBLISHED, ARCHIVED
 */
export async function getAllAdminTournaments() {
  await requireAdminSession();

  try {
    const tournaments = await prisma.tournament.findMany({
      where: { deletedAt: null },
      include: {
        mvpPlayer: true,
        teamAchievements: {
          include: { team: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });
    return tournaments;
  } catch (err) {
    console.error('Error fetching admin tournaments:', err);
    return [];
  }
}

/**
 * Admin: Toggle visibility / publish status of a tournament (PUBLISHED <-> DRAFT / ARCHIVED)
 */
export async function updateTournamentPublishStatusAction(
  tournamentId: string,
  publishStatus: PublishStatus
): Promise<{ success: boolean; message: string }> {
  const admin = await requireAdminSession();
  const ip = await getClientIp();

  try {
    const updated = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { publishStatus },
    });

    await recordAuditLog(
      'TOURNAMENT_UPDATED',
      admin.username,
      `Changed publish status of "${updated.name}" to ${publishStatus}.`,
      `Tournament: ${updated.slug}`,
      'INFO',
      ip
    );

    revalidatePath('/admin/tournaments');
    revalidatePath('/tournaments');
    revalidatePath(`/tournaments/${updated.slug}`);

    return {
      success: true,
      message: `Tournament "${updated.name}" is now ${publishStatus === PublishStatus.PUBLISHED ? 'publicly visible' : 'hidden from public'} (${publishStatus}).`,
    };
  } catch (err) {
    console.error('Error updating tournament publish status:', err);
    return { success: false, message: 'Failed to update tournament status.' };
  }
}

/**
 * Admin: Create a new tournament directly
 */
export async function createTournamentAction(
  formData: FormData
): Promise<{ success: boolean; message: string; tournamentSlug?: string }> {
  const admin = await requireAdminSession();
  const ip = await getClientIp();

  const name = (formData.get('name') as string)?.trim();
  const organizer = (formData.get('organizer') as string)?.trim() || 'MOBILEROSTER Editorial';
  const tier = (formData.get('tier') as TournamentTier) || TournamentTier.COMMUNITY;
  const status = (formData.get('status') as TournamentStatus) || TournamentStatus.UPCOMING;
  const publishStatus = (formData.get('publishStatus') as PublishStatus) || PublishStatus.PUBLISHED;
  const startDateStr = (formData.get('startDate') as string)?.trim();
  const location = (formData.get('location') as string)?.trim() || 'Online (India Server)';
  const prizePoolStr = (formData.get('prizePoolInr') as string)?.trim();
  const formatDescription = (formData.get('formatDescription') as string)?.trim() || 'Standard CDL 5v5 Competitive Format';
  const bannerUrl = (formData.get('bannerUrl') as string)?.trim() || undefined;

  if (!name) {
    return { success: false, message: 'Tournament name is required.' };
  }

  const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `tourney-${Date.now()}`;
  const slug = `${slugBase}-${randomUUID().slice(0, 4)}`;
  const startDate = startDateStr ? new Date(startDateStr) : new Date();
  const prizePoolInr = prizePoolStr ? parseFloat(prizePoolStr) : undefined;

  try {
    const created = await prisma.tournament.create({
      data: {
        slug,
        name,
        organizer,
        tier,
        status,
        publishStatus,
        startDate,
        location,
        prizePoolInr: prizePoolInr !== undefined && !isNaN(prizePoolInr) ? prizePoolInr : null,
        formatDescription,
        bannerUrl,
      },
    });

    await recordAuditLog(
      'TOURNAMENT_UPDATED',
      admin.username,
      `Created tournament "${name}" (${tier}) with status ${publishStatus}.`,
      `Tournament: ${created.slug}`,
      'SUCCESS',
      ip
    );

    revalidatePath('/admin/tournaments');
    revalidatePath('/tournaments');

    return {
      success: true,
      message: `Tournament "${name}" created successfully!`,
      tournamentSlug: created.slug,
    };
  } catch (err) {
    console.error('Error creating tournament:', err);
    return { success: false, message: 'Failed to create tournament in database.' };
  }
}

/**
 * Admin: Update tournament details
 */
export async function updateTournamentAction(
  tournamentId: string,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const admin = await requireAdminSession();
  const ip = await getClientIp();

  const name = (formData.get('name') as string)?.trim();
  const organizer = (formData.get('organizer') as string)?.trim();
  const tier = (formData.get('tier') as TournamentTier) || undefined;
  const status = (formData.get('status') as TournamentStatus) || undefined;
  const publishStatus = (formData.get('publishStatus') as PublishStatus) || undefined;
  const location = (formData.get('location') as string)?.trim() || undefined;
  const prizePoolStr = (formData.get('prizePoolInr') as string)?.trim();
  const formatDescription = (formData.get('formatDescription') as string)?.trim() || undefined;

  if (!name) {
    return { success: false, message: 'Tournament name cannot be empty.' };
  }

  const prizePoolInr = prizePoolStr ? parseFloat(prizePoolStr) : undefined;

  try {
    const updated = await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        name,
        ...(organizer && { organizer }),
        ...(tier && { tier }),
        ...(status && { status }),
        ...(publishStatus && { publishStatus }),
        ...(location && { location }),
        ...(prizePoolInr !== undefined && !isNaN(prizePoolInr) && { prizePoolInr }),
        ...(formatDescription && { formatDescription }),
      },
    });

    await recordAuditLog(
      'TOURNAMENT_UPDATED',
      admin.username,
      `Updated tournament details for "${updated.name}".`,
      `Tournament: ${updated.slug}`,
      'INFO',
      ip
    );

    revalidatePath('/admin/tournaments');
    revalidatePath('/tournaments');
    revalidatePath(`/tournaments/${updated.slug}`);

    return { success: true, message: `Tournament "${updated.name}" updated successfully.` };
  } catch (err) {
    console.error('Error updating tournament:', err);
    return { success: false, message: 'Failed to update tournament.' };
  }
}

/**
 * Admin: Soft-delete / Remove a tournament
 */
export async function deleteTournamentAction(
  tournamentId: string
): Promise<{ success: boolean; message: string }> {
  const admin = await requireAdminSession();
  const ip = await getClientIp();

  try {
    const deleted = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { deletedAt: new Date(), publishStatus: PublishStatus.ARCHIVED },
    });

    await recordAuditLog(
      'TOURNAMENT_UPDATED',
      admin.username,
      `Archived / Deleted tournament "${deleted.name}".`,
      `Tournament: ${deleted.slug}`,
      'WARNING',
      ip
    );

    revalidatePath('/admin/tournaments');
    revalidatePath('/tournaments');

    return { success: true, message: 'Tournament archived and removed from public listings.' };
  } catch (err) {
    console.error('Error deleting tournament:', err);
    return { success: false, message: 'Failed to delete tournament.' };
  }
}
