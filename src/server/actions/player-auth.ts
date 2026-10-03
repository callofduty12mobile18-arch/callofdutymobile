'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { recordAuditLog } from '../data/audit-store';
import { prisma } from '@/lib/db/prisma';
import { Prisma, PlayerRole, VerificationStatus, PublishStatus, EntityType, MediaType, SocialPlatform } from '@prisma/client';
import { safeHttpUrl, safeMediaUrl } from '@/lib/security';
import { verifyPassword } from '@/lib/auth/password';
import { getClientIp, rateLimit } from '@/lib/auth/rate-limit';
import { signSession, verifySession } from '@/lib/auth/session-token';
import { sendAccountLockoutEmail } from '@/lib/email/mailer';
import { logger } from '@/lib/logger';

export interface PlayerSession {
  email: string;
  ign: string;
  playerId: string;
  slug: string;
}

export interface PlayerAuthResponse {
  success: boolean;
  message: string;
  redirectUrl?: string;
}

const COOKIE_NAME = 'MobileRoster_player_session';

export async function loginPlayerAction(
  prevState: PlayerAuthResponse | null,
  formData: FormData
): Promise<PlayerAuthResponse> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = (formData.get('password') as string)?.trim();

  if (!email || !password) {
    return { success: false, message: 'Please provide both email and password credentials.' };
  }

  const ip = await getClientIp();
  const [ipAllowed, emailAllowed] = await Promise.all([
    rateLimit(`login:player:ip:${ip}`, 20, 15 * 60 * 1000),
    rateLimit(`login:player:id:${email}`, 5, 15 * 60 * 1000),
  ]);

  if (!ipAllowed || !emailAllowed) {
    return { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' };
  }

  let authenticatedUser: { id: string; email: string; ign?: string; slug?: string } | null = null;
  let matchingDbUser: { id: string; email: string; passwordHash: string | null } | null = null;

  // Query live PostgreSQL database
  try {
    const dbUser = await prisma.user.findUnique({
      where: { email },
      include: { players: true },
    });

    if (dbUser) {
      // Check Account Lockout status
      if (dbUser.lockedUntil && dbUser.lockedUntil > new Date()) {
        const remainingMinutes = Math.ceil((dbUser.lockedUntil.getTime() - Date.now()) / (60 * 1000));
        return {
          success: false,
          message: `Account is temporarily locked due to repeated failed attempts. Please try again in ${remainingMinutes} minute(s).`,
        };
      }

      if (dbUser.passwordHash) {
        const isMatch = await verifyPassword(password, dbUser.passwordHash);
        if (isMatch) {
          const primaryPlayer = dbUser.players?.[0];
          authenticatedUser = {
            id: dbUser.id,
            email: dbUser.email,
            ign: primaryPlayer?.ign || email.split('@')[0],
            slug: primaryPlayer?.slug || email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-'),
          };
          matchingDbUser = dbUser;

          // Reset failed attempts on success
          await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              failedLoginAttempts: 0,
              lockedUntil: null,
            },
          });
        } else {
          // Increment failed attempts and trigger lockout if >= 5
          const newFailedAttempts = dbUser.failedLoginAttempts + 1;
          const shouldLock = newFailedAttempts >= 5;
          const lockTime = shouldLock ? new Date(Date.now() + 30 * 60 * 1000) : null;

          await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              failedLoginAttempts: shouldLock ? 0 : newFailedAttempts,
              lockedUntil: lockTime,
            },
          });

          if (shouldLock) {
            await sendAccountLockoutEmail({
              to: dbUser.email,
              ip,
              lockoutMinutes: 30,
            });

            return {
              success: false,
              message: 'Account locked for 30 minutes following 5 consecutive failed login attempts. A security alert email has been sent.',
            };
          }
        }
      }
    }
  } catch (err) {
    logger.error('Database query error during player login:', err);
    return {
      success: false,
      message: 'Database authentication error. Please try again.',
    };
  }

  if (!authenticatedUser || !matchingDbUser) {
    return {
      success: false,
      message: 'Invalid credentials. Please verify the email and access key sent to your inbox.',
    };
  }

  const sessionData: PlayerSession = {
    email: authenticatedUser.email,
    ign: authenticatedUser.ign || email.split('@')[0],
    playerId: authenticatedUser.id,
    slug: authenticatedUser.slug || 'player',
  };

  const signedToken = await signSession(sessionData);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  // Audit Log in DB
  await recordAuditLog(
    'PLAYER_LOGGED_IN',
    sessionData.ign || email,
    `Player logged into studio with validated database credentials.`,
    `Player: ${sessionData.ign}`,
    'SUCCESS'
  );

  return {
    success: true,
    message: 'Login successful! Redirecting to your Profile Studio...',
    redirectUrl: '/player',
  };
}

