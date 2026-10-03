import { randomBytes } from 'crypto';
import { PlayerRole, VerificationStatus, PublishStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/password';

export interface CommunityRequestItem {
  id: string;
  email: string;
  fullName?: string;
  gamerTag?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  generatedPassword?: string;
  createdAt: string;
  approvedAt?: string;
}

function isUuid(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
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
 * Approve a community access request, provision User + Player in PostgreSQL database.
 */
export async function approveRequest(
  requestId: string
): Promise<{
  request: CommunityRequestItem;
  credentials: { email: string; password: string };
  verificationToken: string;
} | null> {
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
    console.error(`[COMMUNITY] Request ID ${requestId} not found in database.`);
    return null;
  }

  const email = dbSub.submitterEmail.trim().toLowerCase();
  const raw = (dbSub.rawData as Record<string, string>) || {};
  const fullName = raw.fullName || dbSub.submitterName || undefined;
  const gamerTag = raw.gamerTag || undefined;

  // Use existing generated password if available; otherwise create a secure randomized access key
  let plainPassword = (raw as Record<string, string>).password;
  if (!plainPassword) {
    const randomSuffix = randomBytes(8).toString('hex').toUpperCase();
    plainPassword = `CODM#${randomSuffix}!`;
  }
  const hashedPassword = await hashPassword(plainPassword);

  const verificationToken = randomBytes(24).toString('hex');
  const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const defaultIgn = gamerTag || email.split('@')[0];
  const slug = defaultIgn.toLowerCase().replace(/[^a-z0-9]/g, '-');

  // Persist User, Player, and updated Submission in PostgreSQL
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hashedPassword,
      role: 'PLAYER',
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiresAt: tokenExpiresAt,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email,
      passwordHash: hashedPassword,
      role: 'PLAYER',
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiresAt: tokenExpiresAt,
    },
  });

  // Player profile stays in DRAFT until email is verified
  await Promise.all([
    prisma.player.upsert({
      where: { slug },
      update: {
        ign: defaultIgn,
        displayName: fullName || defaultIgn,
        userId: user.id,
        publishStatus: PublishStatus.DRAFT,
        verificationStatus: VerificationStatus.UNVERIFIED,
      },
      create: {
        slug,
        ign: defaultIgn,
        displayName: fullName || defaultIgn,
        realName: fullName || null,
        userId: user.id,
        primaryRole: PlayerRole.FLEX,
        publishStatus: PublishStatus.DRAFT,
        verificationStatus: VerificationStatus.UNVERIFIED,
      },
    }),
    prisma.submission.update({
      where: { id: dbSub.id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        rawData: {
          gamerTag: defaultIgn,
          fullName: fullName || '',
          password: plainPassword,
        },
      },
    }),
  ]);

  const reqItem: CommunityRequestItem = {
    id: dbSub.id,
    email,
    fullName,
    gamerTag,
    status: 'APPROVED',
    generatedPassword: plainPassword,
    createdAt: dbSub.createdAt.toISOString(),
    approvedAt: new Date().toISOString(),
  };

  return {
    request: reqItem,
    credentials: {
      email,
      password: plainPassword,
    },
    verificationToken,
  };
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
