import { prisma } from '@/lib/db/prisma';
import { EntityType } from '@prisma/client';
import { unstable_cache } from 'next/cache';

async function fetchAllPlayerMedia() {
  try {
    const media = await prisma.media.findMany({
      where: {
        entityType: EntityType.PLAYER,
      },
      include: {
        player: {
          select: {
            id: true,
            slug: true,
            ign: true,
            displayName: true,
            avatarUrl: true,
            primaryRole: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return media || [];
  } catch (err) {
    console.error('Error fetching player media:', err);
    return [];
  }
}

export async function getAllPlayerMedia() {
  const getCached = unstable_cache(
    async () => fetchAllPlayerMedia(),
    ['all-player-media-list'],
    { revalidate: 30, tags: ['media'] }
  );
  return getCached();
}
