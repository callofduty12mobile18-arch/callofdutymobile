'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import {
  addCommunityRequest,
  approveRequest,
  rejectRequest,
  CommunityRequestItem,
} from '../data/community-store';
import { prisma } from '@/lib/db/prisma';
import { hashToken } from '@/lib/auth/tokens';
import { sendSetPasswordEmail, sendEmailVerificationEmail } from '@/lib/email/mailer';
import { recordAuditLog } from '../data/audit-store';
import { requireAdminSession } from './admin-auth';
import { getClientIp } from '@/lib/auth/rate-limit';

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

    const ip = await getClientIp();
    const { email, fullName, gamerTag } = validated.data;
    const req = await addCommunityRequest(email, fullName, gamerTag);

    // Auto-provision player record and one-time password setup link
    const result = await approveRequest(req.id);
    if (!result.success) {
      return { success: false, message: result.error || 'Could not process player request. Please try again.' };
    }

    const defaultIgn = gamerTag || result.email.split('@')[0];

    // Dispatch one-time password setup & email verification directly to applicant
    const [setupResult] = await Promise.all([
      sendSetPasswordEmail({
        to: result.email,
        ign: defaultIgn,
        token: result.passwordResetToken,
        fullName: fullName,
        isInvitation: false,
      }),
      sendEmailVerificationEmail({
        to: result.email,
        ign: defaultIgn,
        token: result.verificationToken,
      }),
    ]);

    if (!setupResult.success) {
      console.error('[COMMUNITY JOIN] Email dispatch failed:', setupResult.error);
      return {
        success: false,
        message: setupResult.error
          ? `Failed to send email: ${setupResult.error}. Please check your SMTP settings.`
          : 'Failed to send email. Please check your SMTP configuration or try again.',
      };
    }

    // Record Audit Log in DB
    await recordAuditLog(
      'CREDENTIALS_ISSUED',
      email,
      `Self-service registration completed. One-time password setup link dispatched directly to ${email}.`,
      `Player: ${defaultIgn}`,
      'SUCCESS',
      ip
    );

    revalidatePath('/admin/requests');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/audit-logs');
    revalidatePath('/players');

    return {
      success: true,
      message: 'Your registration was successful! A password setup link has been sent to your email.',
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
    const ip = await getClientIp();
    const result = await approveRequest(requestId);
    if (!result.success) {
      return { success: false, error: result.error || 'Request could not be approved.' };
    }

    // Dispatch one-time setup and verification emails to applicant
    const gamerTag = result.request.gamerTag || result.email.split('@')[0];
    const [emailResult] = await Promise.all([
      sendSetPasswordEmail({
        to: result.email,
        ign: gamerTag,
        token: result.passwordResetToken,
        fullName: result.request.fullName,
        isInvitation: false,
      }),
      sendEmailVerificationEmail({
        to: result.email,
        ign: gamerTag,
        token: result.verificationToken,
      }),
    ]);

    // Record Audit Log in DB
    await recordAuditLog(
      'CREDENTIALS_ISSUED',
      admin.username,
      `Approved access and dispatched password setup link to ${result.email}.`,
      `Player: ${result.request.gamerTag || result.email}`,
      'SUCCESS',
      ip
    );

    revalidatePath('/admin/requests');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/audit-logs');
    revalidatePath('/players');

    const emailStatusMsg = emailResult.success
      ? `Password setup link dispatched directly to ${result.email}!`
      : `Account approved in database (Email dispatch note: ${emailResult.error || 'Check SMTP config'}).`;

    return {
      success: true,
      message: emailStatusMsg,
      emailSent: emailResult.success,
    };
  } catch {
    return { success: false, error: 'Failed to approve request' };
  }
}

