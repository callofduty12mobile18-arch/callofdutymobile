'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { sendBroadcastEmail } from '@/lib/email/mailer';
import { playerAccounts, communityRequests } from '../data/community-store';
import { recordAuditLog } from '../data/audit-store';
import { addBroadcastRecord, getDbBroadcastHistory, BroadcastHistoryItem } from '../data/broadcast-store';

import { unstable_cache } from 'next/cache';

async function fetchBroadcastRecipientEmails(): Promise<string[]> {
  const emailSet = new Set<string>();

  // 1. From live Database
  try {
    const users = await prisma.user.findMany({
      select: { email: true },
    });
    users.forEach((u) => {
      if (u.email && u.email.includes('@')) emailSet.add(u.email.toLowerCase().trim());
    });
  } catch {
    // Database connection pending
  }

  // 2. From runtime player accounts
  playerAccounts.forEach((acc) => {
    if (acc.email && acc.email.includes('@')) emailSet.add(acc.email.toLowerCase().trim());
  });

  // 3. From approved community requests
  communityRequests.forEach((req) => {
    if (req.status === 'APPROVED' && req.email && req.email.includes('@')) {
      emailSet.add(req.email.toLowerCase().trim());
    }
  });

  return Array.from(emailSet);
}

export async function getBroadcastRecipientEmails(): Promise<string[]> {
  const getCached = unstable_cache(
    fetchBroadcastRecipientEmails,
    ['broadcast-recipient-emails'],
    { revalidate: 30, tags: ['broadcast', 'users'] }
  );
  return getCached();
}

export async function getBroadcastHistoryList(): Promise<BroadcastHistoryItem[]> {
  return await getDbBroadcastHistory();
}

export async function sendBroadcastAnnouncementAction(formData: FormData) {
  try {
    const subject = (formData.get('subject') as string)?.trim();
    const badgeTitle = (formData.get('badgeTitle') as string)?.trim() || 'OFFICIAL ANNOUNCEMENT';
    const headline = (formData.get('headline') as string)?.trim() || subject;
    const bodyContent = (formData.get('bodyContent') as string)?.trim();
    const ctaText = (formData.get('ctaText') as string)?.trim() || undefined;
    const ctaUrl = (formData.get('ctaUrl') as string)?.trim() || undefined;

    if (!subject || !bodyContent) {
      return { success: false, error: 'Subject and Body content are required.' };
    }

    const recipients = await getBroadcastRecipientEmails();

    if (recipients.length === 0) {
      return {
        success: false,
        error: 'No registered player emails found in the system to broadcast to.',
      };
    }

    const result = await sendBroadcastEmail({
      toList: recipients,
      subject,
      badgeTitle,
      headline,
      bodyContent,
      ctaText,
      ctaUrl,
    });

    await addBroadcastRecord({
      subject,
      headline,
      badgeTitle,
      recipientCount: recipients.length,
      status: result.success ? 'SENT' : 'FAILED',
    });

    // Audit Log
    recordAuditLog(
      'BROADCAST_SENT' as any,
      'Admin Console',
      `Sent email broadcast "${subject}" to ${recipients.length} player mailboxes.`,
      `Broadcast: ${badgeTitle}`,
      result.success ? 'SUCCESS' : 'WARNING'
    );

    revalidatePath('/admin/broadcast');
    revalidatePath('/admin/audit-logs');

    return {
      success: result.success,
      sentCount: result.sentCount,
      failedCount: result.failedCount,
      recipientCount: recipients.length,
      message: result.success
        ? `Broadcast email successfully sent to ${recipients.length} player mailbox(es)!`
        : `Broadcast recorded (Dispatch note: ${result.error || 'Check SMTP config'}).`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Send broadcast action error:', errorMsg);
    return { success: false, error: 'Failed to send broadcast announcement.' };
  }
}
