'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  addCommunityRequest,
  approveRequest,
  rejectRequest,
} from '../data/community-store';
import { prisma } from '@/lib/db/prisma';
import { sendPlayerCredentialsEmail, sendEmailVerificationEmail } from '@/lib/email/mailer';
import { recordAuditLog } from '../data/audit-store';
import { requireAdminSession } from './admin-auth';

const joinSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  fullName: z.string().min(2, 'Full name is mandatory').max(100),
  gamerTag: z.string().min(2, 'IGN / Gamer Tag is mandatory').max(50),
  honeypot: z.string().max(0).optional(),
});

export interface JoinResponse {
  success: boolean;
  message: string;
  email?: string;
  error?: string;
}

export async function submitCommunityJoinRequest(
  prevState: JoinResponse | null,
  formData: FormData
): Promise<JoinResponse> {
  try {
    const rawData = {
      email: formData.get('email') as string,
      fullName: (formData.get('fullName') as string) || undefined,
      gamerTag: (formData.get('gamerTag') as string) || undefined,
      honeypot: (formData.get('honeypot') as string) || undefined,
    };

    if (rawData.honeypot) {
      return { success: false, message: 'Invalid request' };
    }

    const validated = joinSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues?.[0]?.message || 'Invalid form input',
      };
    }

    const { email, fullName, gamerTag } = validated.data;
    const req = await addCommunityRequest(email, fullName, gamerTag);

    // Record Audit Log in DB
    await recordAuditLog(
      'COMMUNITY_JOIN_REQUESTED',
      email,
      `Submitted public access request for gamer tag "${gamerTag || email.split('@')[0]}".`,
      `Intake: /join`,
      'INFO'
    );

    revalidatePath('/admin/requests');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/audit-logs');

    return {
      success: true,
      message: 'Your access request has been sent to the administrators!',
      email: req.email,
    };
  } catch (err: unknown) {
    console.error('Community join error:', err);
    return {
      success: false,
      message: 'Failed to submit request. Please try again.',
    };
  }
}

export async function approveCommunityRequestAction(requestId: string) {
  try {
    const admin = await requireAdminSession();
    const result = await approveRequest(requestId);
    if (!result) {
      return { success: false, error: 'Request not found in database.' };
    }

    // Dispatch credentials and verification emails to applicant
    const gamerTag = result.request.gamerTag || result.credentials.email.split('@')[0];
    const [emailResult] = await Promise.all([
      sendPlayerCredentialsEmail({
        to: result.credentials.email,
        ign: gamerTag,
        password: result.credentials.password,
        fullName: result.request.fullName,
        isInvitation: false,
      }),
      sendEmailVerificationEmail({
        to: result.credentials.email,
        ign: gamerTag,
        token: result.verificationToken,
      }),
    ]);

    // Record Audit Log in DB
    await recordAuditLog(
      'CREDENTIALS_ISSUED',
      admin.username,
      `Approved access and dispatched login key to ${result.credentials.email}.`,
      `Player: ${result.request.gamerTag || result.credentials.email}`,
      'SUCCESS'
    );

    revalidatePath('/admin/requests');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/audit-logs');
    revalidatePath('/players');

    const emailStatusMsg = emailResult.success
      ? `Email dispatched directly to ${result.credentials.email}!`
      : `Credentials created in database (Email dispatch note: ${emailResult.error || 'Check SMTP config'}).`;

    return {
      success: true,
      message: emailStatusMsg,
      credentials: result.credentials,
      emailSent: emailResult.success,
    };
  } catch (err: unknown) {
    return { success: false, error: 'Failed to approve request' };
  }
}

