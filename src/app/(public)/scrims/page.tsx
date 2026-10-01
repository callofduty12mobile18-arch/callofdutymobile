import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Swords, ShieldCheck, Flame, Filter, Users, Trophy } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { ScrimCard } from '@/components/scrims/ScrimCard';
import { getScrimLobbies } from '@/server/actions/scrims';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Competitive Scrim Finder & Matchmaking | CODM India',
  description: 'Find, schedule, and challenge tier-verified Call of Duty: Mobile scrims and matches across Indian esports rosters.',
};

export default async function ScrimsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; status?: string }>;
}) {
  const resolvedParams = await searchParams;
  const lobbies = await getScrimLobbies();

  const activeTier = resolvedParams.tier || 'ALL';
  const filteredLobbies = lobbies.filter((lobby) => {
    if (activeTier !== 'ALL' && lobby.tier !== activeTier) return false;
    if (resolvedParams.status && lobby.status !== resolvedParams.status) return false;
    return true;
  });

  const openCount = lobbies.filter((l) => l.status === 'OPEN').length;
  const confirmedCount = lobbies.filter((l) => l.status === 'CONFIRMED' || l.status === 'IN_PROGRESS').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero / Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#141414] border border-[#2A2A2A] rounded-[2px] p-6 sm:p-10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#FFE93B]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-[#FFE93B]/10 border border-[#FFE93B]/30 text-xs font-bold text-[#FFE93B]">
              <Swords className="w-3.5 h-3.5" />
              <span>CODM INDIA SCRIM MATCHMAKING ENGINE</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight leading-none">
              COMPETITIVE <span className="text-[#FFE93B]">SCRIMS</span> HUB
            </h1>
            <p className="text-sm sm:text-base text-[#ADABAB] leading-relaxed">
              Schedule daily scrims, challenge verified Tier 1/2 clans, and perform automated CDL map vetoes in a streamlined environment.
            </p>
          </div>


        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#2A2A2A]/80 text-xs">
          <div>
            <span className="text-[#ADABAB] block">Open Lobbies</span>
            <span className="font-display font-bold text-xl text-emerald-400">{openCount} Active</span>
          </div>
          <div>
            <span className="text-[#ADABAB] block">Live Matches</span>
            <span className="font-display font-bold text-xl text-[#FFE93B]">{confirmedCount} Scheduled</span>
          </div>
          <div>
            <span className="text-[#ADABAB] block">Map Rotation</span>
            <span className="font-display font-bold text-xl text-white">CDL Standard 2026</span>
          </div>
          <div>
            <span className="text-[#ADABAB] block">Anti-Ghosting</span>
            <span className="font-display font-bold text-xl text-white">Automated Key Reveal</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2A2A2A] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'S_TIER', 'A_TIER', 'B_TIER', 'OPEN'].map((tier) => {
            const isSelected = activeTier === tier;
            return (
              <Link
                key={tier}
                href={tier === 'ALL' ? '/scrims' : `/scrims?tier=${tier}`}
                className={`font-display text-xs font-bold px-3.5 py-1.5 rounded-[2px] border transition-all ${
                  isSelected
                    ? 'bg-[#FFE93B] text-black border-[#FFE93B]'
                    : 'bg-[#141414] text-[#ADABAB] border-[#2A2A2A] hover:text-white hover:border-[#3A3A3A]'
                }`}
              >
                {tier.replace('_', ' ')}
              </Link>
            );
          })}
        </div>

        <div className="text-xs text-[#ADABAB]">
          Showing <strong className="text-white">{filteredLobbies.length}</strong> available scrims
        </div>
      </div>

      {/* Lobbies List */}
      {filteredLobbies.length === 0 ? (
        <div className="bg-[#141414] border border-[#2A2A2A] p-12 text-center rounded-[2px] space-y-4">
          <Swords className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="font-display font-bold text-lg text-white">No Active Scrims Found</h3>
          <p className="text-xs text-[#ADABAB] max-w-sm mx-auto">
            There are no scrim lobbies matching your selected tier filter. Be the first team to host a lobby!
          </p>

        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLobbies.map((scrim) => (
            <ScrimCard key={scrim.id} scrim={scrim} />
          ))}
        </div>
      )}
    </div>
  );
}
