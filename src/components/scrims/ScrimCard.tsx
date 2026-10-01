import * as React from 'react';
import Link from 'next/link';
import { Swords, Clock, MapPin, Users, ChevronRight, ShieldAlert, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScrimLobby } from '@/server/data/scrims-data';

interface ScrimCardProps {
  scrim: ScrimLobby;
}

export const ScrimCard: React.FC<ScrimCardProps> = ({ scrim }) => {
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'S_TIER':
        return <Badge variant="gold">S-TIER PRO</Badge>;
      case 'A_TIER':
        return <Badge variant="primary">A-TIER</Badge>;
      case 'B_TIER':
        return <Badge variant="outline">B-TIER</Badge>;
      default:
        return <Badge variant="secondary">OPEN SCRIM</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="inline-flex items-center text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-[2px]"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>LOBBY OPEN</span>;
      case 'CHALLENGED':
        return <span className="inline-flex items-center text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-[2px]">CHALLENGE PENDING</span>;
      case 'CONFIRMED':
        return <span className="inline-flex items-center text-xs font-bold text-[#FFE93B] bg-[#FFE93B]/10 border border-[#FFE93B]/40 px-2 py-0.5 rounded-[2px]"><CheckCircle className="w-3 h-3 mr-1" />CONFIRMED</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded-[2px]">LIVE IN-GAME</span>;
      default:
        return <span className="inline-flex items-center text-xs font-bold text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-[2px]">CLOSED</span>;
    }
  };

  return (
    <Card className="bg-[#141414] border-[#2A2A2A] hover:border-[#FFE93B]/40 transition-all duration-200">
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Header row with tier & status */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {getTierBadge(scrim.tier)}
            <span className="text-xs font-bold text-[#ADABAB] uppercase tracking-wider bg-[#1F1F1F] px-2 py-0.5 rounded-[2px]">
              {scrim.matchFormat}
            </span>
          </div>
          <div>{getStatusBadge(scrim.status)}</div>
        </div>

        {/* Teams Matchup Display */}
        <div className="flex items-center justify-between gap-4 py-2 border-y border-[#222222]">
          {/* Host Team */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-[2px] bg-[#1C1C1C] border border-[#333333] flex items-center justify-center font-display font-black text-sm text-[#FFE93B] flex-shrink-0">
              {scrim.hostTeamTag}
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-base text-white truncate">
                {scrim.hostTeamName}
              </div>
              <span className="text-[10px] text-[#ADABAB] tracking-wider uppercase">HOST TEAM</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center flex-shrink-0 px-2">
            <span className="font-display font-black text-xs text-[#FFE93B] tracking-widest bg-black/60 px-2 py-1 rounded border border-[#333333]">
              VS
            </span>
          </div>

          {/* Opponent Team */}
          <div className="flex items-center justify-end gap-3 min-w-0 text-right">
            <div className="min-w-0">
              <div className="font-display font-bold text-base text-white truncate">
                {scrim.opponentTeamName || 'Awaiting Challenger'}
              </div>
              <span className="text-[10px] text-[#ADABAB] tracking-wider uppercase">
                {scrim.opponentTeamTag ? 'CONFIRMED OPPONENT' : 'OPEN SLOT'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-[2px] bg-[#1C1C1C] border border-[#333333] flex items-center justify-center font-display font-black text-sm text-neutral-400 flex-shrink-0">
              {scrim.opponentTeamTag || '?'}
            </div>
          </div>
        </div>

        {/* Modes & Schedule Meta */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs text-[#ADABAB] pt-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FFE93B]" />
              <span className="text-white font-medium">{scrim.scheduledTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span>{scrim.region}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {scrim.modes.map((mode) => (
              <span key={mode} className="text-[10px] bg-black/50 text-[#FFE93B] border border-[#333333] px-2 py-0.5 rounded-[2px] font-mono">
                {mode === 'Search & Destroy' ? 'S&D' : mode === 'Hardpoint' ? 'HP' : 'CTL'}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-[#ADABAB] truncate italic max-w-[65%]">
            {scrim.notes ? `"${scrim.notes}"` : 'Standard competitive CDL rules applied.'}
          </p>

          <Link href={`/scrims/${scrim.id}`}>
            <Button size="sm" variant={scrim.status === 'OPEN' ? 'primary' : 'outline'}>
              {scrim.status === 'OPEN' ? 'CHALLENGE / JOIN' : 'ENTER ROOM'}
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