export async function resendCommunityRequestEmailAction(requestId: string) {
  try {
    const admin = await requireAdminSession();
    const result = await approveRequest(requestId);
    if (!result) {
      return { success: false, error: 'Request not found in database.' };
    }

    const gamerTag = result.request.gamerTag || result.credentials.email.split('@')[0];
    const [emailResult] = await Promise.all([
      sendPlayerCredentialsEmail({
        to: result.credentials.email,
        ign: gamerTag,
        password: result.credentials.password,
        fullName: result.request.fullName,
        isInvitation: false,
      }),
      sendEmailVerificationEmail({
        to: result.credentials.email,
        ign: gamerTag,
        token: result.verificationToken,
      }),
    ]);

    await recordAuditLog(
      'CREDENTIALS_ISSUED',
      admin.username,
      `Re-sent credentials email to ${result.credentials.email}.`,
      `Player: ${gamerTag}`,
      'SUCCESS'
    );

    revalidatePath('/admin/requests');
    revalidatePath('/admin/dashboard');

    return {
      success: emailResult.success,
      message: emailResult.success
        ? `Credentials email successfully dispatched to ${result.credentials.email}!`
        : `Email delivery issue: ${emailResult.error || 'Check SMTP configuration'}.`,
      credentials: result.credentials,
    };
  } catch (err: unknown) {
    console.error('Error re-sending credentials email:', err);
    return { success: false, error: 'Failed to re-send credentials email.' };
  }
}

export async function rejectCommunityRequestAction(requestId: string) {
  try {
    const admin = await requireAdminSession();
    const success = await rejectRequest(requestId);
    await recordAuditLog(
      'STATUS_MODIFIED',
      admin.username,
      `Rejected community request ${requestId}.`,
      `Request: ${requestId}`,
      'WARNING'
    );
    revalidatePath('/admin/requests');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/audit-logs');
    return { success };
  } catch {
    return { success: false };
  }
}

export async function directInvitePlayerAction(formData: FormData) {
  try {
    const admin = await requireAdminSession();
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const fullName = (formData.get('fullName') as string)?.trim() || undefined;
    const gamerTag = (formData.get('gamerTag') as string)?.trim() || undefined;

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid player email address' };
    }

    const req = await addCommunityRequest(email, fullName, gamerTag);
    const result = await approveRequest(req.id);

    if (!result) {
      return { success: false, error: 'Could not generate credentials in database.' };
    }

    // Dispatch credentials email directly to the applicant
    const emailResult = await sendPlayerCredentialsEmail({
      to: result.credentials.email,
      ign: gamerTag || result.credentials.email.split('@')[0],
      password: result.credentials.password,
      fullName: fullName,
      isInvitation: true,
    });

    // Record Audit Log in DB
    await recordAuditLog(
      'DIRECT_INVITE_SENT',
      admin.username,
      `Admin initiated direct invitation to ${result.credentials.email} (IGN: ${gamerTag || 'None'}).`,
      `Invited: ${result.credentials.email}`,
      'SUCCESS'
    );

    revalidatePath('/admin/requests');
    revalidatePath('/admin/players');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/audit-logs');
    revalidatePath('/players');

    const emailStatusMsg = emailResult.success
      ? `Invitation email dispatched directly to ${result.credentials.email}!`
      : `Credentials created in database (Email dispatch note: ${emailResult.error || 'Check SMTP config'}).`;

    return {
      success: true,
      message: emailStatusMsg,
      credentials: result.credentials,
      emailSent: emailResult.success,
    };
  } catch (err: unknown) {
    console.error('Direct invite error:', err);
    return { success: false, error: 'Failed to send player invitation' };
  }
}

async function fetchCommunityRequestsList() {
  try {
    const dbSubs = await prisma.submission.findMany({
      where: { type: 'COMMUNITY_JOIN_REQUEST' },
      orderBy: { createdAt: 'desc' },
    });

    return dbSubs.map((s) => {
      const raw = (s.rawData as Record<string, string>) || {};
      return {
        id: s.id,
        email: s.submitterEmail,
        fullName: raw.fullName || s.submitterName,
        gamerTag: raw.gamerTag || '',
        status: s.status as 'PENDING' | 'APPROVED' | 'REJECTED',
        createdAt: s.createdAt.toISOString(),
        approvedAt: s.reviewedAt ? s.reviewedAt.toISOString() : undefined,
        generatedPassword: raw.password || undefined,
      };
    });
  } catch (err) {
    console.error('Error fetching community requests from DB:', err);
    return [];
  }
}

export async function getCommunityRequestsList() {
  await requireAdminSession();
  return fetchCommunityRequestsList();
}