export async function resendCommunityRequestEmailAction(requestId: string) {
  try {
    const admin = await requireAdminSession();
    const ip = await getClientIp();

    const dbSub = await prisma.submission.findFirst({
      where: {
        OR: [{ id: requestId }, { submitterEmail: requestId.toLowerCase() }],
        type: 'COMMUNITY_JOIN_REQUEST',
      },
    });

    if (!dbSub) {
      return { success: false, error: 'Request not found in database.' };
    }

    const email = dbSub.submitterEmail.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: false, error: 'User account not found for this email.' };
    }

    // Always issue new random tokens on resend - never reuse old credentials
    const passwordResetToken = randomBytes(32).toString('hex');
    const passwordResetTokenHash = hashToken(passwordResetToken);
    const passwordResetExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const verificationToken = randomBytes(32).toString('hex');
    const emailVerificationTokenHash = hashToken(verificationToken);
    const emailVerificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash,
        passwordResetExpiresAt,
        emailVerificationTokenHash,
        emailVerificationTokenExpiresAt,
      },
    });

    const raw = (dbSub.rawData as Record<string, string>) || {};
    const gamerTag = raw.gamerTag || email.split('@')[0];

    const [emailResult] = await Promise.all([
      sendSetPasswordEmail({
        to: email,
        ign: gamerTag,
        token: passwordResetToken,
        fullName: raw.fullName || dbSub.submitterName,
        isInvitation: false,
      }),
      sendEmailVerificationEmail({
        to: email,
        ign: gamerTag,
        token: verificationToken,
      }),
    ]);

    await recordAuditLog(
      'CREDENTIALS_ISSUED',
      admin.username,
      `Re-issued new password setup & verification token to ${email}.`,
      `Player: ${gamerTag}`,
      'SUCCESS',
      ip
    );

    revalidatePath('/admin/requests');
    revalidatePath('/admin/dashboard');

    return {
      success: emailResult.success,
      message: emailResult.success
        ? `Fresh password setup link dispatched to ${email}!`
        : `Email delivery issue: ${emailResult.error || 'Check SMTP configuration'}.`,
    };
  } catch (err: unknown) {
    console.error('Error re-sending credentials email:', err);
    return { success: false, error: 'Failed to re-send setup email.' };
  }
}

export async function rejectCommunityRequestAction(requestId: string) {
  try {
    const admin = await requireAdminSession();
    const ip = await getClientIp();
    const success = await rejectRequest(requestId);
    await recordAuditLog(
      'STATUS_MODIFIED',
      admin.username,
      `Rejected community request ${requestId}.`,
      `Request: ${requestId}`,
      'WARNING',
      ip
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
    const ip = await getClientIp();
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const fullName = (formData.get('fullName') as string)?.trim() || undefined;
    const gamerTag = (formData.get('gamerTag') as string)?.trim() || undefined;

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid player email address' };
    }

    const req = await addCommunityRequest(email, fullName, gamerTag);
    const result = await approveRequest(req.id);

    if (!result.success) {
      return { success: false, error: result.error || 'Could not provision player invitation.' };
    }

    const defaultIgn = gamerTag || result.email.split('@')[0];

    // Dispatch one-time invitation & setup link directly to applicant
    const [emailResult] = await Promise.all([
      sendSetPasswordEmail({
        to: result.email,
        ign: defaultIgn,
        token: result.passwordResetToken,
        fullName: fullName,
        isInvitation: true,
      }),
      sendEmailVerificationEmail({
        to: result.email,
        ign: defaultIgn,
        token: result.verificationToken,
      }),
    ]);

    // Record Audit Log in DB
    await recordAuditLog(
      'DIRECT_INVITE_SENT',
      admin.username,
      `Admin initiated direct invitation to ${result.email} (IGN: ${defaultIgn}).`,
      `Invited: ${result.email}`,
      'SUCCESS',
      ip
    );

    revalidatePath('/admin/requests');
    revalidatePath('/admin/players');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/audit-logs');
    revalidatePath('/players');

    const emailStatusMsg = emailResult.success
      ? `Invitation email dispatched directly to ${result.email}!`
      : `Account created in database (Email dispatch note: ${emailResult.error || 'Check SMTP config'}).`;

    return {
      success: true,
      message: emailStatusMsg,
      emailSent: emailResult.success,
    };
  } catch (err: unknown) {
    console.error('Direct invite error:', err);
    return { success: false, error: 'Failed to send player invitation' };
  }
}

async function fetchCommunityRequestsList(): Promise<CommunityRequestItem[]> {
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
      };
    });
  } catch (err) {
    console.error('Error fetching community requests from DB:', err);
    return [];
  }
}

export async function getCommunityRequestsList(): Promise<CommunityRequestItem[]> {
  await requireAdminSession();
  return fetchCommunityRequestsList();
}
