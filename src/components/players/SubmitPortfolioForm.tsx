'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { CheckCircle2, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { submitPlayerPortfolio, SubmissionResponse } from '@/server/actions/submissions';
import { INDIAN_STATES } from '@/lib/constants/states';

const ROLES = [
  { value: 'SLAYER', label: 'Slayer (Entry Fragger / High Fragging)' },
  { value: 'ANCHOR', label: 'Anchor (Spawn Control / Hardpoint Anchor)' },
  { value: 'OBJ', label: 'Objective (OBJ / Hill Time / Bomb Carrier)' },
  { value: 'IGL', label: 'In-Game Leader (IGL / Strategist)' },
  { value: 'SNIPER', label: 'Sniper (Precision / Search & Destroy Specialist)' },
  { value: 'FLEX', label: 'Flex (Versatile SMG & AR player)' },
  { value: 'SUPPORT', label: 'Support (Trade Frags / Tactical Equipment)' },
];

export const SubmitPortfolioForm: React.FC = () => {
  const [state, formAction, isPending] = useActionState(submitPlayerPortfolio, null);

  if (state?.success) {
    return (
      <div className="p-8 sm:p-12 bg-[#141414] border border-[#FFE93B] rounded-[2px] text-center space-y-4">
        <div className="w-16 h-16 bg-[#FFE93B]/10 border border-[#FFE93B]/30 rounded-full flex items-center justify-center mx-auto text-[#FFE93B]">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="font-display font-black text-2xl text-white uppercase tracking-tight">
          Portfolio Received!
        </h3>
        <p className="text-sm text-[#ADABAB] max-w-md mx-auto leading-relaxed">
          {state.message}
        </p>
        {state.submissionId && (
          <p className="text-xs text-[#837D72] font-mono">
            Submission Reference: {state.submissionId}
          </p>
        )}
        <div className="pt-4">
          <Button variant="primary" onClick={() => window.location.reload()}>
            Submit Another Player
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8 bg-[#141414] border border-[#2A2A2A] p-6 sm:p-10 rounded-[2px]">
      {state && !state.success && (
        <div className="p-4 bg-[#FF3D00]/10 border border-[#FF3D00]/30 rounded-[2px] flex items-center gap-3 text-sm text-[#FF3D00]">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {/* Honeypot anti-spam */}
      <input type="text" name="honeypot" className="hidden" tabIndex={-1} autoComplete="off" />

      {/* Section 1: Submitter Contact */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#2A2A2A] pb-2">
          <span className="w-5 h-5 rounded-[2px] bg-[#FFE93B] text-black font-display font-bold text-xs flex items-center justify-center">
            1
          </span>
          <h3 className="font-display font-bold text-white uppercase text-sm tracking-wider">
            Contact Information
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
              Full Name *
            </label>
            <Input
              name="submitterName"
              placeholder="e.g. Jash Shah"
              required
              error={state?.errors?.submitterName?.[0]}
            />
          </div>
          <div>
            <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
              Email Address *
            </label>
            <Input
              name="submitterEmail"
              type="email"
              placeholder="e.g. player@gmail.com"
              required
              error={state?.errors?.submitterEmail?.[0]}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Player Gaming Profile */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#2A2A2A] pb-2">
          <span className="w-5 h-5 rounded-[2px] bg-[#FFE93B] text-black font-display font-bold text-xs flex items-center justify-center">
            2
          </span>
          <h3 className="font-display font-bold text-white uppercase text-sm tracking-wider">
            Competitive Player Details
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
              IGN / Gamer Tag *
            </label>
            <Input
              name="ign"
              placeholder="e.g. Learn"
              required
              error={state?.errors?.ign?.[0]}
            />
          </div>
          <div>
            <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
              Display / Real Name
            </label>
            <Input name="displayName" placeholder="e.g. Jash" />
          </div>
          <div>
            <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
              Competitive Role *
            </label>
            <select
              name="primaryRole"
              defaultValue="SLAYER"
              className="w-full bg-[#1F1F1F] text-white border border-[#837D72] text-sm rounded-[50px] px-5 py-2.5 focus:outline-none focus:border-[#FFE93B]"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
              Current Team
            </label>
            <Input name="currentTeam" placeholder="e.g. GodLike (or Free Agent)" />
          </div>
          <div>
            <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
              State (India)
            </label>
            <select
              name="state"
              defaultValue=""
              className="w-full bg-[#1F1F1F] text-white border border-[#837D72] text-sm rounded-[50px] px-5 py-2.5 focus:outline-none focus:border-[#FFE93B]"
            >
              <option value="">Select State / UT</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
            Competitive Bio
          </label>
          <textarea
            name="bio"
            rows={3}
            placeholder="Describe your competitive playstyle, device (phone/tablet), and competitive journey..."
            className="w-full bg-[#1F1F1F] text-white border border-[#837D72] rounded-[2px] p-3 text-sm focus:outline-none focus:border-[#FFE93B] placeholder:text-[#ADABAB]"
          />
        </div>

        <div>
          <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
            Tournament Placements & Achievements
          </label>
          <textarea
            name="achievements"
            rows={3}
            placeholder="List major tournaments played, placements (e.g., 1st Place - SPS Stage 4, Top 4 Regional Qualifiers), and MVP titles..."
            className="w-full bg-[#1F1F1F] text-white border border-[#837D72] rounded-[2px] p-3 text-sm focus:outline-none focus:border-[#FFE93B] placeholder:text-[#ADABAB]"
          />
        </div>
      </div>

      {/* Section 3: Social & Proofs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#2A2A2A] pb-2">
          <span className="w-5 h-5 rounded-[2px] bg-[#FFE93B] text-black font-display font-bold text-xs flex items-center justify-center">
            3
          </span>
          <h3 className="font-display font-bold text-white uppercase text-sm tracking-wider">
            Social Media & Verification
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
              YouTube Channel URL
            </label>
            <Input name="youtubeUrl" placeholder="https://youtube.com/@channel" />
          </div>
          <div>
            <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
              Instagram Profile URL
            </label>
            <Input name="instagramUrl" placeholder="https://instagram.com/handle" />
          </div>
          <div>
            <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
              Twitter / X URL
            </label>
            <Input name="twitterUrl" placeholder="https://x.com/handle" />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#2A2A2A] flex items-center justify-between">
        <span className="text-xs text-[#837D72] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#FFE93B]" />
          Admin reviewed before publishing
        </span>
        <Button size="lg" variant="primary" type="submit" isLoading={isPending}>
          SUBMIT PLAYER PORTFOLIO
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
};
