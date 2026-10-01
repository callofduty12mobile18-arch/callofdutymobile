'use client';

import * as React from 'react';
import { useActionState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { loginPlayerAction } from '@/server/actions/player-auth';

export default function PlayerLoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginPlayerAction, null);

  React.useEffect(() => {
    if (state?.success && state.redirectUrl) {
      router.push(state.redirectUrl);
    }
  }, [state, router]);

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6">
      {/* Ambient background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-luminosity scale-105"
        style={{
          backgroundImage: `url('/photos/codm-operator.jpg')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/90 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full mx-auto space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-[2px] overflow-hidden flex items-center justify-center mx-auto mb-4">
            <img src="/photos/logo1.png" alt="CODM India Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
            PLAYER LOGIN
          </h1>
          <p className="text-[#ADABAB] text-xs leading-relaxed">
            Sign in using the credentials dispatched to your email address by the platform administrators.
          </p>
        </div>

      {/* Login Card */}
      <Card variant="elevated" className="p-6 sm:p-8 space-y-6">
        {state && !state.success && (
          <div className="p-3.5 bg-[#FF3D00]/10 border border-[#FF3D00]/30 rounded-[2px] flex items-center gap-2.5 text-xs text-[#FF3D00]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{state.message}</span>
          </div>
        )}

        {state?.success && (
          <div className="p-3.5 bg-[#00E676]/10 border border-[#00E676]/30 rounded-[2px] flex items-center gap-2.5 text-xs text-[#00E676]">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{state.message}</span>
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB]">
              Email Address
            </label>
            <Input
              name="email"
              type="email"
              required
              placeholder="e.g. rohan.sharma.codm@gmail.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB]">
                Credentials / Access Key
              </label>
              <span className="text-[10px] text-[#837D72]">Format: CODM-XXXXXXXXXXXX</span>
            </div>
            <Input
              name="password"
              type="password"
              required
              placeholder="Paste your access key"
              leftIcon={<Lock className="w-4 h-4" />}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            variant="primary"
            className="w-full text-sm"
            isLoading={isPending}
          >
            SIGN IN TO PROFILE STUDIO
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-[#2A2A2A]">
          <span className="text-xs text-[#837D72]">Haven&apos;t requested access yet? </span>
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
