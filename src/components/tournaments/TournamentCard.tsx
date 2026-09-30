import * as React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Trophy, Crown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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
  const isS_Tier = tournament.tier === 'S_TIER';

  return (
    <Link href={`/tournaments/${tournament.slug}`} className="block group">
      <Card
        variant="interactive"
        className="h-full flex flex-col justify-between border-[#2A2A2A] hover:border-[#FFE93B]"
      >
        <div className="p-5">
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <Badge variant={isS_Tier ? 'primary' : 'tier'}>
              {tournament.tier.replace('_', ' ')}
            </Badge>
            <Badge
              variant={
                tournament.status === 'ONGOING'
                  ? 'warning'
                  : tournament.status === 'COMPLETED'
                  ? 'secondary'
                  : 'outline'
              }
            >
              {tournament.status}
            </Badge>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-[2px] overflow-hidden border border-[#2A2A2A] group-hover:border-[#FFE93B]/60 flex-shrink-0 bg-black">
              <img src="/photos/codm-championship.jpg" alt={tournament.name} className="w-full h-full object-cover opacity-85 group-hover:opacity-100" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-black text-lg text-white tracking-wide group-hover:text-[#FFE93B] transition-colors leading-snug truncate">
                {tournament.name}
              </h3>
              <p className="text-xs text-[#ADABAB] mt-0.5 font-medium truncate">
                Organizer: {tournament.organizer}
              </p>
            </div>
          </div>

          {/* Key Metrics: Prize & Location */}
          <div className="mt-4 pt-4 border-t border-[#2A2A2A] space-y-2 text-xs">
            {tournament.prizePoolInr && (
              <div className="flex items-center justify-between">
                <span className="text-[#837D72] font-display uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-[#FFE93B]" /> Prize Pool
                </span>
                <span className="font-display font-bold text-white text-sm">
                  {formatInr(tournament.prizePoolInr)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-[#ADABAB]">
              <span className="text-[#837D72] font-display uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Date
              </span>
              <span>{formatDate(tournament.startDate)}</span>
            </div>

            {tournament.location && (
              <div className="flex items-center justify-between text-[#ADABAB]">
                <span className="text-[#837D72] font-display uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Venue
                </span>
                <span className="truncate max-w-[150px]">{tournament.location}</span>
              </div>
            )}
          </div>
        </div>

        {tournament.mvpPlayer && (
          <div className="px-5 py-2.5 bg-[#0F0F0F] border-t border-[#2A2A2A] flex items-center gap-1.5 text-xs text-[#ADABAB]">
            <Crown className="w-3.5 h-3.5 text-[#FFE93B] flex-shrink-0" />
            <span className="text-[11px]">
              Finals MVP:{' '}
              <strong className="text-white font-display uppercase">{tournament.mvpPlayer.ign}</strong>
            </span>
          </div>
        )}
      </Card>
    </Link>
  );
};
