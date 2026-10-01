'use client';

import * as React from 'react';
import { useActionState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { loginPlayerAction } from '@/server/actions/player-auth';

export default function PlayerLoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginPlayerAction, null);
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    if (state?.success && state.redirectUrl) {
      router.push(state.redirectUrl);
    }
  }, [state, router]);

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 overflow-hidden">
      {/* Subtle ambient glow effect matching Scrims */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#FFE93B]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full mx-auto space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-[2px] overflow-hidden flex items-center justify-center mx-auto mb-4 bg-[#141414] border border-[#2A2A2A]">
            <img src="/photos/logo1.png" alt="CODM India Logo" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
            PLAYER <span className="text-[#FFE93B]">LOGIN</span>
          </h1>
          <p className="text-[#ADABAB] text-xs leading-relaxed">
            Sign in using the access key dispatched to your email address by the platform administrators.
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
              placeholder="Enter your email address"
              leftIcon={<Mail className="w-4 h-4" />}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB]">
              Access Key
            </label>
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter your access key"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#ADABAB] hover:text-[#FFE93B] transition-colors focus:outline-none p-1 cursor-pointer flex items-center justify-center"
                  title={showPassword ? 'Hide access key' : 'Show access key'}
                  aria-label={showPassword ? 'Hide access key' : 'Show access key'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#837D72] hover:text-[#FFE93B]" />}
                </button>
              }
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
