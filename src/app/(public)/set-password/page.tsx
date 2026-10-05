'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { setPasswordAction } from '@/server/actions/player-auth';

export default function SetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [result, setResult] = React.useState<{ success: boolean; message: string } | null>(null);

  // Complexity indicators
  const hasMinLength = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    formData.set('token', token);
    formData.set('email', email);

    const res = await setPasswordAction(null, formData);
    setIsPending(false);
    setResult(res);
  };

  if (!token || !email) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#141414] border-2 border-[#2A2A2A] rounded-[2px] p-8 text-center space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="w-16 h-16 bg-[#FF3D00]/10 border border-[#FF3D00]/30 rounded-full flex items-center justify-center mx-auto text-[#FF3D00]">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[11px] font-display uppercase tracking-widest text-[#FF3D00] font-bold block mb-1">
              INVALID LINK
            </span>
            <h1 className="text-2xl font-display font-black text-white uppercase tracking-tight">
              MISSING CREDENTIALS
            </h1>
            <p className="text-xs text-[#ADABAB] mt-2 leading-relaxed">
              This password setup link is missing required security tokens. Please check the link in your email and try again.
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
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#141414] border-2 border-[#FFE93B] rounded-[2px] p-8 space-y-6 shadow-[0_0_50px_rgba(255,233,59,0.15)] text-left">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase mb-1">
            <KeyRound className="w-4 h-4" />
            <span>ACCOUNT ACTIVATION</span>
          </div>
          <h1 className="font-display font-black text-2xl text-white uppercase tracking-tight">
            SET YOUR PASSWORD
          </h1>
          <p className="text-xs text-[#ADABAB] mt-1">
            Setting password for <strong className="text-white font-mono">{email}</strong>
          </p>
        </div>

        {/* Status result */}
        {result?.success ? (
          <div className="space-y-6 bg-[#1F1F1F] border border-[#00E676]/40 p-6 rounded-[2px] text-center">
            <div className="w-12 h-12 bg-[#00E676]/10 border border-[#00E676]/30 rounded-full flex items-center justify-center mx-auto text-[#00E676]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-white uppercase">
                PASSWORD SET SUCCESSFULLY!
              </h2>
              <p className="text-xs text-[#ADABAB] mt-1">
                {result.message}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/player/login"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#FFE93B] hover:bg-[#FFF066] text-black font-display font-bold text-xs uppercase tracking-wider rounded-[2px] transition-colors"
              >
                <span>LOGIN TO PLAYER STUDIO</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {result?.success === false && result.message && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-400 text-xs flex items-center gap-2 rounded-[2px]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{result.message}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-display uppercase tracking-wider text-[#ADABAB] mb-1 font-semibold">
                New Password <span className="text-[#FFE93B]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min 12 chars (Upper, Number, Special)"
                  className="w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] px-3.5 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-[#FFE93B] transition-colors placeholder:text-[#837D72]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#837D72] hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-display uppercase tracking-wider text-[#ADABAB] mb-1 font-semibold">
                Confirm Password <span className="text-[#FFE93B]">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your password"
                className="w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFE93B] transition-colors placeholder:text-[#837D72]"
              />
            </div>

            {/* Complexity requirements check */}
            <div className="bg-[#1F1F1F] border border-[#2A2A2A] p-3 rounded-[2px] space-y-1 text-[11px]">
              <span className="font-display font-semibold uppercase text-[#837D72] block mb-1 tracking-wider text-[10px]">
                Password Requirements
              </span>
              <div className="grid grid-cols-2 gap-1 font-mono">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-[#00E676]' : 'text-[#837D72]'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>12+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-[#00E676]' : 'text-[#837D72]'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>Uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-[#00E676]' : 'text-[#837D72]'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>At least 1 number</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-[#00E676]' : 'text-[#837D72]'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>Special character</span>
                </div>
              </div>
              {confirmPassword.length > 0 && (
                <div className={`pt-1 text-[10px] ${passwordsMatch ? 'text-[#00E676]' : 'text-red-400'}`}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                variant="primary"
                className="w-full"
                isLoading={isPending}
                disabled={!hasMinLength || !hasUpper || !hasNumber || !hasSpecial || !passwordsMatch}
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                ACTIVATE & SAVE PASSWORD
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
