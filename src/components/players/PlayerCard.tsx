import * as React from 'react';
import Link from 'next/link';
import { User, Shield, Trophy, ChevronRight, CheckCircle2, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface PlayerCardProps {
  player: {
    id: string;
    slug: string;
    ign: string;
    displayName?: string | null;
    realName?: string | null;
    avatarUrl?: string | null;
    primaryRole: string;
    state?: string | null;
    verificationStatus: string;
    teamMemberships?: Array<{
      isCurrent: boolean;
      role?: string;
      team: {
        name: string;
        tag: string;
        slug: string;
      };
    }>;
    achievements?: Array<{
      id: string;
      placement?: string | null;
      achievement?: { title: string };
    }>;
  };
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const currentTeam = player.teamMemberships?.find((m) => m.isCurrent)?.team;
  const isVerified = player.verificationStatus === 'VERIFIED';

  return (
    <Card className="bg-[#141414] border-[#2A2A2A] hover:border-[#FFE93B]/40 transition-all duration-200 rounded-[2px] flex flex-col justify-between h-full group">
      <CardContent className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header Row: Role & Verification */}
          <div className="flex items-center justify-between gap-2">
            <Badge variant="role" className="text-[11px] font-bold tracking-wider">
              {player.primaryRole}
            </Badge>
            {isVerified && (
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-[2px]">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                VERIFIED
              </span>
            )}
          </div>

          {/* Player Identity Box */}
          <div className="flex items-start gap-3.5 py-1">
            <div className="w-14 h-14 rounded-[2px] bg-[#1C1C1C] border border-[#333333] group-hover:border-[#FFE93B]/60 flex items-center justify-center overflow-hidden flex-shrink-0">
              {player.avatarUrl ? (
                <img
                  src={player.avatarUrl}
                  alt={player.ign}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="/photos/logo1.png"
                  alt={player.ign}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-display font-black text-xl text-white tracking-wide truncate group-hover:text-[#FFE93B] transition-colors leading-snug">
                {player.ign}
              </h3>
              {(player.displayName || player.realName) && (
                <p className="text-xs text-[#ADABAB] truncate mt-0.5">
                  {player.displayName || player.realName}
                </p>
              )}
              {player.state && (
                <p className="text-[11px] text-[#8E8E93] mt-1 font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-neutral-500" />
                  {player.state}, IN
                </p>
              )}
            </div>
          </div>

          {/* Current Roster Affiliation */}
          <div className="pt-3 border-t border-[#222222] flex items-center justify-between text-xs">
            <span className="text-[#8E8E93] font-display uppercase tracking-wider text-[11px]">
              Affiliation
            </span>
            {currentTeam ? (
              <span className="font-display font-bold text-white bg-[#1C1C1C] px-2.5 py-0.5 rounded-[2px] border border-[#2A2A2A] truncate max-w-[180px]">
                <strong className="text-[#FFE93B] font-mono mr-1">[{currentTeam.tag}]</strong>
                {currentTeam.name}
              </span>
            ) : (
              <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded-[2px] text-[11px] font-medium">
                Free Agent
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#222222] flex items-center justify-between gap-3 mt-auto">
          {player.achievements && player.achievements.length > 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-[#ADABAB] min-w-0">
              <Trophy className="w-3.5 h-3.5 text-[#FFE93B] flex-shrink-0" />
              <span className="truncate text-[11px] text-white">
                {player.achievements[0].placement || player.achievements[0].achievement?.title}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-[#8E8E93] font-mono uppercase tracking-wider">
              PROFILE ACTIVE
            </span>
          )}

          <Link href={`/players/${player.slug}`}>
            <Button size="sm" variant="outline" className="text-xs group-hover:border-[#FFE93B]/60 group-hover:text-[#FFE93B]">
              VIEW PROFILE
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
