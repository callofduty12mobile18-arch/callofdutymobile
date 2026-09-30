import { prisma } from '@/lib/db/prisma';

export interface BroadcastHistoryItem {
  id: string;
  subject: string;
  headline: string;
  badgeTitle: string;
  recipientCount: number;
  sentAt: string;
  status: 'SENT' | 'FAILED' | 'PARTIAL';
}

const globalStore = globalThis as unknown as {
  broadcastHistory?: BroadcastHistoryItem[];
};

if (!globalStore.broadcastHistory) {
  globalStore.broadcastHistory = [];
}

export const broadcastHistory = globalStore.broadcastHistory;

export async function addBroadcastRecord(item: Omit<BroadcastHistoryItem, 'id' | 'sentAt'>) {
  const sentAt = new Date().toISOString();
  const record: BroadcastHistoryItem = {
    id: `bc-${Date.now()}`,
    ...item,
    sentAt,
  };

  broadcastHistory.unshift(record);

  try {
    await prisma.broadcast.create({
      data: {
        subject: item.subject,
        headline: item.headline,
        badgeTitle: item.badgeTitle,
        bodyContent: '',
        recipientCount: item.recipientCount,
        status: item.status,
      },
    });
  } catch {
    // Database connection fallback
  }

  return record;
}

import { unstable_cache } from 'next/cache';

async function fetchDbBroadcastHistory(): Promise<BroadcastHistoryItem[]> {
  try {
    const dbBroadcasts = await prisma.broadcast.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    if (dbBroadcasts && dbBroadcasts.length > 0) {
      return dbBroadcasts.map((b) => ({
        id: b.id,
        subject: b.subject,
        headline: b.headline,
        badgeTitle: b.badgeTitle,
        recipientCount: b.recipientCount,
        status: b.status as 'SENT' | 'FAILED' | 'PARTIAL',
        sentAt: b.createdAt.toISOString(),
      }));
    }
  } catch {
    // Database fallback
  }

  return [...broadcastHistory];
}

export async function getDbBroadcastHistory(): Promise<BroadcastHistoryItem[]> {
  const getCached = unstable_cache(
    fetchDbBroadcastHistory,
    ['db-broadcast-history-list'],
    { revalidate: 30, tags: ['broadcast'] }
  );
  return getCached();
}