export async function getPlayerSession(): Promise<PlayerSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    return await verifySession<PlayerSession>(token);
  } catch {
    return null;
  }
}

export async function logoutPlayerAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect('/player/login');
}

export async function updatePlayerSelfProfile(
  prevState: { success: boolean; message: string; slug?: string } | null,
  formData: FormData
) {
  const session = await getPlayerSession();
  if (!session) {
    return { success: false, message: 'Session expired. Please log in again.' };
  }

  const field = (key: string, max: number) => (formData.get(key) as string | null)?.trim().slice(0, max) ?? '';
  const ign = field('ign', 50);
  const displayName = field('displayName', 100);
  const realName = field('realName', 100);
  const primaryRoleInput = field('primaryRole', 20);
  const primaryRole = (Object.values(PlayerRole) as string[]).includes(primaryRoleInput)
    ? (primaryRoleInput as PlayerRole)
    : PlayerRole.FLEX;
  const state = field('state', 100);
  const MobileRosterUid = field('MobileRosterUid', 100);
  const joinedYear = field('joinedYear', 10000);
  const teamName = field('teamName', 100);
  const teamTag = field('teamTag', 10);
  const bio = field('bio', 5000);
  const seoKeywords = field('seoKeywords', 200);
  const seoDescription = field('seoDescription', 500);

  if (!ign) {
    return { success: false, message: 'IGN / Gamer Tag is required.' };
  }

  if (!MobileRosterUid) {
    return { success: false, message: 'MobileRoster UID is required.' };
  }

  const avatarRaw = field('avatarUrl', 5000000);
  const coverRaw = field('coverImageUrl', 5000000);
  const avatarUrl = avatarRaw ? safeMediaUrl(avatarRaw) : null;
  const coverImageUrl = coverRaw ? safeMediaUrl(coverRaw) : null;
  if ((avatarRaw && !avatarUrl) || (coverRaw && !coverImageUrl)) {
    return { success: false, message: 'Avatar and cover images must be uploaded files or valid image links.' };
  }

  const socials: Record<'youtubeUrl' | 'instagramUrl' | 'twitterUrl', string | null> = {
    youtubeUrl: null,
    instagramUrl: null,
    twitterUrl: null,
  };
  for (const key of Object.keys(socials) as (keyof typeof socials)[]) {
    const raw = field(key, 500);
    if (!raw) continue;
    const url = safeHttpUrl(raw);
    if (!url) return { success: false, message: 'Social links must be valid web addresses.' };
    socials[key] = url;
  }
  const { youtubeUrl, instagramUrl, twitterUrl } = socials;

  const newSlug = ign.toLowerCase().replace(/[^a-z0-9]/g, '-');

  const parseUrlList = (key: string, limit: number): string[] => {
    try {
      const parsed: unknown = JSON.parse(field(key, 20000) || '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed.map(safeMediaUrl).filter((u): u is string => !!u).slice(0, limit);
    } catch {
      return [];
    }
  };
  // Limit strictly to 5 photos and 2 videos
  const photoUrls = parseUrlList('photoFeed', 5);
  const videoUrls = parseUrlList('videoFeed', 2);

  // Resolve the profile owned by this account; a player may never edit someone else's profile.
  const ownedPlayer = await prisma.player.findFirst({
    where: { userId: session.playerId },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  const slugOwner = await prisma.player.findUnique({ where: { slug: newSlug }, select: { id: true } });
  if (slugOwner && slugOwner.id !== ownedPlayer?.id) {
    return { success: false, message: 'That IGN is already taken by another player. Please choose a different one.' };
  }

  // Live PostgreSQL database update
  try {
    const targetPublishStatus = PublishStatus.PUBLISHED;

    const teamSlug = teamName ? teamName.toLowerCase().replace(/[^a-z0-9]/g, '-') : null;

    // Concurrently execute Team and Player upserts
    const [team, player] = await Promise.all([
      teamSlug && teamName
        ? prisma.team.upsert({
            where: { slug: teamSlug },
            update: {},
            create: {
              slug: teamSlug,
              name: teamName,
              tag: teamTag || 'PRO',
              publishStatus: PublishStatus.PUBLISHED,
            },
          })
        : Promise.resolve(null),
      ownedPlayer
        ? prisma.player.update({
            where: { id: ownedPlayer.id },
            data: {
              slug: newSlug,
              ign,
              displayName: displayName || null,
              realName: realName || null,
              primaryRole,
              state: state || null,
              city: MobileRosterUid || null,
              avatarUrl,
              coverImageUrl,
              bio: bio || null,
              competitiveHistory: joinedYear || null,
              seoTitle: seoKeywords || null,
              seoDescription: seoDescription || null,
              publishStatus: targetPublishStatus,
            },
          })
        : prisma.player.create({
            data: {
              slug: newSlug,
              userId: session.playerId,
              ign,
              displayName: displayName || null,
              realName: realName || null,
              primaryRole,
              state: state || null,
              city: MobileRosterUid || null,
              avatarUrl,
              coverImageUrl,
              bio: bio || null,
              competitiveHistory: joinedYear || null,
              seoTitle: seoKeywords || null,
              seoDescription: seoDescription || null,
              publishStatus: targetPublishStatus,
              verificationStatus: VerificationStatus.UNVERIFIED,
            },
          }),
    ]);

    const mediaRecords = [
      ...photoUrls.map((url, i) => ({
        entityType: EntityType.PLAYER,
        playerId: player.id,
        mediaType: MediaType.IMAGE,
        fileName: `feed-photo-${i + 1}.jpg`,
        mimeType: 'image/jpeg',
        fileSizeBytes: 1024 * 1024,
        storagePath: url,
        publicUrl: url,
        caption: `Landscape Highlight Photo #${i + 1}`,
      })),
      ...videoUrls.map((url, i) => ({
        entityType: EntityType.PLAYER,
        playerId: player.id,
        mediaType: MediaType.VIDEO_CLIP,
        fileName: `feed-clip-${i + 1}.mp4`,
        mimeType: 'video/mp4',
        fileSizeBytes: 10 * 1024 * 1024,
        storagePath: url,
        publicUrl: url,
        durationSeconds: 60,
        caption: `Gameplay Highlight Clip #${i + 1}`,
      })),
    ];

    const socialLinkRecords: Array<{
      entityType: EntityType;
      playerId: string;
      platform: SocialPlatform;
      url: string;
      handle: string | null;
    }> = [];

    if (youtubeUrl) {
      socialLinkRecords.push({
        entityType: EntityType.PLAYER,
        playerId: player.id,
        platform: SocialPlatform.YOUTUBE,
        url: youtubeUrl,
        handle: youtubeUrl.split('/').pop() || null,
      });
    }

    if (instagramUrl) {
      socialLinkRecords.push({
        entityType: EntityType.PLAYER,
        playerId: player.id,
        platform: SocialPlatform.INSTAGRAM,
        url: instagramUrl,
        handle: instagramUrl.split('/').pop() || null,
      });
    }

    if (twitterUrl) {
      socialLinkRecords.push({
        entityType: EntityType.PLAYER,
        playerId: player.id,
        platform: SocialPlatform.TWITTER_X,
        url: twitterUrl,
        handle: twitterUrl.split('/').pop() || null,
      });
    }

    // Single transaction for membership, media, and social records
    const operations: Prisma.PrismaPromise<unknown>[] = [
      prisma.media.deleteMany({
        where: {
          playerId: player.id,
          entityType: EntityType.PLAYER,
        },
      }),
      prisma.socialLink.deleteMany({
        where: {
          playerId: player.id,
          entityType: EntityType.PLAYER,
        },
      }),
    ];

    if (team) {
      operations.push(
        prisma.teamMember.upsert({
          where: {
            teamId_playerId_isCurrent: {
              teamId: team.id,
              playerId: player.id,
              isCurrent: true,
            },
          },
          update: { role: 'ACTIVE_ROSTER' },
          create: {
            teamId: team.id,
            playerId: player.id,
            role: 'ACTIVE_ROSTER',
            isCurrent: true,
          },
        })
      );
    }

    if (mediaRecords.length > 0) {
      operations.push(
        prisma.media.createMany({
          data: mediaRecords,
        })
      );
    }

    if (socialLinkRecords.length > 0) {
      operations.push(
        prisma.socialLink.createMany({
          data: socialLinkRecords,
        })
      );
    }

    await prisma.$transaction(operations);
  } catch (err) {
    console.error('Database profile update error:', err);
    return {
      success: false,
      message: 'Failed to update profile in database. Please try again.',
    };
  }

  // Update session with signed token
  session.ign = ign;
  session.slug = newSlug;
  const updatedToken = await signSession(session);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, updatedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  // Audit Log in DB
  const mediaCount = photoUrls.length + videoUrls.length;
  await recordAuditLog(
    'PROFILE_UPDATED',
    ign,
    `Updated profile info (Role: ${primaryRole}, Team: ${teamTag || 'Free Agent'})${
      mediaCount > 0 ? ` and uploaded ${photoUrls.length} photos, ${videoUrls.length} clips` : ''
    }.`,
    `Player: ${ign} (/players/${newSlug})`,
    'INFO'
  );

  revalidatePath('/players');
  revalidatePath(`/players/${newSlug}`);
  revalidatePath('/player');
  revalidatePath('/admin/audit-logs');
  revalidatePath('/admin/media');

  return {
    success: true,
    message: 'Profile saved and published to the Player Directory!',
    slug: newSlug,
  };
}
