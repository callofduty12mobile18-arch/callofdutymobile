import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, User, Shield, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PlayerCard } from '@/components/players/PlayerCard';
import { TeamCard } from '@/components/teams/TeamCard';
import { TournamentCard } from '@/components/tournaments/TournamentCard';
import { getPublishedPlayers } from '@/server/queries/players';
import { getPublishedTeams } from '@/server/queries/teams';
import { getPublishedTournaments } from '@/server/queries/tournaments';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Global Directory Search | CODM India',
  description: 'Search Indian CODM competitive players, teams, and tournament championships.',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const resolved = searchParams ? await searchParams : {};
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Search Header Banner matching Scrims Hub */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#141414] border border-[#2A2A2A] rounded-[2px] p-6 sm:p-10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#FFE93B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-[#FFE93B]/10 border border-[#FFE93B]/30 text-xs font-bold text-[#FFE93B]">
            <Search className="w-3.5 h-3.5" />
            <span>GLOBAL DISCOVERY ENGINE</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight leading-none">
            DIRECTORY <span className="text-[#FFE93B]">SEARCH</span>
          </h1>
          <p className="text-sm sm:text-base text-[#ADABAB] leading-relaxed">
            Search across competitive players, verified team rosters, clans, and national tournament championships.
          </p>

          {/* Search Input Bar */}
          <form method="GET" action="/search" className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Type player IGN, real name, team tag, or tournament name..."
                className="w-full bg-[#1C1C1C] text-white border border-[#2A2A2A] text-sm rounded-[2px] pl-11 pr-5 py-3 placeholder:text-[#ADABAB] focus:outline-none focus:border-[#FFE93B] transition-colors"
                autoFocus
              />
              <Search className="w-4 h-4 text-[#ADABAB] absolute left-4 top-4" />
            </div>
            <Button size="lg" variant="primary" type="submit" className="shadow-lg shadow-[#FFE93B]/10">
              SEARCH DATABASE
            </Button>
          </form>
        </div>
      </div>

      {query ? (
        <div className="space-y-12">
          {/* Quick Summary Pill */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2A2A2A] pb-4">
            <span className="text-xs font-display uppercase tracking-wider text-[#ADABAB]">
              Showing results for &ldquo;<span className="text-[#FFE93B] font-bold">{query}</span>&rdquo;
            </span>
            <span className="text-xs font-display uppercase tracking-wider text-[#FFE93B] font-bold bg-[#1C1C1C] border border-[#333333] px-3 py-1 rounded-[2px]">
              {totalResults} TOTAL MATCHES
            </span>
          </div>

          {/* Players Result Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#222222] pb-2">
              <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase font-bold">
                <User className="w-4 h-4" />
                <span>PLAYERS ({playersData.players.length})</span>
              </div>
              {playersData.players.length > 0 && (
                <Link href={`/players?query=${encodeURIComponent(query)}`} className="text-[11px] text-[#ADABAB] hover:text-[#FFE93B] font-display uppercase tracking-wider transition-colors">
                  View All in Directory &rarr;
                </Link>
              )}
            </div>

            {playersData.players.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {playersData.players.map((p) => (
                  <PlayerCard key={p.id} player={p} />
                ))}
              </div>
            ) : (
              <div className="p-8 bg-[#141414] border border-[#2A2A2A] rounded-[2px] text-center text-xs text-[#ADABAB]">
                No competitive players found matching &ldquo;{query}&rdquo;.
              </div>
            )}
          </div>

          {/* Teams Result Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#222222] pb-2">
              <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase font-bold">
                <Shield className="w-4 h-4" />
                <span>TEAMS ({matchedTeams.length})</span>
              </div>
              {matchedTeams.length > 0 && (
                <Link href="/teams" className="text-[11px] text-[#ADABAB] hover:text-[#FFE93B] font-display uppercase tracking-wider transition-colors">
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
              <div className="p-8 bg-[#141414] border border-[#2A2A2A] rounded-[2px] text-center text-xs text-[#ADABAB]">
                No competitive teams found matching &ldquo;{query}&rdquo;.
              </div>
            )}
          </div>

          {/* Tournaments Result Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#222222] pb-2">
              <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase font-bold">
                <Trophy className="w-4 h-4" />
                <span>TOURNAMENTS ({matchedTournaments.length})</span>
              </div>
              {matchedTournaments.length > 0 && (
                <Link href="/tournaments" className="text-[11px] text-[#ADABAB] hover:text-[#FFE93B] font-display uppercase tracking-wider transition-colors">
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
              <div className="p-8 bg-[#141414] border border-[#2A2A2A] rounded-[2px] text-center text-xs text-[#ADABAB]">
                No tournaments found matching &ldquo;{query}&rdquo;.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty / Initial Search Suggestion Box */
        <div className="bg-[#141414] border border-[#2A2A2A] p-12 text-center rounded-[2px] space-y-4">
          <Search className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="font-display font-bold text-lg text-white">Search the National Archive</h3>
          <p className="text-xs text-[#ADABAB] max-w-md mx-auto">
            Type an in-game name (e.g. &ldquo;Learn&rdquo;, &ldquo;Sammy&rdquo;), team clan tag (e.g. &ldquo;GODL&rdquo;, &ldquo;VIT&rdquo;), or tournament name to search the directory.
          </p>
        </div>
      )}
    </div>
  );
}
