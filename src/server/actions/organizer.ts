'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { SubmissionType, SubmissionStatus, TournamentTier, TournamentStatus, PublishStatus } from '@prisma/client';
import { getPlayerSession } from './player-auth';
import { requireAdminSession } from './admin-auth';
import { recordAuditLog } from '../data/audit-store';
import { scrimLobbiesStore, ScrimLobby } from '../data/scrims-data';
import { randomUUID } from 'crypto';

export interface OrganizerPermissionResponse {
  canOrganizeTournaments: boolean;
  canOrganizeScrims: boolean;
  pendingTournamentRequests: number;
  pendingScrimRequests: number;
}

export interface OrganizerRequestItem {
  id: string;
  type: 'TOURNAMENT_ORGANIZER_REQUEST' | 'SCRIM_ORGANIZER_REQUEST';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submitterName: string;
  submitterEmail: string;
  submitterPhone?: string | null;
  details: {
    eventTitle?: string;
    organizationOrClan?: string;
    plannedDate?: string;
    prizePool?: string;
    entryType?: string;
    entryFee?: string;
    format?: string;
    discordOrContact?: string;
    description?: string;
  };
  adminNotes?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
}

/**
 * Check if the currently logged-in player has approved permissions to organize.
 */
export async function getPlayerOrganizerPermissions(): Promise<OrganizerPermissionResponse> {
  const session = await getPlayerSession();
  if (!session) {
    return {
      canOrganizeTournaments: false,
      canOrganizeScrims: false,
      pendingTournamentRequests: 0,
      pendingScrimRequests: 0,
    };
  }

  try {
    const submissions = await prisma.submission.findMany({
      where: {
        submitterEmail: { equals: session.email, mode: 'insensitive' },
        type: { in: [SubmissionType.TOURNAMENT_ORGANIZER_REQUEST, SubmissionType.SCRIM_ORGANIZER_REQUEST] },
      },
      orderBy: { createdAt: 'desc' },
    });

    const approvedTourney = submissions.some(
      (s) => s.type === SubmissionType.TOURNAMENT_ORGANIZER_REQUEST && s.status === SubmissionStatus.APPROVED
    );
    const approvedScrim = submissions.some(
      (s) => s.type === SubmissionType.SCRIM_ORGANIZER_REQUEST && s.status === SubmissionStatus.APPROVED
    );

    const pendingTourney = submissions.filter(
      (s) => s.type === SubmissionType.TOURNAMENT_ORGANIZER_REQUEST && s.status === SubmissionStatus.PENDING
    ).length;

    const pendingScrim = submissions.filter(
      (s) => s.type === SubmissionType.SCRIM_ORGANIZER_REQUEST && s.status === SubmissionStatus.PENDING
    ).length;

    return {
      canOrganizeTournaments: approvedTourney,
      canOrganizeScrims: approvedScrim,
      pendingTournamentRequests: pendingTourney,
      pendingScrimRequests: pendingScrim,
    };
  } catch (err) {
    console.error('Error checking organizer permissions:', err);
    return {
      canOrganizeTournaments: false,
      canOrganizeScrims: false,
      pendingTournamentRequests: 0,
      pendingScrimRequests: 0,
    };
  }
}

/**
 * Player submits a formal request to organize a tournament or scrim.
 */
export async function submitOrganizerRequestAction(
  type: 'TOURNAMENT' | 'SCRIM',
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const session = await getPlayerSession();
  if (!session) {
    return { success: false, message: 'You must be logged into Player Studio to submit a request.' };
  }

  const eventTitle = (formData.get('eventTitle') as string)?.trim();
  const organizationOrClan = (formData.get('organizationOrClan') as string)?.trim() || session.ign;
  const eventDate = (formData.get('eventDate') as string)?.trim();
  const eventTime = (formData.get('eventTime') as string)?.trim();
  const plannedDate = eventDate
    ? eventTime
      ? `${eventDate} at ${eventTime}`
      : eventDate
    : (formData.get('plannedDate') as string)?.trim() || 'Upcoming';

  const prizePoolType = (formData.get('prizePoolType') as string)?.trim();
  const customPrizeAmount = (formData.get('customPrizeAmount') as string)?.trim();
  const prizePool =
    prizePoolType === 'CUSTOM' && customPrizeAmount
      ? customPrizeAmount
      : prizePoolType === 'FUN'
      ? 'Just for Fun (No Cash Prize)'
      : (formData.get('prizePool') as string)?.trim() || 'Just for Fun (No Cash Prize)';

  const entryType = (formData.get('entryType') as string)?.trim() || 'FREE';
  const entryFeeInput = (formData.get('entryFee') as string)?.trim();
  const entryFee = entryType === 'PAID' ? (entryFeeInput || 'Payable') : 'Free Entry';

  const format = (formData.get('format') as string)?.trim() || 'Standard Competitive Rules';
  const discordOrContact = (formData.get('discordOrContact') as string)?.trim() || session.email;
  const description = (formData.get('description') as string)?.trim() || '';

  if (!eventTitle) {
    return { success: false, message: 'Event or Tournament name is required.' };
  }

  const submissionType =
    type === 'TOURNAMENT'
      ? SubmissionType.TOURNAMENT_ORGANIZER_REQUEST
      : SubmissionType.SCRIM_ORGANIZER_REQUEST;

  try {
    const created = await prisma.submission.create({
      data: {
        type: submissionType,
        status: SubmissionStatus.PENDING,
        submitterName: session.ign,
        submitterEmail: session.email.toLowerCase().trim(),
        submitterPhone: discordOrContact,
        rawData: {
          eventTitle,
          organizationOrClan,
          plannedDate,
          prizePool,
          entryType,
          entryFee,
          format,
          discordOrContact,
          description,
        },
      },
    });

    await recordAuditLog(
      type === 'TOURNAMENT' ? 'TOURNAMENT_ORGANIZER_REQUESTED' : 'SCRIM_ORGANIZER_REQUESTED',
      session.email,
      `Submitted ${type.toLowerCase()} organizer permission request for "${eventTitle}".`,
      `Organizer: ${session.ign}`,
      'INFO'
    );

    revalidatePath('/player');
    revalidatePath('/admin/requests');
    revalidatePath('/admin/tournaments');

    return {
      success: true,
      message: `Your ${type.toLowerCase()} organizer request has been submitted to the Admin for verification!`,
    };
  } catch (err) {
    console.error('Failed to submit organizer request:', err);
    return { success: false, message: 'Failed to record organizer request. Please try again.' };
  }
}

