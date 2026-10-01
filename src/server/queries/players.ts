import { prisma } from '@/lib/db/prisma';
import { PlayerRole, VerificationStatus, PublishStatus } from '@prisma/client';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

export interface PlayerFilterParams {
  query?: string;
  role?: PlayerRole;
  state?: string;
  verifiedOnly?: boolean;
  page?: number;
  limit?: number;
}

async function fetchPublishedPlayers(params: PlayerFilterParams = {}) {
  const { query, role, state, verifiedOnly, page = 1, limit = 20 } = params;

  try {
    const where: Record<string, unknown> = {
      publishStatus: PublishStatus.PUBLISHED,
      deletedAt: null,
    };

    if (query) {
      where.OR = [
        { ign: { contains: query, mode: 'insensitive' } },
        { displayName: { contains: query, mode: 'insensitive' } },
        { realName: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.primaryRole = role;
    }

    if (state) {
      where.state = state;
    }

    if (verifiedOnly) {
      where.verificationStatus = VerificationStatus.VERIFIED;
    }

    const [players, total] = await Promise.all([
      prisma.player.findMany({
        where,
        include: {
          teamMemberships: {
            where: { isCurrent: true },
            include: { team: true },
          },
          achievements: {
            include: { achievement: true, tournament: true },
            take: 3,
          },
          socialLinks: true,
        },
        orderBy: [{ verificationStatus: 'asc' }, { updatedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.player.count({ where }),
    ]);

    return {
      players: players || [],
      total: total || 0,
      totalPages: Math.ceil((total || 0) / limit),
    };
  } catch (err) {
    console.error('Error fetching published players:', err);
    return {
      players: [],
      total: 0,
      totalPages: 0,
    };
  }
}

export const getPublishedPlayers = cache(async (params: PlayerFilterParams = {}) => {
  const cacheKey = `players-list-${JSON.stringify(params)}`;
  const getCached = unstable_cache(
    async () => fetchPublishedPlayers(params),
    [cacheKey],
    { revalidate: 30, tags: ['players'] }
  );
  return getCached();
});

async function fetchPlayerBySlug(slug: string) {
  try {
    let player = await prisma.player.findUnique({
      where: { slug },
      include: {
        teamMemberships: {
          include: { team: true },
        },
        teamHistory: {
          include: { team: true },
          orderBy: { startDate: 'desc' },
        },
        achievements: {
          include: { achievement: true, tournament: true, team: true },
          orderBy: { dateAwarded: 'desc' },
        },
        socialLinks: true,
        media: {
          orderBy: { createdAt: 'desc' },
        },
        mvpTournaments: true,
      },
    });

    if (!player) {
      player = await prisma.player.findFirst({
        where: {
          OR: [
            { slug: slug.toLowerCase() },
            { ign: { equals: slug.replace(/-/g, ' '), mode: 'insensitive' } },
            { ign: { equals: slug, mode: 'insensitive' } },
          ],
        },
        include: {
          teamMemberships: {
            include: { team: true },
          },
          teamHistory: {
            include: { team: true },
            orderBy: { startDate: 'desc' },
          },
          achievements: {
            include: { achievement: true, tournament: true, team: true },
            orderBy: { dateAwarded: 'desc' },
          },
          socialLinks: true,
          media: {
            orderBy: { createdAt: 'desc' },
          },
          mvpTournaments: true,
        },
      });
    }

    if (player && !player.deletedAt) {
      return player;
    }
  } catch (err) {
    console.error('Error fetching player by slug:', err);
  }

  return null;
}

export const getPlayerBySlug = cache(async (slug: string) => {
  const getCached = unstable_cache(
    async () => fetchPlayerBySlug(slug),
    [`player-slug-${slug}`],
    { revalidate: 30, tags: ['players', `player-${slug}`] }
  );
  return getCached();
});

async function fetchPlayerForStudio(slug: string) {
  try {
    const player = await prisma.player.findUnique({
      where: { slug },
      include: {
        teamMemberships: {
          where: { isCurrent: true },
          include: { team: true },
        },
        socialLinks: true,
        media: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return player;
  } catch (err) {
    console.error('Error fetching player for studio:', err);
  }
  return null;
}

export const getPlayerForStudio = cache(async (slug: string) => {
  return fetchPlayerForStudio(slug);
});

export async function getLookingForTeamPlayers(role?: PlayerRole) {
  try {
    const where: Record<string, unknown> = {
      publishStatus: PublishStatus.PUBLISHED,
      deletedAt: null,
      isLookingForTeam: true,
    };

    if (role) {
      where.primaryRole = role;
    }

    const players = await prisma.player.findMany({
      where,
      include: {
        teamMemberships: {
          where: { isCurrent: true },
          include: { team: true },
        },
        achievements: {
          include: { achievement: true },
          take: 3,
        },
        socialLinks: true,
      },
      orderBy: [{ verificationStatus: 'asc' }, { updatedAt: 'desc' }],
      take: 50,
    });

    return players;
  } catch (err) {
    console.error('Error fetching LFT players:', err);
    return [];
  }
}

