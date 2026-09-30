import * as React from 'react';
import Link from 'next/link';
import { User, Shield, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

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
    <Link href={`/players/${player.slug}`} className="block group">
      <Card
        variant="interactive"
        className="h-full flex flex-col justify-between border-[#2A2A2A] hover:border-[#FFE93B] group-hover:shadow-[0_4px_20px_rgba(255,233,59,0.08)]"
      >
        <div className="p-5">
          {/* Header Bar: Role */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <Badge variant="role">{player.primaryRole}</Badge>
          </div>

          {/* Player Identity */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-[2px] bg-[#1F1F1F] border border-[#2A2A2A] group-hover:border-[#FFE93B]/60 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                  className="w-full h-full object-contain p-1 group-hover:scale-105 transition-all"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-display font-black text-xl text-white tracking-wide truncate group-hover:text-[#FFE93B] transition-colors">
                {player.ign}
              </h3>
              {(player.displayName || player.realName) && (
                <p className="text-xs text-[#ADABAB] truncate">
                  {player.displayName || player.realName}
                </p>
              )}
              {player.state && (
                <p className="text-[11px] text-[#837D72] mt-0.5 font-medium">
                  {player.state}, IN
                </p>
              )}
            </div>
          </div>

          {/* Current Roster */}
          <div className="mt-4 pt-3 border-t border-[#2A2A2A]/70 flex items-center justify-between text-xs">
            <span className="text-[#837D72] font-display uppercase tracking-wider text-[11px]">
              Team
            </span>
            {currentTeam ? (
              <span className="font-display font-bold text-white bg-[#1F1F1F] px-2 py-0.5 rounded-[2px] border border-[#2A2A2A]">
                [{currentTeam.tag}] {currentTeam.name}
              </span>
            ) : (
              <span className="text-[#ADABAB] italic">Free Agent</span>
            )}
          </div>
        </div>

        {/* Footer: Quick Achievement Tag */}
        {player.achievements && player.achievements.length > 0 && (
          <div className="px-5 py-2.5 bg-[#0F0F0F] border-t border-[#2A2A2A] flex items-center gap-1.5 text-xs text-[#ADABAB]">
            <Trophy className="w-3.5 h-3.5 text-[#FFE93B] flex-shrink-0" />
            <span className="truncate text-[11px] text-[#ADABAB]">
              {player.achievements[0].placement || player.achievements[0].achievement?.title}
            </span>
          </div>
        )}
      </Card>
    </Link>
  );
};
