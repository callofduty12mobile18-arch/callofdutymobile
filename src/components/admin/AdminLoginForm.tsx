'use client';

import * as React from 'react';
import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, User, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { loginAdminAction } from '@/server/actions/admin-auth';

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(loginAdminAction, null);

  useEffect(() => {
    if (state?.success && state.redirectUrl) {
      window.location.href = state.redirectUrl;
    }
  }, [state]);

  return (
    <div className="flex-1 min-h-[80vh] w-full flex items-center justify-center bg-black text-white py-12 px-4 relative overflow-hidden selection:bg-[#FFE93B] selection:text-black">
      {/* Background Ambience */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none mix-blend-luminosity scale-105"
        style={{
          backgroundImage: `url('/photos/hero-bg.jpg')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/95 pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f15_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full mx-auto space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-[2px] bg-[#141414] border border-[#FFE93B]/40 shadow-[0_0_30px_rgba(255,233,59,0.15)] flex items-center justify-center mx-auto mb-3">
            <img src="/photos/logo1.png" alt="CODM Admin" className="w-11 h-11 object-contain" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141414] border border-[#837D72]/40 rounded-[3px] text-[11px] font-display tracking-widest uppercase text-[#FFE93B]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>RESTRICTED ACCESS PORTAL</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
            ADMINISTRATOR <span className="text-[#FFE93B]">LOGIN</span>
          </h1>
          <p className="text-xs text-[#ADABAB] max-w-sm mx-auto">
            Authorized administrative personnel only. Enter your admin username and security password to access the platform control panel.
          </p>
        </div>

        {/* Login Card */}
        <Card variant="elevated" className="p-6 sm:p-8 space-y-6 border-2 border-[#2A2A2A] shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFE93B] to-transparent" />

          {state && !state.success && (
            <div className="p-3.5 bg-red-950/50 border border-red-800/80 rounded-[2px] flex items-center gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span className="font-medium">{state.message}</span>
            </div>
          )}

          {state?.success && (
            <div className="p-3.5 bg-green-950/50 border border-green-700/80 rounded-[2px] flex items-center gap-2.5 text-xs text-green-300">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-400" />
              <span className="font-medium">{state.message}</span>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] font-semibold">
                Admin Username
              </label>
              <Input
                name="identifier"
                type="text"
                required
                autoFocus
                placeholder="e.g. ashwin2019"
                leftIcon={<User className="w-4 h-4 text-[#837D72]" />}
                className="text-sm py-2.5 bg-[#0D0D0D] border-[#2A2A2A] text-white focus:border-[#FFE93B]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] font-semibold">
                Security Password
              </label>
              <Input
                name="password"
                type="password"
                required
                placeholder="Enter admin security password"
                leftIcon={<Lock className="w-4 h-4 text-[#837D72]" />}
                className="text-sm py-2.5 bg-[#0D0D0D] border-[#2A2A2A] text-white focus:border-[#FFE93B]"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                variant="primary"
                className="w-full text-xs font-display font-black tracking-wider uppercase py-3"
                isLoading={isPending}
              >
                AUTHENTICATE & ENTER
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>

          <div className="pt-4 border-t border-[#2A2A2A] text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#837D72] hover:text-[#FFE93B] transition-colors font-display uppercase tracking-wider"
            >
              <span>Return to Public Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
