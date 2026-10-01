import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, User } from 'lucide-react';
import { PlayerGrid } from '@/components/players/PlayerGrid';
import { Button } from '@/components/ui/Button';
import { getPublishedPlayers } from '@/server/queries/players';
import { PlayerRole } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Indian CODM Players Directory | CODM India',
  description:
    'Browse verified Indian Call of Duty: Mobile competitive players, in-game leaders, slayers, anchors, and snipers.',
};

const ROLES: Array<{ label: string; value?: PlayerRole }> = [
  { label: 'ALL ROLES' },
  { label: 'ENTRY FRAGGER', value: 'ENTRY_FRAGGER' },
  { label: 'FRAGGER / SLAYER', value: 'FRAGGER_SLAYER' },
  { label: 'ANCHORS', value: 'ANCHOR' },
  { label: 'SCOUT / RECON', value: 'SCOUT_RECON' },
  { label: 'SUPPORT', value: 'SUPPORT' },
  { label: 'IGL', value: 'IGL' },
  { label: 'OVERWATCH', value: 'OVERWATCH' },
  { label: 'RUSHER', value: 'RUSHER' },
  { label: 'FLANKER', value: 'FLANKER' },
  { label: 'MEDIC / REVIVER', value: 'MEDIC_REVIVER' },
  { label: 'OBJECTIVE', value: 'OBJECTIVE_PLAYER' },
];

export default async function PlayersPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string; role?: string; verified?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = resolvedParams.query || '';
  const selectedRole = resolvedParams.role as PlayerRole | undefined;
  const verifiedOnly = resolvedParams.verified === 'true';

  const { players } = await getPublishedPlayers({
    query,
    role: selectedRole,
    verifiedOnly,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero / Header Section matching Scrims Hub */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#141414] border border-[#2A2A2A] rounded-[2px] p-6 sm:p-10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#FFE93B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-[#FFE93B]/10 border border-[#FFE93B]/30 text-xs font-bold text-[#FFE93B]">
              <User className="w-3.5 h-3.5" />
              <span>OFFICIAL COMPETITIVE PLAYER REGISTRY</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight leading-none">
              PLAYER <span className="text-[#FFE93B]">DIRECTORY</span>
            </h1>
            <p className="text-sm sm:text-base text-[#ADABAB] leading-relaxed">
              Official records of verified Indian Call of Duty: Mobile competitive competitors, rosters, roles, and statistics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link href="/join">
              <Button size="lg" variant="primary" className="w-full sm:w-auto shadow-lg shadow-[#FFE93B]/10">
                <User className="w-4 h-4 mr-2" />
                JOIN COMMUNITY
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar with Scrims Aesthetic */}
      <div className="bg-[#141414] border border-[#2A2A2A] p-4 sm:p-5 rounded-[2px] space-y-4">
        <form method="GET" action="/players" className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Search by IGN, real name, or state..."
              className="w-full bg-[#1C1C1C] text-white border border-[#2A2A2A] text-sm rounded-[2px] pl-11 pr-5 py-2.5 placeholder:text-[#ADABAB] focus:outline-none focus:border-[#FFE93B] transition-colors"
            />
            <Search className="w-4 h-4 text-[#ADABAB] absolute left-4 top-3.5" />
          </div>

          <div className="w-full sm:max-w-[200px]">
            <select
              name="role"
              defaultValue={selectedRole || ''}
              className="w-full bg-[#1C1C1C] text-white border border-[#2A2A2A] text-sm rounded-[2px] px-4 py-2.5 focus:outline-none focus:border-[#FFE93B] transition-colors appearance-none cursor-pointer"
            >
              {ROLES.map((r) => (
                <option key={r.label} value={r.value || ''}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button size="md" variant="primary" type="submit">
              SEARCH
            </Button>
            {(query || selectedRole) && (
              <Link href="/players">
                <Button size="md" variant="ghost" type="button">
                  RESET
                </Button>
              </Link>
            )}
          </div>
        </form>

      </div>

      {/* Player Grid */}
      <PlayerGrid players={players} />
    </div>
  );
}
