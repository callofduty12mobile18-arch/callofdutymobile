'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'crypto';
import { recordAuditLog } from '../data/audit-store';
import { prisma } from '@/lib/db/prisma';
import { Prisma, PlayerRole, VerificationStatus, PublishStatus, EntityType, MediaType, SocialPlatform, TeamMemberRole } from '@prisma/client';
import { safeHttpUrl, safeMediaUrl } from '@/lib/security';
import { verifyPassword, hashPassword } from '@/lib/auth/password';
import { hashToken } from '@/lib/auth/tokens';
import { passwordComplexitySchema } from '@/lib/validation/auth';
import { getClientIp, rateLimit } from '@/lib/auth/rate-limit';
import { signSession, verifySession } from '@/lib/auth/session-token';
import { sendAccountLockoutEmail, sendPasswordResetEmail } from '@/lib/email/mailer';
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
      message: 'Invalid credentials. Please verify your email and password.',
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
    'SUCCESS',
    ip
  );

  return {
    success: true,
    message: 'Welcome to Player Studio!',
    redirectUrl: '/player',
  };
}

/**
 * Server action to set/reset a player password using a one-time setup token.
 */
export async function setPasswordAction(
  prevState: { success: boolean; message: string } | null,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const token = (formData.get('token') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = (formData.get('password') as string)?.trim();
  const confirmPassword = (formData.get('confirmPassword') as string)?.trim();

  if (!token || !email) {
    return { success: false, message: 'Invalid or missing security token.' };
  }

  if (!password || !confirmPassword) {
    return { success: false, message: 'Please provide and confirm your new password.' };
  }

  if (password !== confirmPassword) {
    return { success: false, message: 'Passwords do not match.' };
  }

  const complexityCheck = passwordComplexitySchema.safeParse(password);
  if (!complexityCheck.success) {
    return {
      success: false,
      message: complexityCheck.error.issues[0]?.message || 'Password does not meet complexity requirements.',
    };
  }

  const ip = await getClientIp();
  const tokenHash = hashToken(token);

  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
        passwordResetTokenHash: tokenHash,
      },
    });

    if (!user) {
      return { success: false, message: 'Invalid or already used password setup link.' };
    }

    if (user.passwordResetExpiresAt && user.passwordResetExpiresAt < new Date()) {
      return { success: false, message: 'This password setup link has expired (24h limit). Please request a new link.' };
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    await recordAuditLog(
      'PROFILE_UPDATED',
      email,
      'Player password set successfully via one-time token link.',
      `User: ${email}`,
      'SUCCESS',
      ip
    );

    return {
      success: true,
      message: 'Your password has been set successfully! You can now log in.',
    };
  } catch (err) {
    logger.error('Error setting user password:', err);
    return { success: false, message: 'Failed to update password. Please try again.' };
  }
}

/**
 * Server action for players requesting a password reset link.
 */
export async function requestPasswordResetAction(
  prevState: { success: boolean; message: string } | null,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();

  if (!email || !email.includes('@')) {
    return { success: false, message: 'Please provide a valid email address.' };
  }

  const ip = await getClientIp();
  const [ipAllowed, emailAllowed] = await Promise.all([
    rateLimit(`pwd-reset:ip:${ip}`, 10, 15 * 60 * 1000),
    rateLimit(`pwd-reset:email:${email}`, 3, 15 * 60 * 1000),
  ]);

  if (!ipAllowed || !emailAllowed) {
    return {
      success: false,
      message: 'Too many password reset requests. Please wait 15 minutes before trying again.',
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { players: true },
    });

    if (user) {
      const resetToken = randomBytes(32).toString('hex');
      const resetTokenHash = hashToken(resetToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetTokenHash: resetTokenHash,
          passwordResetExpiresAt: expiresAt,
        },
      });

      const ign = user.players?.[0]?.ign || email.split('@')[0];

      await sendPasswordResetEmail({
        to: email,
        ign,
        token: resetToken,
      });

      await recordAuditLog(
        'STATUS_MODIFIED',
        email,
        `Password reset requested for ${email}.`,
        `User: ${email}`,
        'INFO',
        ip
      );
    }

    // Always return a generic success message to prevent user enumeration
    return {
      success: true,
      message: 'If an account exists with this email address, a password reset link has been dispatched to your inbox.',
    };
  } catch (err) {
    logger.error('Error during password reset request:', err);
    return {
      success: false,
      message: 'Failed to process password reset request. Please try again.',
    };
  }
}

export async function getPlayerSession(): Promise<PlayerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  return verifySession<PlayerSession>(token);
}

export async function logoutPlayerAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect('/player/login');
}

