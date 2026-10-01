'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { sendBroadcastEmail } from '@/lib/email/mailer';
import { recordAuditLog } from '../data/audit-store';
import { addBroadcastRecord, getDbBroadcastHistory, BroadcastHistoryItem } from '../data/broadcast-store';
import { requireAdminSession } from './admin-auth';
import { unstable_cache } from 'next/cache';

async function fetchBroadcastRecipientEmails(): Promise<string[]> {
  const emailSet = new Set<string>();

  try {
    // 1. Fetch from User accounts table in PostgreSQL
    const users = await prisma.user.findMany({
      select: { email: true },
    });
    users.forEach((u) => {
      if (u.email && u.email.includes('@')) {
        emailSet.add(u.email.toLowerCase().trim());
      }
    });

    // 2. Fetch from approved Submissions in PostgreSQL
    const approvedSubs = await prisma.submission.findMany({
      where: {
        status: 'APPROVED',
      },
      select: { submitterEmail: true },
    });
    approvedSubs.forEach((s) => {
      if (s.submitterEmail && s.submitterEmail.includes('@')) {
        emailSet.add(s.submitterEmail.toLowerCase().trim());
      }
    });
  } catch (err) {
    console.error('Error fetching broadcast recipients from database:', err);
  }

  return Array.from(emailSet);
}

export async function getBroadcastRecipientEmails(): Promise<string[]> {
  await requireAdminSession();
  const getCached = unstable_cache(
    fetchBroadcastRecipientEmails,
    ['broadcast-recipient-emails'],
    { revalidate: 30, tags: ['broadcast', 'users'] }
  );
  return getCached();
}

export async function getBroadcastHistoryList(): Promise<BroadcastHistoryItem[]> {
  await requireAdminSession();
  return await getDbBroadcastHistory();
}

export async function sendBroadcastAnnouncementAction(formData: FormData) {
  try {
    const admin = await requireAdminSession();
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
        error: 'No registered player emails found in the database to broadcast to.',
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

    // Audit Log in DB
    await recordAuditLog(
      'BROADCAST_SENT' as any,
      admin.username,
      `Dispatched email broadcast "${subject}" to ${recipients.length} player mailbox(es).`,
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
        ? `Broadcast email successfully dispatched to ${recipients.length} player mailbox(es)!`
        : `Broadcast recorded (Dispatch note: ${result.error || 'Check SMTP config'}).`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Send broadcast action error:', errorMsg);
    return { success: false, error: 'Failed to send broadcast announcement.' };
  }
}
