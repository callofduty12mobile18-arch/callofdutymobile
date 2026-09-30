import { PlayerRole, VerificationStatus, PublishStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

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

export interface PlayerAccount {
  email: string;
  password: string;
  playerId: string;
  ign: string;
}

// Global runtime store initialized clean with zero demo data
const globalStore = globalThis as unknown as {
  communityRequests?: CommunityRequestItem[];
  playerAccounts?: PlayerAccount[];
};

if (!globalStore.communityRequests) {
  globalStore.communityRequests = [];
}

if (!globalStore.playerAccounts) {
  globalStore.playerAccounts = [];
}

export const communityRequests = globalStore.communityRequests;
export const playerAccounts = globalStore.playerAccounts;

function isUuid(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export async function addCommunityRequest(email: string, fullName?: string, gamerTag?: string): Promise<CommunityRequestItem> {
  const cleanEmail = email.trim().toLowerCase();
  const existing = communityRequests.find((r) => r.email.toLowerCase() === cleanEmail);
  if (existing) {
    if (existing.status === 'REJECTED') {
      existing.status = 'PENDING';
      existing.createdAt = new Date().toISOString();
    }
    return existing;
  }

  const newRequest: CommunityRequestItem = {
    id: `req-${Date.now()}`,
    email: cleanEmail,
    fullName: fullName?.trim(),
    gamerTag: gamerTag?.trim(),
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  communityRequests.unshift(newRequest);

  // If live database is available, record to submissions table
  try {
    const sub = await prisma.submission.create({
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
    if (sub?.id) {
      newRequest.id = sub.id;
    }
  } catch (err) {
    console.error('[COMMUNITY STORE] Error creating submission in DB:', err);
  }

  return newRequest;
}

export async function approveRequest(requestId: string): Promise<{ request: CommunityRequestItem; credentials: { email: string; password: string } } | null> {
  let req = communityRequests.find((r) => r.id === requestId || r.email.toLowerCase() === requestId.toLowerCase());

  let email = req?.email;
  let fullName = req?.fullName;
  let gamerTag = req?.gamerTag;

  // If not found in in-memory store or if it's a DB UUID, query the database
  if (!req || !email) {
    try {
      const whereConditions: Array<{ id?: string; submitterEmail?: string }> = [
        { submitterEmail: requestId.toLowerCase() },
      ];
      if (isUuid(requestId)) {
        whereConditions.push({ id: requestId });
      }

      const dbSub = await prisma.submission.findFirst({
        where: {
          OR: whereConditions,
        },
      });

      if (dbSub) {
        const raw = (dbSub.rawData as Record<string, string>) || {};
        email = dbSub.submitterEmail;
        fullName = raw.fullName || dbSub.submitterName || undefined;
        gamerTag = raw.gamerTag || undefined;

        req = {
          id: dbSub.id,
          email: dbSub.submitterEmail,
          fullName,
          gamerTag,
          status: 'APPROVED',
          createdAt: dbSub.createdAt.toISOString(),
          approvedAt: new Date().toISOString(),
        };

        // Sync into in-memory store
        const existingIdx = communityRequests.findIndex((r) => r.id === dbSub.id || r.email.toLowerCase() === email?.toLowerCase());
        if (existingIdx >= 0) {
          communityRequests[existingIdx] = req;
        } else {
          communityRequests.unshift(req);
        }
      }
    } catch (err) {
      console.error('[COMMUNITY STORE] Database lookup error during approval:', err);
    }
  }

  if (!req || !email) {
    console.error(`[COMMUNITY STORE] Request ID ${requestId} not found in database or memory.`);
    return null;
  }

  // Generate secure credentials
  const randomPin = Math.floor(1000 + Math.random() * 9000);
  const password = `CODM-PRO-${randomPin}`;

  req.status = 'APPROVED';
  req.generatedPassword = password;
  req.approvedAt = new Date().toISOString();

  const defaultIgn = gamerTag || email.split('@')[0];
  const newPlayerId = `p-${Date.now()}`;
  const slug = defaultIgn.toLowerCase().replace(/[^a-z0-9]/g, '-');

  playerAccounts.push({
    email,
    password,
    playerId: newPlayerId,
    ign: defaultIgn,
  });

  // If live database is available, create/update User, Player, and Submission records in a fast atomic batch
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash: password, role: 'PLAYER' },
      create: {
        email,
        passwordHash: password,
        role: 'PLAYER',
      },
    });

    const whereConditions: Array<{ id?: string; submitterEmail?: string }> = [
      { submitterEmail: email },
    ];
    if (isUuid(requestId)) {
      whereConditions.push({ id: requestId });
    }
    if (isUuid(req.id)) {
      whereConditions.push({ id: req.id });
    }

    await Promise.all([
      prisma.player.upsert({
        where: { slug },
        update: {
          ign: defaultIgn,
          displayName: fullName || defaultIgn,
          userId: user.id,
          publishStatus: PublishStatus.PUBLISHED,
          verificationStatus: VerificationStatus.VERIFIED,
        },
        create: {
          slug,
          ign: defaultIgn,
          displayName: fullName || defaultIgn,
          realName: fullName || null,
          userId: user.id,
          primaryRole: PlayerRole.FLEX,
          publishStatus: PublishStatus.PUBLISHED,
          verificationStatus: VerificationStatus.VERIFIED,
        },
      }),
      prisma.submission.updateMany({
        where: {
          OR: whereConditions,
        },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          rawData: {
            gamerTag: defaultIgn,
            fullName: fullName || '',
            password: password,
          },
        },
      }),
    ]);
  } catch (err) {
    console.error('[COMMUNITY STORE] Error persisting approved user/player to DB:', err);
  }

  return {
    request: req,
    credentials: {
      email,
      password,
    },
  };
}

export async function rejectRequest(requestId: string): Promise<boolean> {
  const req = communityRequests.find((r) => r.id === requestId || r.email.toLowerCase() === requestId.toLowerCase());
  if (req) {
    req.status = 'REJECTED';
  }

  try {
    const whereConditions: Array<{ id?: string; submitterEmail?: string }> = [];
    if (isUuid(requestId)) {
      whereConditions.push({ id: requestId });
    }
    if (req?.email) {
      whereConditions.push({ submitterEmail: req.email });
    }

    if (whereConditions.length > 0) {
      await prisma.submission.updateMany({
        where: {
          OR: whereConditions,
        },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
        },
      });
    }
    return true;
  } catch (err) {
    console.error('[COMMUNITY STORE] Error rejecting request in DB:', err);
    return req ? true : false;
  }
}