export async function updatePlayerSelfProfile(
  prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; message: string; slug?: string }> {
  const session = await getPlayerSession();
  if (!session) {
    return { success: false, message: 'Unauthorized session. Please log in again.' };
  }

  const ip = await getClientIp();

  // Retrieve user to check email verification status
  const user = await prisma.user.findUnique({
    where: { id: session.playerId },
    select: { id: true, emailVerified: true },
  });

  if (!user) {
    return { success: false, message: 'User account not found.' };
  }

  const field = (name: string, maxLen: number) => {
    const v = (formData.get(name) as string)?.trim();
    if (!v) return null;
    return v.slice(0, maxLen);
  };

  const ign = field('ign', 50);
  const displayName = field('displayName', 100);
  const realName = field('realName', 100);
  const primaryRoleInput = field('primaryRole', 20);
  const primaryRole = primaryRoleInput && (Object.values(PlayerRole) as string[]).includes(primaryRoleInput)
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
    return { success: false, message: 'CODM UID is required.' };
  }

  if (!/^\d{19}$/.test(MobileRosterUid)) {
    return { success: false, message: 'CODM UID must be exactly 19 digits.' };
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

  const parseUrlList = (key: string, limit: number): string[] => {
    try {
      const rawVal = (formData.get(key) as string)?.trim();
      if (!rawVal) return [];
      const parsed: unknown = JSON.parse(rawVal);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(safeMediaUrl).filter((u): u is string => !!u).slice(0, limit);
    } catch {
      return [];
    }
  };
  // Limit strictly to 5 photos and 2 videos
  const photoUrls = parseUrlList('photoFeed', 5);
  const videoUrls = parseUrlList('videoFeed', 2);

  // Resolve the profile owned by this account
  const ownedPlayer = await prisma.player.findFirst({
    where: {
      OR: [
        { userId: session.playerId },
        ...(session.slug ? [{ slug: session.slug }] : []),
        ...(session.ign ? [{ ign: { equals: session.ign, mode: 'insensitive' as const } }] : []),
      ],
    },
    orderBy: { createdAt: 'asc' },
  });

  // Slug generation: sanitize lowercase alphanumeric characters; fallback to player-<random4> if empty; suffix -2, -3 on collision
  let baseSlug = ign
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (!baseSlug) {
    baseSlug = `player-${randomBytes(2).toString('hex')}`;
  }

  let newSlug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.player.findUnique({
      where: { slug: newSlug },
      select: { id: true },
    });
    if (!existing || (ownedPlayer && existing.id === ownedPlayer.id)) {
      break;
    }
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  // Publication Rules:
  // 1. Never republish a profile an admin archived
  // 2. Enforce emailVerified before a player can publish (otherwise remains DRAFT)
  let targetPublishStatus: PublishStatus = PublishStatus.DRAFT;
  if (ownedPlayer && ownedPlayer.publishStatus === PublishStatus.ARCHIVED) {
    targetPublishStatus = PublishStatus.ARCHIVED;
  } else if (user.emailVerified) {
    targetPublishStatus = PublishStatus.PUBLISHED;
  } else {
    targetPublishStatus = PublishStatus.DRAFT;
  }

  // Verification Rules:
  // Changing IGN or UID resets verificationStatus to UNVERIFIED
  const ignChanged = ownedPlayer ? ownedPlayer.ign.trim().toLowerCase() !== ign.trim().toLowerCase() : false;
  const uidChanged = ownedPlayer ? (ownedPlayer.city || '').trim() !== (MobileRosterUid || '').trim() : false;

  let targetVerificationStatus: VerificationStatus = VerificationStatus.UNVERIFIED;
  let targetVerifiedAt: Date | null = null;
  if (ownedPlayer && !ignChanged && !uidChanged) {
    targetVerificationStatus = ownedPlayer.verificationStatus;
    targetVerifiedAt = ownedPlayer.verifiedAt;
  }

  // Live PostgreSQL database update
  try {
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
              userId: ownedPlayer.userId || session.playerId,
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
              verificationStatus: targetVerificationStatus,
              verifiedAt: targetVerifiedAt,
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
              verificationStatus: targetVerificationStatus,
              verifiedAt: targetVerifiedAt,
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
        url: youtubeUrl.slice(0, 250),
        handle: (youtubeUrl.split('/').pop() || '').slice(0, 100) || null,
      });
    }

    if (instagramUrl) {
      socialLinkRecords.push({
        entityType: EntityType.PLAYER,
        playerId: player.id,
        platform: SocialPlatform.INSTAGRAM,
        url: instagramUrl.slice(0, 250),
        handle: (instagramUrl.split('/').pop() || '').slice(0, 100) || null,
      });
    }

    if (twitterUrl) {
      socialLinkRecords.push({
        entityType: EntityType.PLAYER,
        playerId: player.id,
        platform: SocialPlatform.TWITTER_X,
        url: twitterUrl.slice(0, 250),
        handle: (twitterUrl.split('/').pop() || '').slice(0, 100) || null,
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
        prisma.teamMember.updateMany({
          where: {
            playerId: player.id,
            isCurrent: true,
            NOT: { teamId: team.id },
          },
          data: { isCurrent: false, leftAt: new Date() },
        })
      );
      operations.push(
        prisma.teamMember.upsert({
          where: {
            teamId_playerId_isCurrent: {
              teamId: team.id,
              playerId: player.id,
              isCurrent: true,
            },
          },
          update: { role: TeamMemberRole.ACTIVE_ROSTER, isCurrent: true, leftAt: null },
          create: {
            teamId: team.id,
            playerId: player.id,
            role: TeamMemberRole.ACTIVE_ROSTER,
            isCurrent: true,
          },
        })
      );
    } else {
      operations.push(
        prisma.teamMember.updateMany({
          where: {
            playerId: player.id,
            isCurrent: true,
          },
          data: { isCurrent: false, leftAt: new Date() },
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
    logger.error('Database profile update error:', err);
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
    }. Status: ${targetPublishStatus}.`,
    `Player: ${ign} (/players/${newSlug})`,
    'INFO',
    ip
  );

  revalidatePath('/players');
  revalidatePath(`/players/${newSlug}`);
  revalidatePath('/player');
  revalidatePath('/admin/audit-logs');
  revalidatePath('/admin/media');

  const statusMsg =
    targetPublishStatus === PublishStatus.PUBLISHED
      ? 'Profile saved and published to the Player Directory!'
      : targetPublishStatus === PublishStatus.ARCHIVED
      ? 'Profile updated (remains archived by Admin).'
      : 'Profile saved in DRAFT mode. Please verify your email to publish.';

  return {
    success: true,
    message: statusMsg,
    slug: newSlug,
  };
}
