'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { SubmissionType, SubmissionStatus, TournamentTier, TournamentStatus, PublishStatus } from '@prisma/client';
import { getPlayerSession } from './player-auth';
import { requireAdminSession } from './admin-auth';
import { recordAuditLog } from '../data/audit-store';
import { getClientIp } from '@/lib/auth/rate-limit';
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

const organizerRequestSchema = z.object({
  type: z.enum(['TOURNAMENT', 'SCRIM']),
  eventTitle: z.string().min(2, 'Event title is required (min 2 chars)').max(100, 'Event title must be at most 100 chars'),
  organizationOrClan: z.string().max(100, 'Organization name must be at most 100 chars').optional(),
  eventDate: z.string().max(50).optional(),
  eventTime: z.string().max(50).optional(),
  plannedDate: z.string().max(100).optional(),
  prizePoolType: z.string().max(50).optional(),
  customPrizeAmount: z.string().max(100).optional(),
  prizePool: z.string().max(100).optional(),
  entryType: z.string().max(50).optional(),
  entryFee: z.string().max(100).optional(),
  format: z.string().max(200).optional(),
  discordOrContact: z.string().max(100).optional(),
  description: z.string().max(2000, 'Description must be at most 2000 chars').optional(),
});

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

  const rawInput = {
    type,
    eventTitle: (formData.get('eventTitle') as string)?.trim() || '',
    organizationOrClan: (formData.get('organizationOrClan') as string)?.trim() || session.ign,
    eventDate: (formData.get('eventDate') as string)?.trim() || undefined,
    eventTime: (formData.get('eventTime') as string)?.trim() || undefined,
    plannedDate: (formData.get('plannedDate') as string)?.trim() || undefined,
    prizePoolType: (formData.get('prizePoolType') as string)?.trim() || undefined,
    customPrizeAmount: (formData.get('customPrizeAmount') as string)?.trim() || undefined,
    prizePool: (formData.get('prizePool') as string)?.trim() || undefined,
    entryType: (formData.get('entryType') as string)?.trim() || undefined,
    entryFee: (formData.get('entryFee') as string)?.trim() || undefined,
    format: (formData.get('format') as string)?.trim() || undefined,
    discordOrContact: (formData.get('discordOrContact') as string)?.trim() || session.email,
    description: (formData.get('description') as string)?.trim() || undefined,
  };

  const validated = organizerRequestSchema.safeParse(rawInput);
  if (!validated.success) {
    return {
      success: false,
      message: validated.error.issues[0]?.message || 'Invalid form input.',
    };
  }

  const data = validated.data;
  const ip = await getClientIp();

  const submissionType =
    type === 'TOURNAMENT'
      ? SubmissionType.TOURNAMENT_ORGANIZER_REQUEST
      : SubmissionType.SCRIM_ORGANIZER_REQUEST;

  try {
    // 1. Rate limit: max 3 requests per user per 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRequestsCount = await prisma.submission.count({
      where: {
        submitterEmail: { equals: session.email, mode: 'insensitive' },
        type: { in: [SubmissionType.TOURNAMENT_ORGANIZER_REQUEST, SubmissionType.SCRIM_ORGANIZER_REQUEST] },
        createdAt: { gte: oneDayAgo },
      },
    });

    if (recentRequestsCount >= 3) {
      return {
        success: false,
        message: 'You have reached the limit of 3 organizer requests per 24 hours. Please wait before submitting another.',
      };
    }

    // 2. Reject if a request of the same type is already PENDING
    const existingPending = await prisma.submission.findFirst({
      where: {
        submitterEmail: { equals: session.email, mode: 'insensitive' },
        type: submissionType,
        status: SubmissionStatus.PENDING,
      },
    });

    if (existingPending) {
      return {
        success: false,
        message: `You already have a pending ${type.toLowerCase()} organizer request under review. Please await admin review before submitting a new one.`,
      };
    }

    // Compute formatted plannedDate and prizePool
    const plannedDate = data.eventDate
      ? data.eventTime
        ? `${data.eventDate} at ${data.eventTime}`
        : data.eventDate
      : data.plannedDate || 'Upcoming';

    const prizePool =
      data.prizePoolType === 'CUSTOM' && data.customPrizeAmount
        ? data.customPrizeAmount
        : data.prizePoolType === 'FUN'
        ? 'Just for Fun (No Cash Prize)'
        : data.prizePool || 'Just for Fun (No Cash Prize)';

    const entryType = data.entryType || 'FREE';
    const entryFee = entryType === 'PAID' ? (data.entryFee || 'Payable') : 'Free Entry';
    const format = data.format || 'Standard Competitive Rules';
    const discordOrContact = data.discordOrContact || session.email;
    const description = data.description || '';

    // Create submission: keep discordOrContact in rawData only, submitterPhone is null
    await prisma.submission.create({
      data: {
        type: submissionType,
        status: SubmissionStatus.PENDING,
        submitterName: session.ign,
        submitterEmail: session.email.toLowerCase().trim(),
        submitterPhone: null,
        rawData: {
          eventTitle: data.eventTitle,
          organizationOrClan: data.organizationOrClan || session.ign,
          eventDate: data.eventDate || null,
          eventTime: data.eventTime || null,
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
      `Submitted ${type.toLowerCase()} organizer permission request for "${data.eventTitle}".`,
      `Organizer: ${session.ign}`,
      'INFO',
      ip
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
  const ip = await getClientIp();

  // Validate decision at runtime
  const decisionValidation = z.enum(['APPROVE', 'REJECT']).safeParse(decision);
  if (!decisionValidation.success) {
    return { success: false, message: 'Invalid decision value. Must be APPROVE or REJECT.' };
  }

  try {
    const sub = await prisma.submission.findUnique({
      where: { id: requestId },
    });

    if (!sub) {
      return { success: false, message: 'Organizer request not found.' };
    }

    // Require sub.type to be an organizer type
    const organizerTypes: SubmissionType[] = [
      SubmissionType.TOURNAMENT_ORGANIZER_REQUEST,
      SubmissionType.SCRIM_ORGANIZER_REQUEST,
    ];
    if (!organizerTypes.includes(sub.type as SubmissionType)) {
      return { success: false, message: 'Invalid submission type. Must be an organizer request.' };
    }

    // Require sub.status === PENDING
    if (sub.status !== SubmissionStatus.PENDING) {
      return { success: false, message: 'Only PENDING organizer requests can be reviewed.' };
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

    // On approval, create the tournament as DRAFT (not PUBLISHED) and use the requested date if provided
    if (decision === 'APPROVE' && isTourney) {
      const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `tourney-${Date.now()}`;
      const uniqueSlug = `${slugBase}-${randomUUID().slice(0, 4)}`;

      // Parse requested date if provided
      let startDate = new Date();
      if (raw.eventDate && typeof raw.eventDate === 'string' && !isNaN(Date.parse(raw.eventDate))) {
        startDate = new Date(raw.eventDate);
      } else if (raw.plannedDate && typeof raw.plannedDate === 'string' && !isNaN(Date.parse(raw.plannedDate))) {
        startDate = new Date(raw.plannedDate);
      }

      await prisma.tournament.create({
        data: {
          slug: uniqueSlug,
          name: title,
          organizer: (raw.organizationOrClan as string) || sub.submitterName,
          tier: TournamentTier.COMMUNITY,
          status: TournamentStatus.UPCOMING,
          startDate,
          formatDescription: (raw.description as string) || (raw.format as string) || 'Approved Community Tournament',
          publishStatus: PublishStatus.DRAFT,
        },
      });
    }

    await recordAuditLog(
      decision === 'APPROVE' ? 'ORGANIZER_PERMISSION_GRANTED' : 'ORGANIZER_PERMISSION_REJECTED',
      admin.username,
      `${decision === 'APPROVE' ? 'Granted' : 'Declined'} organizer permission for ${sub.submitterEmail} (${title}).`,
      `Target: ${sub.submitterEmail}`,
      decision === 'APPROVE' ? 'SUCCESS' : 'WARNING',
      ip
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
