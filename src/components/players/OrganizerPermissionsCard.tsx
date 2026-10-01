'use client';

import * as React from 'react';
import { Trophy, Swords, ShieldCheck, Clock, CheckCircle2, AlertCircle, Plus, Send, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { submitOrganizerRequestAction, OrganizerPermissionResponse } from '@/server/actions/organizer';
import Link from 'next/link';

export const OrganizerPermissionsCard: React.FC<{
  permissions: OrganizerPermissionResponse;
  userEmail: string;
  userIgn: string;
}> = ({ permissions, userEmail, userIgn }) => {
  const [modalType, setModalType] = React.useState<'TOURNAMENT' | 'SCRIM' | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ success?: boolean; message?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!modalType) return;

    setSubmitting(true);
    setFeedback(null);
    const formData = new FormData(e.currentTarget);
    const res = await submitOrganizerRequestAction(modalType, formData);
    setSubmitting(false);

    setFeedback(res);
    if (res.success) {
      setTimeout(() => {
        setModalType(null);
        setFeedback(null);
      }, 2500);
    }
  };

  return (
    <Card className="border-[#FFE93B]/30 bg-gradient-to-br from-[#181818] via-[#141414] to-[#101010]">
      <CardHeader className="border-b border-[#2A2A2A] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[2px] bg-[#FFE93B]/10 text-[#FFE93B] border border-[#FFE93B]/40 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base text-white font-display uppercase tracking-wide flex items-center gap-2">
                Organizer Permissions & Hosting Hub
              </CardTitle>
              <p className="text-xs text-[#837D72]">
                Organize community tournaments or host scrim lobbies after Admin verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {permissions.canOrganizeTournaments && (
              <Badge variant="verified" className="text-[10px]">
                <CheckCircle2 className="w-3 h-3 mr-1" /> TOURNAMENT VERIFIED
              </Badge>
            )}
            {permissions.canOrganizeScrims && (
              <Badge variant="verified" className="text-[10px] bg-cyan-950/40 text-cyan-400 border border-cyan-800/40">
                <CheckCircle2 className="w-3 h-3 mr-1" /> SCRIM HOST VERIFIED
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tournament Organizer Box */}
          <div className="p-4 bg-[#1C1C1C] border border-[#2E2E2E] rounded-[2px] flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-display font-bold text-white uppercase flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-[#FFE93B]" /> Tournament Organizing
                </span>
                {permissions.canOrganizeTournaments ? (
                  <Badge variant="verified" className="text-[9px]">APPROVED</Badge>
                ) : permissions.pendingTournamentRequests > 0 ? (
                  <Badge variant="warning" className="text-[9px] animate-pulse">UNDER REVIEW</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[9px]">PERMISSION REQUIRED</Badge>
                )}
              </div>
              <p className="text-xs text-[#ADABAB] leading-relaxed">
                {permissions.canOrganizeTournaments
                  ? 'Your organizer permissions are active. Your approved events will be published to the official /tournaments page under Admin oversight.'
                  : 'Submit a request to Admin with your event structure, format, and prize pool to receive verified organizer privileges.'}
              </p>
            </div>

            <div className="pt-2 border-t border-[#2A2A2A] flex items-center justify-between">
              {permissions.canOrganizeTournaments ? (
                <div className="flex items-center gap-2 w-full">
                  <Button
                    size="sm"
                    variant="primary"
                    className="text-xs w-full font-bold"
                    onClick={() => setModalType('TOURNAMENT')}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    SUBMIT ANOTHER TOURNAMENT
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs w-full text-[#FFE93B] border-[#FFE93B]/40 hover:bg-[#FFE93B]/10 font-bold"
                  onClick={() => setModalType('TOURNAMENT')}
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  {permissions.pendingTournamentRequests > 0 ? 'SUBMIT ADDITIONAL DETAILS' : 'REQUEST TOURNAMENT PERMISSION'}
                </Button>
              )}
            </div>
          </div>

          {/* Scrim Host Box */}
          <div className="p-4 bg-[#1C1C1C] border border-[#2E2E2E] rounded-[2px] flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-display font-bold text-white uppercase flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-cyan-400" /> Scrim Matchmaking
                </span>
                {permissions.canOrganizeScrims ? (
                  <Badge variant="verified" className="text-[9px] bg-cyan-950/40 text-cyan-400 border border-cyan-800/40">APPROVED</Badge>
                ) : permissions.pendingScrimRequests > 0 ? (
                  <Badge variant="warning" className="text-[9px] animate-pulse">UNDER REVIEW</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[9px]">PERMISSION REQUIRED</Badge>
                )}
              </div>
              <p className="text-xs text-[#ADABAB] leading-relaxed">
                {permissions.canOrganizeScrims
                  ? 'You are authorized to host live Tier 1/2 competitive scrim lobbies directly on /scrims with automated slot allocations.'
                  : 'Request scrim host authorization to host custom room scrims for Indian clans with verified team rosters.'}
              </p>
            </div>

            <div className="pt-2 border-t border-[#2A2A2A] flex items-center justify-between">
              {permissions.canOrganizeScrims ? (
                <Link href="/scrims/create" className="w-full">
                  <Button size="sm" variant="primary" className="text-xs w-full font-bold bg-cyan-500 hover:bg-cyan-400 text-black border-none">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    CREATE NEW SCRIM LOBBY
                  </Button>
                </Link>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs w-full text-cyan-400 border-cyan-800 hover:bg-cyan-950/20 font-bold"
                  onClick={() => setModalType('SCRIM')}
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  {permissions.pendingScrimRequests > 0 ? 'SUBMIT ADDITIONAL DETAILS' : 'REQUEST SCRIM HOST PERMISSION'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Modal / Slide-in Dialog for Requesting Permission */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#181818] border border-[#2E2E2E] rounded-[2px] max-w-lg w-full p-6 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
              <div className="flex items-center gap-2">
                {modalType === 'TOURNAMENT' ? (
                  <Trophy className="w-5 h-5 text-[#FFE93B]" />
                ) : (
                  <Swords className="w-5 h-5 text-cyan-400" />
                )}
                <h3 className="font-display font-bold text-base text-white uppercase">
                  Request {modalType === 'TOURNAMENT' ? 'Tournament Organizer' : 'Scrim Host'} Permission
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="text-[#837D72] hover:text-white transition-colors text-xs font-mono"
              >
                ✕ ESC
              </button>
            </div>

            <p className="text-xs text-[#ADABAB] leading-relaxed">
              Fill out the details below. Once submitted, the Admin will review your event credentials. Upon approval, you will be granted organizer permissions and your event will appear on the official pages.
            </p>

            {feedback && (
              <div className={`p-3 rounded-[2px] text-xs font-semibold flex items-center gap-2 ${feedback.success ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40' : 'bg-rose-950/40 text-rose-300 border border-rose-800/40'}`}>
                {feedback.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-display uppercase text-[#CCCCCC] mb-1">
                  Event / Tournament / Scrim Title *
                </label>
                <input
                  type="text"
                  name="eventTitle"
                  required
                  placeholder="e.g., GodLike Invitational Season 4 / T1 Night Scrims"
                  className="w-full bg-[#121212] border border-[#2E2E2E] rounded-[2px] px-3 py-2 text-white placeholder-[#555] focus:outline-none focus:border-[#FFE93B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-display uppercase text-[#CCCCCC] mb-1">
                    Organization / Clan Name
                  </label>
                  <input
                    type="text"
                    name="organizationOrClan"
                    defaultValue={userIgn}
                    placeholder="e.g. S8UL / Vitality India"
                    className="w-full bg-[#121212] border border-[#2E2E2E] rounded-[2px] px-3 py-2 text-white placeholder-[#555] focus:outline-none focus:border-[#FFE93B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-display uppercase text-[#CCCCCC] mb-1">
                    Planned Date & Time
                  </label>
                  <input
                    type="text"
                    name="plannedDate"
                    placeholder="e.g. Oct 15-20, 2026 / Daily 9:00 PM"
                    className="w-full bg-[#121212] border border-[#2E2E2E] rounded-[2px] px-3 py-2 text-white placeholder-[#555] focus:outline-none focus:border-[#FFE93B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-display uppercase text-[#CCCCCC] mb-1">
                    Prize Pool (if any)
                  </label>
                  <input
                    type="text"
                    name="prizePool"
                    placeholder="e.g. ₹50,000 INR or Free Entry"
                    className="w-full bg-[#121212] border border-[#2E2E2E] rounded-[2px] px-3 py-2 text-white placeholder-[#555] focus:outline-none focus:border-[#FFE93B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-display uppercase text-[#CCCCCC] mb-1">
                    Discord / Phone Contact *
                  </label>
                  <input
                    type="text"
                    name="discordOrContact"
                    defaultValue={userEmail}
                    required
                    placeholder="e.g. discord_handle or 9876543210"
                    className="w-full bg-[#121212] border border-[#2E2E2E] rounded-[2px] px-3 py-2 text-white placeholder-[#555] focus:outline-none focus:border-[#FFE93B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-display uppercase text-[#CCCCCC] mb-1">
                  Format / Rules / Structure
                </label>
                <input
                  type="text"
                  name="format"
                  placeholder="e.g. 5v5 Search & Destroy / Hardpoint, Single Elimination"
                  className="w-full bg-[#121212] border border-[#2E2E2E] rounded-[2px] px-3 py-2 text-white placeholder-[#555] focus:outline-none focus:border-[#FFE93B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-display uppercase text-[#CCCCCC] mb-1">
                  Additional Notes / Verification Info for Admin
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Provide social links, previous hosting experience, or stream links for faster verification..."
                  className="w-full bg-[#121212] border border-[#2E2E2E] rounded-[2px] px-3 py-2 text-white placeholder-[#555] focus:outline-none focus:border-[#FFE93B]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A2A2A]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalType(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={submitting}
                  className="font-bold px-4"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  SUBMIT TO ADMIN
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};
