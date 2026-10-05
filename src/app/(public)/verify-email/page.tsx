import * as React from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/db/prisma';
import { hashToken } from '@/lib/auth/tokens';
import { recordAuditLog } from '@/server/data/audit-store';
import { getClientIp } from '@/lib/auth/rate-limit';

interface VerifyEmailPageProps {
  searchParams: Promise<{
    token?: string;
    email?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token, email } = await searchParams;
  let status: 'SUCCESS' | 'EXPIRED' | 'INVALID' | 'MISSING' = 'MISSING';
  let userEmail = email || '';

  if (token && email) {
    const cleanEmail = email.trim().toLowerCase();
    const tokenHash = hashToken(token.trim());

    try {
      const user = await prisma.user.findFirst({
        where: {
          email: cleanEmail,
          emailVerificationTokenHash: tokenHash,
        },
      });

      if (!user) {
        status = 'INVALID';
      } else if (user.emailVerificationTokenExpiresAt && user.emailVerificationTokenExpiresAt < new Date()) {
        status = 'EXPIRED';
      } else {
        const ip = await getClientIp();
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: true,
            emailVerificationTokenHash: null,
            emailVerificationTokenExpiresAt: null,
          },
        });

        await recordAuditLog(
          'STATUS_MODIFIED',
          cleanEmail,
          `Email address ${cleanEmail} verified successfully via token.`,
          `User: ${cleanEmail}`,
          'SUCCESS',
          ip
        );

        status = 'SUCCESS';
        userEmail = cleanEmail;
      }
    } catch (err) {
      console.error('Email verification error:', err);
      status = 'INVALID';
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#141414] border-2 border-[#2A2A2A] rounded-[2px] p-8 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {status === 'SUCCESS' ? (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-[#00E676]/10 border border-[#00E676]/30 rounded-full flex items-center justify-center mx-auto text-[#00E676]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-display uppercase tracking-widest text-[#00E676] font-bold block mb-1">
                VERIFICATION COMPLETE
              </span>
              <h1 className="text-2xl font-display font-black text-white uppercase tracking-tight">
                EMAIL VERIFIED
              </h1>
              <p className="text-xs text-[#ADABAB] mt-2 leading-relaxed">
                Thank you for verifying <strong className="text-white">{userEmail}</strong>. Your player account is now fully authorized to publish profiles and participate in the directory.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/player/login"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#FFE93B] hover:bg-[#FFF066] text-black font-display font-bold text-xs uppercase tracking-wider rounded-[2px] transition-colors"
              >
                <span>CONTINUE TO PLAYER STUDIO</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : status === 'EXPIRED' ? (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-[#FF3D00]/10 border border-[#FF3D00]/30 rounded-full flex items-center justify-center mx-auto text-[#FF3D00]">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-display uppercase tracking-widest text-[#FF3D00] font-bold block mb-1">
                LINK EXPIRED
              </span>
              <h1 className="text-2xl font-display font-black text-white uppercase tracking-tight">
                VERIFICATION EXPIRED
              </h1>
              <p className="text-xs text-[#ADABAB] mt-2 leading-relaxed">
                This verification link was valid for 24 hours and has now expired. Please log in or request a new verification link from your Player Studio profile.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/player/login"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#1F1F1F] hover:bg-[#2A2A2A] border border-[#3A3A3A] text-white font-display font-bold text-xs uppercase tracking-wider rounded-[2px] transition-colors"
              >
                <span>RETURN TO LOGIN</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-[#FF3D00]/10 border border-[#FF3D00]/30 rounded-full flex items-center justify-center mx-auto text-[#FF3D00]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-display uppercase tracking-widest text-[#FF3D00] font-bold block mb-1">
                INVALID REQUEST
              </span>
              <h1 className="text-2xl font-display font-black text-white uppercase tracking-tight">
                VERIFICATION FAILED
              </h1>
              <p className="text-xs text-[#ADABAB] mt-2 leading-relaxed">
                {status === 'MISSING'
                  ? 'No verification token or email was provided. Please use the link sent to your email.'
                  : 'The verification token provided is invalid or has already been used.'}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/player/login"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#1F1F1F] hover:bg-[#2A2A2A] border border-[#3A3A3A] text-white font-display font-bold text-xs uppercase tracking-wider rounded-[2px] transition-colors"
              >
                <span>RETURN TO LOGIN</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
