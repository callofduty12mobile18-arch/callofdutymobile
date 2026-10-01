import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Swords, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TeamCard } from '@/components/teams/TeamCard';
import { getPublishedTeams } from '@/server/queries/teams';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Indian MobileRoster Competitive Teams & Rosters | MOBILEROSTER',
  description:
    'Directory of active competitive MobileRoster teams, starting rosters, organizations, and championships in India.',
};

export default async function TeamsPage() {
  const teams = await getPublishedTeams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero / Header Section matching Scrims Hub */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#141414] border border-[#2A2A2A] rounded-[2px] p-6 sm:p-10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#FFE93B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-[#FFE93B]/10 border border-[#FFE93B]/30 text-xs font-bold text-[#FFE93B]">
              <Shield className="w-3.5 h-3.5" />
              <span>OFFICIAL COMPETITIVE ROSTER REGISTRY</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight leading-none">
              COMPETITIVE <span className="text-[#FFE93B]">TEAMS</span> & CLANS
            </h1>
            <p className="text-sm sm:text-base text-[#ADABAB] leading-relaxed">
              Official records of verified competitive organizations, active starting rosters, and championship-winning clans in India.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link href="/scrims">
              <Button size="lg" variant="primary" className="w-full sm:w-auto shadow-lg shadow-[#FFE93B]/10">
                <Swords className="w-4 h-4 mr-2" />
                CHALLENGE IN SCRIMS
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter / Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2A2A2A] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-xs font-bold px-3.5 py-1.5 rounded-[2px] bg-[#FFE93B] text-black border border-[#FFE93B]">
            ALL TEAMS
          </span>
        </div>

        <div className="text-xs text-[#ADABAB]">
          Showing <strong className="text-white">{teams.length}</strong> competitive rosters
        </div>
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <div className="bg-[#141414] border border-[#2A2A2A] p-12 text-center rounded-[2px] space-y-4">
          <Shield className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="font-display font-bold text-lg text-white">No Competitive Teams Found</h3>
          <p className="text-xs text-[#ADABAB] max-w-sm mx-auto">
            There are currently no competitive teams registered. Join the community to submit your clan roster.
          </p>
          <Link href="/join">
            <Button size="sm" variant="primary">
              <Plus className="w-4 h-4 mr-1.5" /> REGISTER A SQUAD
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
