import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Crosshair, MapPin, ArrowRight } from 'lucide-react';
import { PlayerRole } from '@prisma/client';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { getLookingForTeamPlayers } from '@/server/queries/players';

export const metadata: Metadata = {
  title: 'Looking For Team (LFT) & Free Agent Scout Board | CODM India',
  description: 'Scout verified Indian Call of Duty: Mobile free agents, slayers, snipers, anchors, and IGLs looking for active rosters.',
};

const ROLES_LIST = [
  { label: 'ALL ROLES', value: 'ALL' },
  { label: 'SLAYER', value: 'SLAYER' },
  { label: 'SNIPER', value: 'SNIPER' },
  { label: 'IGL (Captain)', value: 'IGL' },
  { label: 'ANCHOR', value: 'ANCHOR' },
  { label: 'OBJ', value: 'OBJ' },
  { label: 'SUPPORT', value: 'SUPPORT' },
  { label: 'FLEX', value: 'FLEX' },
];

export default async function LookingForTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const resolvedParams = await searchParams;
  const roleFilter = resolvedParams.role && resolvedParams.role !== 'ALL'
    ? (resolvedParams.role as PlayerRole)
    : undefined;

  const players = await getLookingForTeamPlayers(roleFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#141414] border border-[#2A2A2A] rounded-[2px] p-6 sm:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-emerald-950/60 border border-emerald-800/60 text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LIVE FREE AGENT ROSTER DIRECTORY</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight leading-none">
              LOOKING FOR <span className="text-[#FFE93B]">TEAM</span> (LFT)
            </h1>
            <p className="text-sm sm:text-base text-[#ADABAB] leading-relaxed">
              Find and recruit standout competitive talent across India. Filter by in-game role, state, and verified tournament history.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link href="/player">
              <Button size="lg" variant="primary">
                <Crosshair className="w-4 h-4 mr-2" />
                TOGGLE LFT ON MY PROFILE
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#2A2A2A] pb-4">
        {ROLES_LIST.map((r) => {
          const isSelected = (resolvedParams.role || 'ALL') === r.value;
          return (
            <Link
              key={r.value}
              href={r.value === 'ALL' ? '/lft' : `/lft?role=${r.value}`}
              className={`font-display text-xs font-bold px-3.5 py-1.5 rounded-[2px] border transition-all ${
                isSelected
                  ? 'bg-[#FFE93B] text-black border-[#FFE93B]'
                  : 'bg-[#141414] text-[#ADABAB] border-[#2A2A2A] hover:text-white hover:border-[#3A3A3A]'
              }`}
            >
              {r.label}
            </Link>
          );
        })}
      </div>

      {/* Player Cards Grid */}
      {players.length === 0 ? (
        <div className="bg-[#141414] border border-[#2A2A2A] p-12 text-center rounded-[2px] space-y-4">
          <Crosshair className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="font-display font-bold text-lg text-white">No Free Agents Currently Listed</h3>
          <p className="text-xs text-[#ADABAB] max-w-sm mx-auto">
            No players are currently flagged as looking for team in this role. Are you an active player searching for a squad?
          </p>
          <Link href="/player">
            <Button size="sm" variant="primary">
              LIST MYSELF ON LFT BOARD
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => {
            const currentTeam = player.teamMemberships?.[0]?.team;
            return (
              <Card
                key={player.id}
                className="bg-[#141414] border-[#2A2A2A] hover:border-[#FFE93B]/60 transition-all duration-200 group flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-5">
                  {/* Top Row: Avatar + IGN + Verified */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-[2px] bg-[#1C1C1C] border border-[#333333] flex items-center justify-center font-display font-black text-xl text-[#FFE93B] overflow-hidden flex-shrink-0">
                      {player.avatarUrl ? (
                        <img src={player.avatarUrl} alt={player.ign} className="w-full h-full object-cover" />
                      ) : (
                        player.ign.substring(0, 2).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-display font-black text-lg text-white group-hover:text-[#FFE93B] transition-colors truncate">
                          {player.ign}
                        </h3>
                        {player.verificationStatus === 'VERIFIED' && (
                          <VerifiedBadge size="sm" />
                        )}
                      </div>

                      {player.displayName && (
                        <p className="text-xs text-[#ADABAB] truncate">&ldquo;{player.displayName}&rdquo;</p>
                      )}

                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="primary" className="text-[10px] px-2 py-0.5">
                          {player.primaryRole}
                        </Badge>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-[2px] font-bold">
                          AVAILABLE
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio & Details */}
                  <p className="text-xs text-[#ADABAB] line-clamp-2 leading-relaxed italic">
                    {player.bio || player.competitiveHistory || 'Active competitive player seeking high-tier tournament squad.'}
                  </p>

                  {/* Location & Team History */}
                  <div className="space-y-1.5 text-xs text-[#ADABAB] pt-2 border-t border-[#222222]">
                    {player.state && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{player.state}, India</span>
                      </div>
                    )}
                    {currentTeam ? (
                      <div className="flex items-center gap-1.5 text-neutral-400">
                        <span>Current Org:</span>
                        <strong className="text-white">{currentTeam.name} [{currentTeam.tag}]</strong>
                      </div>
                    ) : (
                      <div className="text-emerald-400 text-[11px] font-bold">
                        Uncontracted / Free Agent
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <Link href={`/players/${player.slug}`}>
                      <Button size="sm" variant="outline" className="w-full group-hover:border-[#FFE93B] group-hover:text-[#FFE93B]">
                        VIEW FULL DOSSIER
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
