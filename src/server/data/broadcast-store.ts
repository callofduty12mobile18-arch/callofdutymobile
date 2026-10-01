import { prisma } from '@/lib/db/prisma';
import { unstable_cache } from 'next/cache';

export interface BroadcastHistoryItem {
  id: string;
  subject: string;
  headline: string;
  badgeTitle: string;
  recipientCount: number;
  sentAt: string;
  status: 'SENT' | 'FAILED' | 'PARTIAL';
}

/**
 * Persist a broadcast dispatch record directly to PostgreSQL database.
 */
export async function addBroadcastRecord(item: Omit<BroadcastHistoryItem, 'id' | 'sentAt'>): Promise<BroadcastHistoryItem> {
  const sentAt = new Date();

  try {
    const created = await prisma.broadcast.create({
      data: {
        subject: item.subject,
        headline: item.headline,
        badgeTitle: item.badgeTitle,
        bodyContent: '',
        recipientCount: item.recipientCount,
        status: item.status,
      },
    });

    return {
      id: created.id,
      subject: created.subject,
      headline: created.headline,
      badgeTitle: created.badgeTitle,
      recipientCount: created.recipientCount,
      status: created.status as 'SENT' | 'FAILED' | 'PARTIAL',
      sentAt: created.createdAt.toISOString(),
    };
  } catch (err) {
    console.error('[BROADCAST] Error creating broadcast record in DB:', err);
    return {
      id: `bc-${Date.now()}`,
      ...item,
      sentAt: sentAt.toISOString(),
    };
  }
}

/**
 * Fetch broadcast dispatch history from PostgreSQL database.
 */
async function fetchDbBroadcastHistory(): Promise<BroadcastHistoryItem[]> {
  try {
    const dbBroadcasts = await prisma.broadcast.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return dbBroadcasts.map((b) => ({
      id: b.id,
      subject: b.subject,
      headline: b.headline,
      badgeTitle: b.badgeTitle,
      recipientCount: b.recipientCount,
      status: b.status as 'SENT' | 'FAILED' | 'PARTIAL',
      sentAt: b.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error('[BROADCAST] Error querying broadcast history from DB:', err);
    return [];
  }
}

export async function getDbBroadcastHistory(): Promise<BroadcastHistoryItem[]> {
  const getCached = unstable_cache(
    fetchDbBroadcastHistory,
    ['db-broadcast-history-list'],
    { revalidate: 30, tags: ['broadcast'] }
  );
  return getCached();
}
