import { prisma } from '@/lib/db/prisma';
import { EntityType } from '@prisma/client';
import { cache } from 'react';

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

export const getAllPlayerMedia = cache(async () => {
  return fetchAllPlayerMedia();
});
