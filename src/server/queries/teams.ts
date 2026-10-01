import { prisma } from '@/lib/db/prisma';
import { PublishStatus } from '@prisma/client';
import { cache } from 'react';

async function fetchPublishedTeams() {
  try {
    const teams = await prisma.team.findMany({
      where: {
        publishStatus: PublishStatus.PUBLISHED,
        deletedAt: null,
      },
      include: {
        organization: true,
        members: {
          where: { isCurrent: true },
          include: { player: true },
        },
        achievements: {
          include: { achievement: true, tournament: true },
          take: 3,
        },
      },
      orderBy: { name: 'asc' },
    });

    return teams || [];
  } catch (err) {
    console.error('Error fetching published teams:', err);
    return [];
  }
}

export const getPublishedTeams = cache(async () => {
  return fetchPublishedTeams();
});

async function fetchTeamBySlug(slug: string) {
  try {
    const team = await prisma.team.findUnique({
      where: { slug },
      include: {
        organization: true,
        members: {
          include: { player: true },
        },
        achievements: {
          include: { achievement: true, tournament: true },
          orderBy: { dateAwarded: 'desc' },
        },
        socialLinks: true,
        media: true,
      },
    });

    if (team && team.publishStatus === PublishStatus.PUBLISHED) {
      return team;
    }
  } catch (err) {
    console.error('Error fetching team by slug:', err);
  }

  return null;
}

export const getTeamBySlug = cache(async (slug: string) => {
  return fetchTeamBySlug(slug);
});
