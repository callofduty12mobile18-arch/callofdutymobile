import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, Filter, ShieldCheck, User } from 'lucide-react';
import { PlayerGrid } from '@/components/players/PlayerGrid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getPublishedPlayers } from '@/server/queries/players';
import { PlayerRole } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Indian CODM Players Directory',
  description:
    'Browse verified Indian Call of Duty: Mobile competitive players, in-game leaders, slayers, anchors, and snipers.',
};

const ROLES: Array<{ label: string; value?: PlayerRole }> = [
  { label: 'ALL ROLES' },
  { label: 'SLAYERS', value: 'SLAYER' },
  { label: 'ANCHORS', value: 'ANCHOR' },
  { label: 'OBJECTIVE', value: 'OBJ' },
  { label: 'IGL', value: 'IGL' },
  { label: 'SNIPERS', value: 'SNIPER' },
  { label: 'SUPPORT', value: 'SUPPORT' },
];

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; role?: string; verified?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.query || '';
  const selectedRole = resolvedParams.role as PlayerRole | undefined;
  const verifiedOnly = resolvedParams.verified === 'true';

  const { players, total } = await getPublishedPlayers({
    query,
    role: selectedRole,
    verifiedOnly,
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)] pb-24">
      {/* Players Page Background Wallpaper - Contained with bottom dark fade */}
      <div
        className="absolute inset-0 bg-cover bg-top opacity-70 pointer-events-none scale-100 transition-opacity"
        style={{
          backgroundImage: `url('/photos/video-game-call-of-duty-mobile-hd-wallpaper-preview.jpg')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="border-b border-[#2A2A2A] pb-8 relative overflow-hidden bg-[#141414]/80 backdrop-blur-md p-6 sm:p-8 rounded-[2px] border border-[#837D72]/40 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#FFE93B]" />
          <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase mb-2">
            <User className="w-4 h-4" />
            <span>ROSTER DATABASE</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
                PLAYER DIRECTORY
              </h1>
              <p className="text-[#ADABAB] text-sm mt-2 max-w-xl">
                Official records of verified Indian Call of Duty: Mobile competitive competitors, rosters, and roles.
              </p>
            </div>
            <div className="text-right">
              <span className="font-display font-black text-2xl sm:text-3xl text-[#FFE93B] block">
                {total}
              </span>
              <span className="text-[11px] text-[#837D72] font-display uppercase tracking-wider">
                REGISTERED PROFILES
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#141414]/80 backdrop-blur-md border border-[#837D72]/40 p-4 rounded-[2px] space-y-4 shadow-xl">
          <form method="GET" action="/players" className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                name="query"
                defaultValue={query}
                placeholder="Search by IGN, real name, or state..."
                className="w-full bg-[#1F1F1F]/90 text-white border border-[#837D72] text-sm rounded-[50px] pl-11 pr-5 py-2.5 placeholder:text-[#ADABAB] focus:outline-none focus:border-[#FFE93B]"
              />
              <Search className="w-4 h-4 text-[#ADABAB] absolute left-4 top-3.5" />
            </div>

          <div className="flex items-center gap-2">
            {selectedRole && <input type="hidden" name="role" value={selectedRole} />}
            <Button size="md" variant="primary" type="submit">
              SEARCH
            </Button>
            <Link href="/players">
              <Button size="md" variant="ghost" type="button">
                RESET
              </Button>
            </Link>
          </div>
        </form>

        {/* Role Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2A2A2A]/50">
          <span className="text-xs text-[#837D72] font-display uppercase tracking-wider mr-2">
            Role:
          </span>
          {ROLES.map((r) => {
            const isSelected = (!r.value && !selectedRole) || r.value === selectedRole;
            const href = r.value
              ? `/players?role=${r.value}${query ? `&query=${encodeURIComponent(query)}` : ''}`
              : `/players${query ? `?query=${encodeURIComponent(query)}` : ''}`;

            return (
              <Link key={r.label} href={href}>
                <span
                  className={`font-display text-xs uppercase px-3 py-1 rounded-[3px] font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFE93B] text-black'
                      : 'bg-[#1F1F1F] text-[#ADABAB] hover:text-white border border-[#2A2A2A]'
                  }`}
                >
                  {r.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Player Grid */}
      <PlayerGrid players={players} />
      </div>
    </div>
  );
}
