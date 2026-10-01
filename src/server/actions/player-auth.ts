'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { recordAuditLog } from '../data/audit-store';
import { prisma } from '@/lib/db/prisma';
import { PlayerRole, VerificationStatus, PublishStatus, EntityType, MediaType, SocialPlatform } from '@prisma/client';
import { verifyPassword } from '@/lib/auth/password';
import { getClientIp, rateLimit } from '@/lib/auth/rate-limit';
import { signSession, verifySession } from '@/lib/auth/session-token';

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

const COOKIE_NAME = 'codm_player_session';

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
  if (
    !rateLimit(`login:player:ip:${ip}`, 20, 15 * 60 * 1000) ||
    !rateLimit(`login:player:id:${email}`, 5, 15 * 60 * 1000)
  ) {
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

    if (dbUser && dbUser.passwordHash) {
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
      }
    }
  } catch (err) {
    console.error('Database query error during player login:', err);
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

  const ign = (formData.get('ign') as string)?.trim();
  const displayName = (formData.get('displayName') as string)?.trim();
  const realName = (formData.get('realName') as string)?.trim();
  const primaryRole = (formData.get('primaryRole') as PlayerRole) || 'FLEX';
  const state = (formData.get('state') as string)?.trim();
  const codmUid = (formData.get('codmUid') as string)?.trim();
  const joinedYear = (formData.get('joinedYear') as string)?.trim();
  const avatarUrl = (formData.get('avatarUrl') as string)?.trim();
  const coverImageUrl = (formData.get('coverImageUrl') as string)?.trim();
  const teamName = (formData.get('teamName') as string)?.trim();
  const teamTag = (formData.get('teamTag') as string)?.trim();
  const bio = (formData.get('bio') as string)?.trim();
  const youtubeUrl = (formData.get('youtubeUrl') as string)?.trim();
  const instagramUrl = (formData.get('instagramUrl') as string)?.trim();
  const twitterUrl = (formData.get('twitterUrl') as string)?.trim();
  const seoKeywords = (formData.get('seoKeywords') as string)?.trim();
  const seoDescription = (formData.get('seoDescription') as string)?.trim();

  if (!ign) {
    return { success: false, message: 'IGN / Gamer Tag is required.' };
  }

  const newSlug = ign.toLowerCase().replace(/[^a-z0-9]/g, '-');

  let photoUrls: string[] = [];
  let videoUrls: string[] = [];

  const photoFeedJson = (formData.get('photoFeed') as string)?.trim();
  const videoFeedJson = (formData.get('videoFeed') as string)?.trim();

  try {
    if (photoFeedJson) photoUrls = JSON.parse(photoFeedJson);
  } catch {
    // fallback
  }
  try {
    if (videoFeedJson) videoUrls = JSON.parse(videoFeedJson);
  } catch {
    // fallback
  }

  // Limit strictly to 5 photos and 2 videos
  photoUrls = photoUrls.filter(Boolean).slice(0, 5);
  videoUrls = videoUrls.filter(Boolean).slice(0, 2);

  // Live PostgreSQL database update
  try {
    const teamSlug = teamName ? teamName.toLowerCase().replace(/[^a-z0-9]/g, '-') : null;

    // Concurrently execute Team and Player upserts
    const [team, player] = await Promise.all([
      teamSlug && teamName
        ? prisma.team.upsert({
            where: { slug: teamSlug },
            update: { name: teamName, tag: teamTag || 'PRO' },
            create: {
              slug: teamSlug,
              name: teamName,
              tag: teamTag || 'PRO',
              publishStatus: PublishStatus.PUBLISHED,
            },
          })
        : Promise.resolve(null),
      prisma.player.upsert({
        where: { slug: newSlug },
        update: {
          ign,
          displayName: displayName || null,
          realName: realName || null,
          primaryRole,
          state: state || null,
          city: codmUid || null,
          avatarUrl: avatarUrl || null,
          coverImageUrl: coverImageUrl || null,
          bio: bio || null,
          competitiveHistory: joinedYear || null,
          seoTitle: seoKeywords || null,
          seoDescription: seoDescription || null,
          publishStatus: PublishStatus.PUBLISHED,
          verificationStatus: VerificationStatus.VERIFIED,
        },
        create: {
          slug: newSlug,
          ign,
          displayName: displayName || null,
          realName: realName || null,
          primaryRole,
          state: state || null,
          city: codmUid || null,
          avatarUrl: avatarUrl || null,
          coverImageUrl: coverImageUrl || null,
          bio: bio || null,
          competitiveHistory: joinedYear || null,
          seoTitle: seoKeywords || null,
          seoDescription: seoDescription || null,
          publishStatus: PublishStatus.PUBLISHED,
          verificationStatus: VerificationStatus.VERIFIED,
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
        url: youtubeUrl.startsWith('http') ? youtubeUrl : `https://${youtubeUrl}`,
        handle: youtubeUrl.split('/').pop() || null,
      });
    }

    if (instagramUrl) {
      socialLinkRecords.push({
        entityType: EntityType.PLAYER,
        playerId: player.id,
        platform: SocialPlatform.INSTAGRAM,
        url: instagramUrl.startsWith('http') ? instagramUrl : `https://${instagramUrl}`,
        handle: instagramUrl.split('/').pop() || null,
      });
    }

    if (twitterUrl) {
      socialLinkRecords.push({
        entityType: EntityType.PLAYER,
        playerId: player.id,
        platform: SocialPlatform.TWITTER_X,
        url: twitterUrl.startsWith('http') ? twitterUrl : `https://${twitterUrl}`,
        handle: twitterUrl.split('/').pop() || null,
      });
    }

    // Single transaction for membership, media, and social records
    const operations: any[] = [
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
    message: 'Profile saved and published to the database successfully!',
    slug: newSlug,
  };
}
