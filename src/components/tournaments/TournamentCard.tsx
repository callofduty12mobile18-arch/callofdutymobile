import * as React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Trophy, Crown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatInr, formatDate } from '@/lib/utils';

interface TournamentCardProps {
  tournament: {
    id: string;
    slug: string;
    name: string;
    organizer: string;
    tier: string;
    status: string;
    startDate: Date | string;
    endDate?: Date | string | null;
    prizePoolInr?: number | string | { toString(): string } | null;
    location?: string | null;
    mvpPlayer?: { ign: string; slug: string } | null;
  };
}

export const TournamentCard: React.FC<TournamentCardProps> = ({ tournament }) => {
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'S_TIER':
        return <Badge variant="gold">S-TIER PRO</Badge>;
      case 'A_TIER':
        return <Badge variant="primary">A-TIER</Badge>;
      case 'B_TIER':
        return <Badge variant="outline">B-TIER</Badge>;
      default:
        return <Badge variant="secondary">{tier.replace('_', ' ')}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ONGOING':
        return (
          <span className="inline-flex items-center text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-[2px]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 animate-pulse" />
            LIVE ONGOING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-[2px]">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            CONCLUDED
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="inline-flex items-center text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-[2px]">
            UPCOMING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-xs font-bold text-[#ADABAB] bg-[#1C1C1C] border border-[#2A2A2A] px-2 py-0.5 rounded-[2px]">
            {status}
          </span>
        );
    }
  };

  return (
    <Card className="bg-[#141414] border-[#2A2A2A] hover:border-[#FFE93B]/40 transition-all duration-200 flex flex-col justify-between h-full group">
      <CardContent className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header Row: Tier & Status */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {getTierBadge(tournament.tier)}
            </div>
            <div>{getStatusBadge(tournament.status)}</div>
          </div>

          {/* Tournament Identity Box */}
          <div className="flex items-start gap-3.5 py-1">
            <div className="w-12 h-12 rounded-[2px] overflow-hidden border border-[#2A2A2A] group-hover:border-[#FFE93B]/60 flex-shrink-0 bg-black">
              <img
                src="/photos/codm-championship.jpg"
                alt={tournament.name}
                className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-black text-lg text-white tracking-wide group-hover:text-[#FFE93B] transition-colors leading-snug line-clamp-2">
                {tournament.name}
              </h3>
              <p className="text-xs text-[#ADABAB] mt-1 font-medium truncate">
                Organizer: <span className="text-white">{tournament.organizer}</span>
              </p>
            </div>
          </div>

          {/* Key Metrics: Prize & Schedule */}
          <div className="pt-3 border-t border-[#222222] space-y-2 text-xs">
            {tournament.prizePoolInr && (
              <div className="flex items-center justify-between">
                <span className="text-[#8E8E93] font-display uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-[#FFE93B]" /> Prize Pool
                </span>
                <span className="font-display font-bold text-[#FFE93B] text-sm">
                  {formatInr(tournament.prizePoolInr)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-[#ADABAB]">
              <span className="text-[#8E8E93] font-display uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" /> Date
              </span>
              <span className="text-white font-medium">{formatDate(tournament.startDate)}</span>
            </div>

            {tournament.location && (
              <div className="flex items-center justify-between text-[#ADABAB]">
                <span className="text-[#8E8E93] font-display uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" /> Venue
                </span>
                <span className="truncate max-w-[170px] text-white">{tournament.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="pt-3 border-t border-[#222222] flex items-center justify-between gap-3 mt-auto">
          {tournament.mvpPlayer ? (
            <div className="flex items-center gap-1.5 text-xs text-[#ADABAB] min-w-0">
              <Crown className="w-3.5 h-3.5 text-[#FFE93B] flex-shrink-0" />
              <span className="text-[11px] truncate">
                MVP: <strong className="text-white font-display uppercase">{tournament.mvpPlayer.ign}</strong>
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-[#8E8E93] font-mono uppercase tracking-wider">
              OFFICIAL EVENT
            </span>
          )}

          <Link href={`/tournaments/${tournament.slug}`}>
            <Button size="sm" variant="outline" className="text-xs group-hover:border-[#FFE93B]/60 group-hover:text-[#FFE93B]">
              VIEW BRACKET
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
