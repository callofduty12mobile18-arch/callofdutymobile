'use client';

import * as React from 'react';
import { useActionState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { requestPasswordResetAction } from '@/server/actions/player-auth';

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, null);

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 overflow-hidden">
      {/* Subtle ambient glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#FFE93B]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full mx-auto space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-[2px] overflow-hidden flex items-center justify-center mx-auto mb-4 bg-[#141414] border border-[#2A2A2A]">
            <img src="/photos/logo1.png" alt="MOBILEROSTER Logo" className="w-12 h-12 object-contain" />
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase mb-1">
            <KeyRound className="w-4 h-4" />
            <span>ACCOUNT RECOVERY</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
            FORGOT <span className="text-[#FFE93B]">PASSWORD</span>
          </h1>
          <p className="text-[#ADABAB] text-xs leading-relaxed max-w-sm mx-auto">
            Enter your registered player email address. We&apos;ll dispatch a secure one-time link to reset your credentials.
          </p>
        </div>

        {/* Form Card */}
        <Card variant="elevated" className="p-6 sm:p-8 space-y-6">
          {state && !state.success && (
            <div className="p-3.5 bg-[#FF3D00]/10 border border-[#FF3D00]/30 rounded-[2px] flex items-center gap-2.5 text-xs text-[#FF3D00]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{state.message}</span>
            </div>
          )}

          {state?.success ? (
            <div className="space-y-5 bg-[#1F1F1F] border border-[#00E676]/40 p-6 rounded-[2px] text-center">
              <div className="w-12 h-12 bg-[#00E676]/10 border border-[#00E676]/30 rounded-full flex items-center justify-center mx-auto text-[#00E676]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display font-bold text-base text-white uppercase tracking-wide">
                  RESET LINK DISPATCHED
                </h2>
                <p className="text-xs text-[#ADABAB] leading-relaxed">
                  {state.message}
                </p>
                <p className="text-[11px] text-[#837D72] pt-1">
                  The link will expire in 24 hours. Be sure to check your spam or junk folders if you don&apos;t see it shortly.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/player/login"
                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#1F1F1F] hover:bg-[#2A2A2A] border border-[#3A3A3A] text-white font-display font-bold text-xs uppercase tracking-wider rounded-[2px] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>BACK TO LOGIN</span>
                </Link>
              </div>
            </div>
          ) : (
            <form action={formAction} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB]">
                  Registered Email Address
                </label>
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your registered email"
                  leftIcon={<Mail className="w-4 h-4" />}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                variant="primary"
                className="w-full text-sm"
                isLoading={isPending}
              >
                SEND RESET LINK
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/player/login"
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-[#ADABAB] hover:text-[#FFE93B] font-display uppercase transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Player Login</span>
                </Link>
              </div>
            </form>
          )}

          <div className="text-center pt-2 border-t border-[#2A2A2A]">
            <span className="text-xs text-[#837D72]">Need a new player account? </span>
            <Link
              href="/join"
              className="text-xs text-[#FFE93B] font-display uppercase font-semibold hover:underline block mt-1"
            >
              Join with the Community →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
