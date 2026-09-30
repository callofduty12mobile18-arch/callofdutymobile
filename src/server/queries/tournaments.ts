import { prisma } from '@/lib/db/prisma';
import { PublishStatus } from '@prisma/client';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

async function fetchPublishedTournaments() {
  try {
    const tournaments = await prisma.tournament.findMany({
      where: {
        publishStatus: PublishStatus.PUBLISHED,
        deletedAt: null,
      },
      include: {
        mvpPlayer: true,
        teamAchievements: {
          include: { team: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return tournaments || [];
  } catch (err) {
    console.error('Error fetching published tournaments:', err);
    return [];
  }
}

export const getPublishedTournaments = cache(async () => {
  const getCached = unstable_cache(
    async () => fetchPublishedTournaments(),
    ['published-tournaments-list'],
    { revalidate: 30, tags: ['tournaments'] }
  );
  return getCached();
});

async function fetchTournamentBySlug(slug: string) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { slug },
      include: {
        mvpPlayer: true,
        playerAchievements: {
          include: { player: true, achievement: true },
        },
        teamAchievements: {
          include: { team: true, achievement: true },
        },
        socialLinks: true,
        media: true,
      },
    });

    if (tournament && tournament.publishStatus === PublishStatus.PUBLISHED) {
      return tournament;
    }
  } catch (err) {
    console.error('Error fetching tournament by slug:', err);
  }

  return null;
}

export const getTournamentBySlug = cache(async (slug: string) => {
  const getCached = unstable_cache(
    async () => fetchTournamentBySlug(slug),
    [`tournament-${slug}`],
    { revalidate: 60, tags: ['tournaments', `tournament-${slug}`] }
  );
  return getCached();
});
