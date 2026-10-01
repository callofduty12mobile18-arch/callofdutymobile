import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, User, Shield, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PlayerCard } from '@/components/players/PlayerCard';
import { TeamCard } from '@/components/teams/TeamCard';
import { TournamentCard } from '@/components/tournaments/TournamentCard';
import { getPublishedPlayers } from '@/server/queries/players';
import { getPublishedTeams } from '@/server/queries/teams';
import { getPublishedTournaments } from '@/server/queries/tournaments';

export const metadata: Metadata = {
  title: 'Search Directory',
  description: 'Search Indian CODM competitive players, teams, and tournament championships.',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolved = await searchParams;
  const query = resolved.q?.trim() || '';

  const [playersData, teams, tournaments] = query
    ? await Promise.all([
        getPublishedPlayers({ query }),
        getPublishedTeams(),
        getPublishedTournaments(),
      ])
    : [{ players: [], total: 0, totalPages: 0 }, [], []];

  const matchedTeams = query
    ? teams.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.tag.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const matchedTournaments = query
    ? tournaments.filter((tr) =>
        tr.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const totalResults = playersData.players.length + matchedTeams.length + matchedTournaments.length;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] pb-24">
      {/* Background Wallpaper - Contained with bottom dark fade */}
      <div
        className="absolute inset-0 bg-cover bg-top opacity-70 pointer-events-none scale-100 transition-opacity"
        style={{
          backgroundImage: `url('/photos/wallpapersden.com_call-of-duty-mobile-gaming-2022_1920x1080.jpg')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Search Header Banner */}
        <div className="border-b border-[#2A2A2A] pb-8 relative overflow-hidden bg-[#141414]/85 backdrop-blur-md p-6 sm:p-8 rounded-[2px] border border-[#837D72]/40 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#FFE93B]" />
          <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase mb-2">
            <Search className="w-4 h-4" />
            <span>DISCOVERY ENGINE</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
            GLOBAL DIRECTORY SEARCH
          </h1>
          <p className="text-[#ADABAB] text-sm mt-2 max-w-2xl">
            Search across competitive players, verified teams, and national tournament championships.
          </p>

          {/* Search Input Bar */}
          <form method="GET" action="/search" className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="relative flex-1">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Type player IGN, real name, team tag, or tournament name..."
                className="w-full bg-[#1F1F1F]/90 text-white border border-[#837D72] text-sm rounded-[50px] pl-12 pr-6 py-3 placeholder:text-[#ADABAB] focus:outline-none focus:border-[#FFE93B]"
                autoFocus
              />
              <Search className="w-5 h-5 text-[#ADABAB] absolute left-4 top-3.5" />
            </div>
            <Button size="lg" variant="primary" type="submit">
              SEARCH DIRECTORY
            </Button>
          </form>
        </div>

        {query && (
          <div className="space-y-12">
            {/* Quick Summary Pill */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-display uppercase tracking-wider text-[#ADABAB]">
                Showing results for &ldquo;<span className="text-[#FFE93B] font-bold">{query}</span>&rdquo;
              </span>
              <span className="text-xs font-display uppercase tracking-wider text-[#FFE93B] font-bold">
                {totalResults} TOTAL MATCHES
              </span>
            </div>

            {/* Players Result Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
                <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase font-bold">
                  <User className="w-4 h-4" />
                  <span>PLAYERS ({playersData.players.length})</span>
                </div>
                {playersData.players.length > 0 && (
                  <Link href={`/players?query=${encodeURIComponent(query)}`} className="text-[11px] text-[#837D72] hover:text-[#FFE93B] font-display uppercase tracking-wider">
                    View All in Directory &rarr;
                  </Link>
                )}
              </div>

              {playersData.players.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {playersData.players.map((p) => (
                    <PlayerCard key={p.id} player={p} />
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-[#141414]/70 backdrop-blur-md border border-[#2A2A2A] rounded-[2px] text-center text-xs text-[#837D72]">
                  No competitive players matching &ldquo;{query}&rdquo;.
                </div>
              )}
            </div>

            {/* Teams Result Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
                <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase font-bold">
                  <Shield className="w-4 h-4" />
                  <span>TEAMS ({matchedTeams.length})</span>
                </div>
                {matchedTeams.length > 0 && (
                  <Link href="/teams" className="text-[11px] text-[#837D72] hover:text-[#FFE93B] font-display uppercase tracking-wider">
                    View Teams Directory &rarr;
                  </Link>
                )}
              </div>

              {matchedTeams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchedTeams.map((t) => (
                    <TeamCard key={t.id} team={t} />
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-[#141414]/70 backdrop-blur-md border border-[#2A2A2A] rounded-[2px] text-center text-xs text-[#837D72]">
                  No teams matching &ldquo;{query}&rdquo;.
                </div>
              )}
            </div>

            {/* Tournaments Result Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
                <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase font-bold">
                  <Trophy className="w-4 h-4" />
                  <span>TOURNAMENTS ({matchedTournaments.length})</span>
                </div>
                {matchedTournaments.length > 0 && (
                  <Link href="/tournaments" className="text-[11px] text-[#837D72] hover:text-[#FFE93B] font-display uppercase tracking-wider">
                    View Tournaments Directory &rarr;
                  </Link>
                )}
              </div>

              {matchedTournaments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchedTournaments.map((tr) => (
                    <TournamentCard key={tr.id} tournament={tr} />
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-[#141414]/70 backdrop-blur-md border border-[#2A2A2A] rounded-[2px] text-center text-xs text-[#837D72]">
                  No tournaments matching &ldquo;{query}&rdquo;.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
