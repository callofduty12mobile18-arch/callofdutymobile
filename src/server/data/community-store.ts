import { randomBytes } from 'crypto';
import { PlayerRole, VerificationStatus, PublishStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { hashToken } from '@/lib/auth/tokens';

export interface CommunityRequestItem {
  id: string;
  email: string;
  fullName?: string;
  gamerTag?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  approvedAt?: string;
}

export type ApproveRequestResult =
  | {
      success: true;
      request: CommunityRequestItem;
      passwordResetToken: string;
      verificationToken: string;
      email: string;
      ign: string;
    }
  | {
      success: false;
      error: string;
    };

function isUuid(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Generate a unique player slug:
 * - Sanitizes lowercase alphanumeric characters and hyphens.
 * - Falls back to `player-<random4>` if the sanitized slug is empty.
 * - Suffixes -2, -3 on collision.
 */
export async function generateUniquePlayerSlug(
  ign: string,
  tx?: Prisma.TransactionClient,
  ignorePlayerId?: string
): Promise<string> {
  const client = tx || prisma;
  let baseSlug = ign
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!baseSlug) {
    baseSlug = `player-${randomBytes(2).toString('hex')}`;
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await client.player.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing || (ignorePlayerId && existing.id === ignorePlayerId)) {
      return slug;
    }
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

/**
 * Add a community access request directly to PostgreSQL database.
 */
export async function addCommunityRequest(
  email: string,
  fullName?: string,
  gamerTag?: string
): Promise<CommunityRequestItem> {
  const cleanEmail = email.trim().toLowerCase();

  // Check if a request for this email already exists in database
  const existingSub = await prisma.submission.findFirst({
    where: {
      submitterEmail: { equals: cleanEmail, mode: 'insensitive' },
      type: 'COMMUNITY_JOIN_REQUEST',
    },
    orderBy: { createdAt: 'desc' },
  });

  if (existingSub) {
    if (existingSub.status === 'REJECTED') {
      const updated = await prisma.submission.update({
        where: { id: existingSub.id },
        data: {
          status: 'PENDING',
          reviewedAt: null,
          submitterName: fullName || cleanEmail,
          rawData: {
            gamerTag: gamerTag || '',
            fullName: fullName || '',
          },
        },
      });
      return {
        id: updated.id,
        email: updated.submitterEmail,
        fullName: fullName || updated.submitterName,
        gamerTag: gamerTag || '',
        status: 'PENDING',
        createdAt: updated.createdAt.toISOString(),
      };
    }

    const raw = (existingSub.rawData as Record<string, string>) || {};
    return {
      id: existingSub.id,
      email: existingSub.submitterEmail,
      fullName: raw.fullName || existingSub.submitterName,
      gamerTag: raw.gamerTag || '',
      status: existingSub.status as 'PENDING' | 'APPROVED' | 'REJECTED',
      createdAt: existingSub.createdAt.toISOString(),
      approvedAt: existingSub.reviewedAt?.toISOString(),
    };
  }

  // Create new request in database
  const newSub = await prisma.submission.create({
    data: {
      type: 'COMMUNITY_JOIN_REQUEST',
      status: 'PENDING',
      submitterName: fullName || cleanEmail,
      submitterEmail: cleanEmail,
      rawData: {
        gamerTag: gamerTag || '',
        fullName: fullName || '',
      },
    },
  });

  return {
    id: newSub.id,
    email: newSub.submitterEmail,
    fullName: fullName || newSub.submitterName,
    gamerTag: gamerTag || '',
    status: 'PENDING',
    createdAt: newSub.createdAt.toISOString(),
  };
}

/**
 * Approve a community access request, provision User + Player in PostgreSQL database safely.
 * - Wrapped in prisma.$transaction.
 * - If a User with that email already exists, do not change role or passwordHash, return error "Account already exists".
 * - Never upsert Player by slug. Generates unique slug (suffix -2, -3 on collision; fallback to player-<random4>).
 * - Creates Player only if the user has none.
 * - Issues one-time password setup token & email verification token (stored as SHA-256 hashes).
 * - Never stores password in Submission.rawData.
 */
export async function approveRequest(requestId: string): Promise<ApproveRequestResult> {
  const whereConditions: Array<{ id?: string; submitterEmail?: string }> = [
    { submitterEmail: requestId.toLowerCase() },
  ];
  if (isUuid(requestId)) {
    whereConditions.push({ id: requestId });
  }

  const dbSub = await prisma.submission.findFirst({
    where: {
      OR: whereConditions,
      type: 'COMMUNITY_JOIN_REQUEST',
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!dbSub) {
    return { success: false, error: 'Request not found in database.' };
  }

  const email = dbSub.submitterEmail.trim().toLowerCase();
  const raw = (dbSub.rawData as Record<string, string>) || {};
  const fullName = raw.fullName || dbSub.submitterName || undefined;
  const gamerTag = raw.gamerTag || undefined;
  const defaultIgn = gamerTag || email.split('@')[0];

  // Generate one-time password setup token and verification token
  const passwordResetToken = randomBytes(32).toString('hex');
  const passwordResetTokenHash = hashToken(passwordResetToken);
  const passwordResetExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const verificationToken = randomBytes(32).toString('hex');
  const emailVerificationTokenHash = hashToken(verificationToken);
  const emailVerificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  try {
    const transactionResult = await prisma.$transaction(async (tx) => {
      // 1. Check if user already exists
      const existingUser = await tx.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('Account already exists');
      }

      // 2. Create User record with hashed tokens
      const user = await tx.user.create({
        data: {
          email,
          role: 'PLAYER',
          passwordHash: null,
          emailVerified: false,
          emailVerificationTokenHash,
          emailVerificationTokenExpiresAt,
          passwordResetTokenHash,
          passwordResetExpiresAt,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });

      // 3. Create Player only if user has none
      const existingPlayer = await tx.player.findFirst({
        where: { userId: user.id },
      });

      if (!existingPlayer) {
        const uniqueSlug = await generateUniquePlayerSlug(defaultIgn, tx);
        await tx.player.create({
          data: {
            slug: uniqueSlug,
            ign: defaultIgn,
            displayName: fullName || defaultIgn,
            realName: fullName || null,
            userId: user.id,
            primaryRole: PlayerRole.FLEX,
            publishStatus: PublishStatus.DRAFT,
            verificationStatus: VerificationStatus.UNVERIFIED,
          },
        });
      }

      // 4. Update submission without password in rawData
      const updatedSub = await tx.submission.update({
        where: { id: dbSub.id },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          rawData: {
            gamerTag: defaultIgn,
            fullName: fullName || '',
          },
        },
      });

      return {
        id: updatedSub.id,
        email: updatedSub.submitterEmail,
        fullName: fullName || updatedSub.submitterName,
        gamerTag: defaultIgn,
        status: 'APPROVED' as const,
        createdAt: updatedSub.createdAt.toISOString(),
        approvedAt: new Date().toISOString(),
      };
    });

    return {
      success: true,
      request: transactionResult,
      passwordResetToken,
      verificationToken,
      email,
      ign: defaultIgn,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('Account already exists')) {
      return { success: false, error: 'Account already exists' };
    }
    console.error('[COMMUNITY] approveRequest transaction failed:', err);
    return { success: false, error: errorMsg || 'Failed to approve request' };
  }
}

/**
 * Reject a community request in PostgreSQL database.
 */
export async function rejectRequest(requestId: string): Promise<boolean> {
  try {
    const whereConditions: Array<{ id?: string; submitterEmail?: string }> = [
      { submitterEmail: requestId.toLowerCase() },
    ];
    if (isUuid(requestId)) {
      whereConditions.push({ id: requestId });
    }

    const res = await prisma.submission.updateMany({
      where: {
        OR: whereConditions,
        type: 'COMMUNITY_JOIN_REQUEST',
      },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
      },
    });

    return res.count > 0;
  } catch (err) {
    console.error('[COMMUNITY] Error rejecting request in DB:', err);
    return false;
  }
}
