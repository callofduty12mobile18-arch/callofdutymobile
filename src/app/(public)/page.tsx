import * as React from 'react';
import Link from 'next/link';
import { Shield, Trophy, Users, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PlayerGrid } from '@/components/players/PlayerGrid';
import { TeamCard } from '@/components/teams/TeamCard';
import { TournamentCard } from '@/components/tournaments/TournamentCard';
import { getPublishedPlayers } from '@/server/queries/players';
import { getPublishedTeams } from '@/server/queries/teams';
import { getPublishedTournaments } from '@/server/queries/tournaments';

export const revalidate = 60;

export default async function HomePage() {
  const [playersData, teams, tournaments] = await Promise.all([
    getPublishedPlayers({ limit: 4 }),
    getPublishedTeams(),
    getPublishedTournaments(),
  ]);

  const featuredPlayers = playersData.players.slice(0, 4);
  const featuredTeams = teams.slice(0, 3);
  const featuredTournaments = tournaments.slice(0, 3);

  return (
    <div className="w-full space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#2A2A2A]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_25%,rgba(182,243,107,0.16),transparent_28%),linear-gradient(125deg,#07090b_24%,#111a18_65%,#17251f)]" />
        <div className="absolute right-[-10%] top-[-20%] h-[34rem] w-[34rem] rounded-full border border-[#b6f36b]/15 shadow-[0_0_160px_rgba(182,243,107,0.1)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090b] via-transparent to-[#07090b]/30" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141414]/90 border border-[#837D72] rounded-[3px] text-xs font-display tracking-widest uppercase text-[#FFE93B] backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#FFE93B] animate-pulse" />
              THE INDIAN COMPETITIVE ARCHIVE
            </div>

            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight uppercase leading-[0.95] text-white">
              DOCUMENTING <br />
              <span className="text-[#b6f36b]">INDIAN ESPORTS</span> <br />
              COMPETITIVE EXCELLENCE.
            </h1>

            <p className="text-base sm:text-lg text-[#ADABAB] leading-relaxed max-w-2xl font-normal">
              Structured profiles, verified records, tournament championships, and team rosters for India’s competitive gaming ecosystem.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link href="/players">
                <Button size="lg" variant="primary">
                  EXPLORE PLAYERS
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/join">
                <Button size="lg" variant="secondary">
                  JOIN THE COMMUNITY
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED PLAYERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase mb-1">
              <Users className="w-4 h-4" />
              <span>TOP COMPETITORS</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
              FEATURED PLAYERS
            </h2>
          </div>
          <Link
            href="/players"
            className="inline-flex items-center gap-1 text-xs font-display font-bold uppercase tracking-wider text-[#FFE93B] hover:underline"
          >
            VIEW FULL DIRECTORY
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <PlayerGrid players={featuredPlayers} />
      </section>

      {/* 3. FEATURED TEAMS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase mb-1">
              <Shield className="w-4 h-4" />
              <span>ACTIVE ROSTERS</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
              COMPETITIVE TEAMS
            </h2>
          </div>
          <Link
            href="/teams"
            className="inline-flex items-center gap-1 text-xs font-display font-bold uppercase tracking-wider text-[#FFE93B] hover:underline"
          >
            VIEW ALL TEAMS
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-[#141414] border border-[#2A2A2A] rounded-[2px] text-center text-xs text-[#837D72]">
            No competitive teams published yet.
          </div>
        )}
      </section>

      {/* 4. TOURNAMENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase mb-1">
              <Trophy className="w-4 h-4" />
              <span>CHAMPIONSHIPS & CUPS</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
              PREMIER TOURNAMENTS
            </h2>
          </div>
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-1 text-xs font-display font-bold uppercase tracking-wider text-[#FFE93B] hover:underline"
          >
            VIEW ALL TOURNAMENTS
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-[#141414] border border-[#2A2A2A] rounded-[2px] text-center text-xs text-[#837D72]">
            No official tournaments published yet.
          </div>
        )}
      </section>

      {/* 5. COMMUNITY ACCESS CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="relative overflow-hidden bg-[#141414] border border-[#837D72] rounded-[2px] p-8 sm:p-12 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
          {/* Subtle accent border top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFE93B]" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_50%,rgba(182,243,107,0.16),transparent_32%),linear-gradient(90deg,#141a18,#101412)]" />

          <div className="max-w-2xl relative z-10">
            <Badge variant="outline" className="mb-4">
              COMMUNITY ACCESS
            </Badge>
            <h3 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
              JOIN THE INDIAN COMPETITIVE COMMUNITY
            </h3>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link href="/join">
                <Button size="lg" variant="primary">
                  JOIN WITH THE COMMUNITY
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
