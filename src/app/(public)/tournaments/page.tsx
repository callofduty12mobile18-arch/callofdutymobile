import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Trophy, Swords, Calendar, Flame, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TournamentCard } from '@/components/tournaments/TournamentCard';
import { getPublishedTournaments } from '@/server/queries/tournaments';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Indian MobileRoster Tournaments & Championships | MOBILEROSTER',
  description:
    'Verified calendar, championship prize pools, standings, and results for Indian MobileRoster competitive tournaments.',
};

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; tier?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const tournaments = await getPublishedTournaments();

  const activeStatus = resolvedParams.status || 'ALL';
  const filteredTournaments = tournaments.filter((tournament) => {
    if (activeStatus !== 'ALL' && tournament.status !== activeStatus) return false;
    if (resolvedParams.tier && tournament.tier !== resolvedParams.tier) return false;
    return true;
  });

  const ongoingCount = tournaments.filter((t) => t.status === 'ONGOING').length;
  const completedCount = tournaments.filter((t) => t.status === 'COMPLETED').length;
  const upcomingCount = tournaments.filter((t) => t.status === 'UPCOMING').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero / Header Section matching Scrims Hub */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#141414] border border-[#2A2A2A] rounded-[2px] p-6 sm:p-10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#FFE93B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-[#FFE93B]/10 border border-[#FFE93B]/30 text-xs font-bold text-[#FFE93B]">
              <Trophy className="w-3.5 h-3.5" />
              <span>MOBILEROSTER COMPETITIVE CIRCUIT</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight leading-none">
              TOURNAMENT <span className="text-[#FFE93B]">CALENDAR</span>
            </h1>
            <p className="text-sm sm:text-base text-[#ADABAB] leading-relaxed">
              Verified records of national LAN championships, seasonal leagues, regional qualifiers, and official community cups.
            </p>
          </div>


        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#2A2A2A]/80 text-xs">
          <div>
            <span className="text-[#ADABAB] block">Total Events</span>
            <span className="font-display font-bold text-xl text-white">{tournaments.length} Registered</span>
          </div>
          <div>
            <span className="text-[#ADABAB] block">Live Status</span>
            <span className="font-display font-bold text-xl text-amber-400">{ongoingCount} Ongoing</span>
          </div>
          <div>
            <span className="text-[#ADABAB] block">Upcoming LANs</span>
            <span className="font-display font-bold text-xl text-[#FFE93B]">{upcomingCount} Scheduled</span>
          </div>
          <div>
            <span className="text-[#ADABAB] block">Concluded Events</span>
            <span className="font-display font-bold text-xl text-emerald-400">{completedCount} Archived</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2A2A2A] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'ONGOING', 'UPCOMING', 'COMPLETED'].map((status) => {
            const isSelected = activeStatus === status;
            return (
              <Link
                key={status}
                href={status === 'ALL' ? '/tournaments' : `/tournaments?status=${status}`}
                className={`font-display text-xs font-bold px-3.5 py-1.5 rounded-[2px] border transition-all ${
                  isSelected
                    ? 'bg-[#FFE93B] text-black border-[#FFE93B]'
                    : 'bg-[#141414] text-[#ADABAB] border-[#2A2A2A] hover:text-white hover:border-[#3A3A3A]'
                }`}
              >
                {status}
              </Link>
            );
          })}
        </div>

        <div className="text-xs text-[#ADABAB]">
          Showing <strong className="text-white">{filteredTournaments.length}</strong> official events
        </div>
      </div>

      {/* Tournaments Grid */}
      {filteredTournaments.length === 0 ? (
        <div className="bg-[#141414] border border-[#2A2A2A] p-12 text-center rounded-[2px] space-y-4">
          <Trophy className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="font-display font-bold text-lg text-white">No Tournaments Found</h3>
          <p className="text-xs text-[#ADABAB] max-w-sm mx-auto">
            There are no tournaments currently matching the selected filter. Stay tuned for upcoming circuit registrations.
          </p>
          <Link href="/tournaments">
            <Button size="sm" variant="outline">
              VIEW ALL EVENTS
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}
    </div>
  );
}