/**
 * Admin: List all organizer requests.
 */
export async function getAdminOrganizerRequests(): Promise<OrganizerRequestItem[]> {
  await requireAdminSession();

  try {
    const submissions = await prisma.submission.findMany({
      where: {
        type: { in: [SubmissionType.TOURNAMENT_ORGANIZER_REQUEST, SubmissionType.SCRIM_ORGANIZER_REQUEST] },
      },
      orderBy: { createdAt: 'desc' },
    });

    return submissions.map((s) => {
      const raw = (s.rawData as Record<string, unknown>) || {};
      return {
        id: s.id,
        type: s.type as OrganizerRequestItem['type'],
        status: s.status as OrganizerRequestItem['status'],
        submitterName: s.submitterName,
        submitterEmail: s.submitterEmail,
        submitterPhone: s.submitterPhone,
        details: {
          eventTitle: (raw.eventTitle as string) || undefined,
          organizationOrClan: (raw.organizationOrClan as string) || undefined,
          plannedDate: (raw.plannedDate as string) || undefined,
          prizePool: (raw.prizePool as string) || undefined,
          entryType: (raw.entryType as string) || undefined,
          entryFee: (raw.entryFee as string) || undefined,
          format: (raw.format as string) || undefined,
          discordOrContact: (raw.discordOrContact as string) || undefined,
          description: (raw.description as string) || undefined,
        },
        adminNotes: s.adminNotes,
        createdAt: s.createdAt.toISOString(),
        reviewedAt: s.reviewedAt?.toISOString() || null,
      };
    });
  } catch (err) {
    console.error('Error fetching admin organizer requests:', err);
    return [];
  }
}

/**
 * Admin: Approve or Reject an organizer request.
 */
export async function reviewOrganizerRequestAction(
  requestId: string,
  decision: 'APPROVE' | 'REJECT',
  adminNotes?: string
): Promise<{ success: boolean; message: string }> {
  const admin = await requireAdminSession();

  try {
    const sub = await prisma.submission.findUnique({
      where: { id: requestId },
    });

    if (!sub) {
      return { success: false, message: 'Organizer request not found.' };
    }

    const newStatus = decision === 'APPROVE' ? SubmissionStatus.APPROVED : SubmissionStatus.REJECTED;

    await prisma.submission.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        adminNotes: adminNotes || (decision === 'APPROVE' ? 'Approved by Admin' : 'Declined by Admin'),
      },
    });

    const isTourney = sub.type === SubmissionType.TOURNAMENT_ORGANIZER_REQUEST;
    const raw = (sub.rawData as Record<string, unknown>) || {};
    const title = (raw.eventTitle as string) || 'Event';

    // If approved and it's a tournament with details, auto-create a DRAFT/PUBLISHED tournament record for the organizer
    if (decision === 'APPROVE' && isTourney) {
      const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `tourney-${Date.now()}`;
      const uniqueSlug = `${slugBase}-${randomUUID().slice(0, 4)}`;

      await prisma.tournament.create({
        data: {
          slug: uniqueSlug,
          name: title,
          organizer: (raw.organizationOrClan as string) || sub.submitterName,
          tier: TournamentTier.COMMUNITY,
          status: TournamentStatus.UPCOMING,
          startDate: new Date(),
          formatDescription: (raw.description as string) || (raw.format as string) || 'Approved Community Tournament',
          publishStatus: PublishStatus.PUBLISHED,
        },
      });
    }

    await recordAuditLog(
      decision === 'APPROVE' ? 'ORGANIZER_PERMISSION_GRANTED' : 'ORGANIZER_PERMISSION_REJECTED',
      admin.username,
      `${decision === 'APPROVE' ? 'Granted' : 'Declined'} organizer permission for ${sub.submitterEmail} (${title}).`,
      `Target: ${sub.submitterEmail}`,
      decision === 'APPROVE' ? 'SUCCESS' : 'WARNING'
    );

    revalidatePath('/admin/requests');
    revalidatePath('/admin/tournaments');
    revalidatePath('/tournaments');
    revalidatePath('/player');

    return {
      success: true,
      message: `Organizer request ${decision === 'APPROVE' ? 'approved' : 'rejected'} successfully.`,
    };
  } catch (err) {
    console.error('Error reviewing organizer request:', err);
    return { success: false, message: 'Failed to update organizer request status.' };
  }
}
