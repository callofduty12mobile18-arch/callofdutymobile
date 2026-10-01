import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { prisma } from '@/lib/db/prisma';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Verify Player Email | CODM India',
  description: 'Verify your player email address to activate your Call of Duty Mobile competitive profile.',
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string; email?: string }>;
}) {
  const resolved = searchParams ? await searchParams : {};
  const { token, email } = resolved;

  let isSuccess = false;
  let errorMessage = '';

  if (!token || !email) {
    errorMessage = 'Invalid verification link. Token and email are required.';
  } else {
    try {
      const user = await prisma.user.findFirst({
        where: {
          email: { equals: email.trim(), mode: 'insensitive' },
          emailVerificationToken: token,
        },
        include: {
          players: true,
        },
      });

      if (!user) {
        errorMessage = 'Verification token is invalid or has already been used.';
      } else if (
        user.emailVerificationTokenExpiresAt &&
        user.emailVerificationTokenExpiresAt < new Date()
      ) {
        errorMessage = 'This verification token has expired. Please request a new verification link.';
      } else {
        // Mark user as email verified and clear token
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: true,
            emailVerificationToken: null,
            emailVerificationTokenExpiresAt: null,
          },
        });

        // If player profile was in DRAFT, it is now verified and eligible for publication
        if (user.players.length > 0) {
          await prisma.player.updateMany({
            where: { userId: user.id },
            data: {
              verificationStatus: 'VERIFIED',
              verifiedAt: new Date(),
            },
          });
        }

        isSuccess = true;
      }
    } catch (err) {
      console.error('[VERIFY_EMAIL] Database error:', err);
      errorMessage = 'A database error occurred while verifying your email. Please try again.';
    }
  }

  return (
    <div className="relative min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6">
      <div className="relative z-10 max-w-md w-full mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-[2px] overflow-hidden flex items-center justify-center mx-auto mb-4 bg-[#141414] border border-[#2A2A2A]">
            <img src="/photos/logo1.png" alt="CODM India Logo" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            EMAIL <span className="text-[#FFE93B]">VERIFICATION</span>
          </h1>
        </div>

        <Card variant="elevated" className="p-6 sm:p-8 space-y-6 text-center">
          {isSuccess ? (
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-bold text-lg text-white">Email Successfully Verified!</h3>
                <p className="text-xs text-[#ADABAB] leading-relaxed">
                  Your competitive player account is now verified. You can now log into Player Studio and manage your public roster profile.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/player/login">
                  <Button size="lg" variant="primary" className="w-full text-xs">
                    LOG IN TO PLAYER STUDIO
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-bold text-lg text-white">Verification Failed</h3>
                <p className="text-xs text-[#ADABAB] leading-relaxed">
                  {errorMessage}
                </p>
              </div>
              <div className="pt-2">
                <Link href="/player/login">
                  <Button size="lg" variant="secondary" className="w-full text-xs">
                    BACK TO LOGIN
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
