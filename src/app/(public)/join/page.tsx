'use client';

import * as React from 'react';
import { useActionState, useState } from 'react';
import { Mail, ShieldCheck, ArrowRight, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { submitCommunityJoinRequest } from '@/server/actions/community';

export default function JoinCommunityPage() {
  const [state, formAction, isPending] = useActionState(submitCommunityJoinRequest, null);
  const [isDismissed, setIsDismissed] = useState(false);
  const showPopup = Boolean(state?.success && !isDismissed);

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle ambient glow effect matching Scrims */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FFE93B]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full mx-auto space-y-10">
        {/* Title Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-[#FFE93B]/10 border border-[#FFE93B]/30 text-xs font-bold text-[#FFE93B]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>COMMUNITY ACCESS PORTAL</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
            JOIN THE <span className="text-[#FFE93B]">COMMUNITY</span>
          </h1>
          <p className="text-[#ADABAB] text-sm leading-relaxed max-w-lg mx-auto">
            Type your details below to join the community. Your access credentials and login instructions will be sent automatically to your inbox.
          </p>
        </div>

      {/* Main Form Card */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-[2px] p-6 sm:p-10 space-y-6">
        {state && !state.success && (
          <div className="p-4 bg-[#FF3D00]/10 border border-[#FF3D00]/30 rounded-[2px] flex items-center gap-3 text-sm text-[#FF3D00]">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{state.message}</span>
          </div>
        )}

        <form action={formAction} className="space-y-6">
          {/* Honeypot for bot protection */}
          <input type="text" name="honeypot" className="hidden" tabIndex={-1} autoComplete="off" />

          {/* Email (Mandatory) */}
          <div className="space-y-2">
            <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB]">
              Your Email Address *
            </label>
            <Input
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              className="text-base py-3"
              autoFocus
            />
            <p className="text-[11px] text-[#837D72]">
              Your account credentials and login instructions will be sent here.
            </p>
          </div>

          {/* Full Name & IGN (Both Mandatory) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
                Full Name *
              </label>
              <Input
                name="fullName"
                required
                placeholder="e.g. Jash Shah"
              />
            </div>
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
                In-Game Name (IGN) *
              </label>
              <Input
                name="gamerTag"
                required
                placeholder="e.g. Learn"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            variant="primary"
            className="w-full text-base py-4"
            isLoading={isPending}
          >
            JOIN WITH THE COMMUNITY
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </form>
      </div>

      {/* POP-UP MODAL: CHECK YOUR MAIL */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#141414] border-2 border-[#FFE93B] rounded-[2px] p-6 sm:p-8 text-center space-y-5 shadow-[0_0_50px_rgba(255,233,59,0.25)]">
            {/* Close Button */}
            <button
              onClick={() => setIsDismissed(true)}
              className="absolute top-4 right-4 text-[#837D72] hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Icon */}
            <div className="w-16 h-16 bg-[#FFE93B]/10 border border-[#FFE93B]/40 rounded-full flex items-center justify-center mx-auto text-[#FFE93B]">
              <Mail className="w-8 h-8" />
            </div>

            {/* Pop-up Message */}
            <div className="space-y-2">
              <span className="text-[11px] font-display font-bold uppercase tracking-widest text-[#FFE93B] block">
                SUCCESSFUL REQUEST
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                {state?.emailSent === false ? 'WELCOME TO THE COMMUNITY!' : 'CHECK YOUR MAIL!'}
              </h3>
              <p className="text-sm text-[#ADABAB] leading-relaxed">
                {state?.message}
              </p>
              
              {state?.email && state?.emailSent !== false && (
                <div className="pt-1">
                  <span className="inline-block px-3 py-1 bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] text-xs font-mono text-[#FFE93B]">
                    {state.email}
                  </span>
                </div>
              )}

              {state?.emailSent === false && state?.password && (
                <div className="mt-4 p-4 bg-[#FFE93B]/10 border border-[#FFE93B]/30 rounded-[2px] text-left">
                  <div className="text-xs text-[#FFE93B] uppercase tracking-wider mb-2 font-bold">Your Temporary Credentials:</div>
                  <div className="text-sm text-white font-mono break-all mb-1">
                    <span className="text-[#837D72] mr-2">Email:</span> {state.email}
                  </div>
                  <div className="text-sm text-white font-mono break-all">
                    <span className="text-[#837D72] mr-2">Password:</span> {state.password}
                  </div>
                  <div className="mt-3 text-xs text-[#ADABAB]">
                    Please copy and save these credentials now. You will need them to log in.
                  </div>
                </div>
              )}
            </div>

            {/* Pop-up Actions */}
            <div className="pt-3 flex flex-col gap-2">
              <Button
                size="lg"
                variant="primary"
                className="w-full"
                onClick={() => setIsDismissed(true)}
              >
                GOT IT
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
