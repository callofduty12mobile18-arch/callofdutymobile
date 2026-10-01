import * as React from 'react';
import type { Metadata } from 'next';
import { Shield } from 'lucide-react';
import { TeamCard } from '@/components/teams/TeamCard';
import { getPublishedTeams } from '@/server/queries/teams';

export const metadata: Metadata = {
  title: 'Indian CODM Competitive Teams & Rosters',
  description:
    'Directory of active competitive Call of Duty: Mobile teams, clans, and organizations in India.',
};

export default async function TeamsPage() {
  const teams = await getPublishedTeams();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] pb-24">
      {/* Teams Page Background Wallpaper - Contained with bottom dark fade */}
      <div
        className="absolute inset-0 bg-cover bg-top opacity-70 pointer-events-none scale-100 transition-opacity"
        style={{
          backgroundImage: `url('/photos/wallpapersden.com_call-of-duty-mobile-gaming-2022_1920x1080.jpg')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="border-b border-[#2A2A2A] pb-8 relative overflow-hidden bg-[#141414]/80 backdrop-blur-md p-6 sm:p-8 rounded-[2px] border border-[#837D72]/40 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#FFE93B]" />
          <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase mb-2">
            <Shield className="w-4 h-4" />
            <span>COMPETITIVE ROSTERS</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
                TEAMS & CLANS
              </h1>
              <p className="text-[#ADABAB] text-sm mt-2 max-w-xl">
                Official records of active competitive teams, active starting rosters, and team championships in India.
              </p>
            </div>
            <div className="text-right">
              <span className="font-display font-black text-2xl sm:text-3xl text-[#FFE93B] block">
                {teams.length}
              </span>
              <span className="text-[11px] text-[#837D72] font-display uppercase tracking-wider">
                ACTIVE ROSTERS
              </span>
            </div>
          </div>
        </div>

        {/* Grid */}
        {teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-[#141414]/70 backdrop-blur-md border border-[#837D72]/40 rounded-[2px] shadow-2xl">
            <p className="text-[#ADABAB] font-display uppercase tracking-wider text-sm">
              No competitive teams registered or published yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
