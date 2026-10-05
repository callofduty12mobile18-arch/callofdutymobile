'use client';

import * as React from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, X, Key, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { directInvitePlayerAction } from '@/server/actions/community';

interface DirectInviteModalProps {
  triggerButtonText?: string;
  className?: string;
}

export const DirectInviteModal: React.FC<DirectInviteModalProps> = ({
  triggerButtonText = 'SEND INVITATION EMAIL',
  className = '',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [result, setResult] = React.useState<{
    success: boolean;
    message?: string;
    error?: string;
    credentials?: { email: string; password: string };
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const res = await directInvitePlayerAction(formData);
    setIsPending(false);
    setResult(res);
  };

  const handleClose = () => {
    setIsOpen(false);
    setResult(null);
  };

  return (
    <>
      <Button
        size="sm"
        variant="primary"
        className={className}
        onClick={() => setIsOpen(true)}
      >
        <Mail className="w-4 h-4 mr-1.5" />
        {triggerButtonText}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#141414] border-2 border-[#FFE93B] rounded-[2px] p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(255,233,59,0.25)] text-left">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-[#837D72] hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase mb-1">
                <UserPlus className="w-4 h-4" />
                <span>OFFICIAL PLAYER ONBOARDING</span>
              </div>
              <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-tight">
                SEND PLAYER INVITATION
              </h3>
              <p className="text-xs text-[#ADABAB] mt-1 leading-relaxed">
                Enter the player&apos;s email address. An official invitation containing their exclusive access key and direct URL link to the login studio will be dispatched immediately.
              </p>
            </div>

            {/* Form */}
            {result?.success ? (
              <div className="space-y-4 bg-[#1F1F1F] border border-[#FFE93B]/40 p-5 rounded-[2px]">
                <div className="flex items-center gap-2 text-[#FFE93B]">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span className="font-display font-bold text-sm tracking-wide">
                    INVITATION DISPATCHED SUCCESSFULLY!
                  </span>
                </div>
                <p className="text-xs text-[#ADABAB] leading-relaxed">
                  {result.message}
                </p>
                <div className="pt-2 flex justify-end">
                  <Button size="sm" variant="primary" onClick={handleClose}>
                    DONE
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {result?.error && (
                  <div className="p-3 bg-red-950/40 border border-red-800 text-red-400 text-xs flex items-center gap-2 rounded-[2px]">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{result.error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-display uppercase tracking-wider text-[#ADABAB] mb-1 font-semibold">
                    Player Email Address <span className="text-[#FFE93B]">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="player@gmail.com"
                    className="w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFE93B] transition-colors placeholder:text-[#837D72]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-display uppercase tracking-wider text-[#ADABAB] mb-1 font-semibold">
                      IGN / Gamer Tag
                    </label>
                    <input
                      type="text"
                      name="gamerTag"
                      placeholder="e.g. VENOM, SCOUT"
                      className="w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFE93B] transition-colors placeholder:text-[#837D72]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-display uppercase tracking-wider text-[#ADABAB] mb-1 font-semibold">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFE93B] transition-colors placeholder:text-[#837D72]"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    size="md"
                    variant="ghost"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="md"
                    variant="primary"
                    isLoading={isPending}
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    DISPATCH INVITATION EMAIL
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
