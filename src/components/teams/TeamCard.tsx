import * as React from 'react';
import Link from 'next/link';
import { Shield, Users, Trophy, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface TeamCardProps {
  team: {
    id: string;
    slug: string;
    name: string;
    tag: string;
    logoUrl?: string | null;
    bio?: string | null;
    organization?: { name: string } | null;
    members?: Array<{
      role: string;
      isCurrent: boolean;
      player: {
        ign: string;
        slug: string;
        primaryRole: string;
      };
    }>;
    achievements?: Array<{
      id: string;
      placement: string;
    }>;
  };
}

export const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  const activeMembers = team.members?.filter((m) => m.isCurrent) || [];

  return (
    <Card className="bg-[#141414] border-[#2A2A2A] hover:border-[#FFE93B]/40 transition-all duration-200 rounded-[2px] flex flex-col justify-between h-full group">
      <CardContent className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header Row: Clan Tag & Status */}
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-xs font-bold text-[#FFE93B] bg-[#1C1C1C] border border-[#333333] px-2.5 py-0.5 rounded-[2px]">
              [{team.tag}]
            </span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-[2px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              ACTIVE ROSTER
            </span>
          </div>

          {/* Team Identity Display */}
          <div className="flex items-center gap-3.5 py-1">
            <div className="w-12 h-12 rounded-[2px] bg-[#1C1C1C] border border-[#333333] group-hover:border-[#FFE93B]/60 flex items-center justify-center overflow-hidden flex-shrink-0">
              {team.logoUrl ? (
                <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain p-1.5" />
              ) : (
                <img src="/photos/codm-team.jpg" alt={team.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-display font-black text-xl text-white tracking-wide group-hover:text-[#FFE93B] transition-colors leading-snug truncate">
                {team.name}
              </h3>
              <p className="text-xs text-[#ADABAB] mt-0.5 truncate">
                {team.organization ? team.organization.name : 'Independent Esports Organization'}
              </p>
            </div>
          </div>

          {/* Active Starting Roster Pills */}
          <div className="pt-3 border-t border-[#222222] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#8E8E93]">
              <span className="font-display uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-neutral-400" /> Starting Roster
              </span>
              <span className="font-mono text-[11px] text-[#FFE93B]">{activeMembers.length} Players</span>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {activeMembers.length > 0 ? (
                <>
                  {activeMembers.slice(0, 4).map((m, idx) => (
                    <span
                      key={idx}
                      className="bg-[#1C1C1C] text-white text-[11px] font-display font-medium px-2 py-0.5 rounded-[2px] border border-[#2A2A2A]"
                    >
                      {m.player.ign}
                    </span>
                  ))}
                  {activeMembers.length > 4 && (
                    <span className="text-[11px] text-[#ADABAB] self-center font-mono">
                      +{activeMembers.length - 4} more
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs text-[#666666] italic">Roster details pending verification</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Row: Achievements or Action */}
        <div className="pt-3 border-t border-[#222222] flex items-center justify-between gap-3 mt-auto">
          {team.achievements && team.achievements.length > 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-[#ADABAB] min-w-0">
              <Trophy className="w-3.5 h-3.5 text-[#FFE93B] flex-shrink-0" />
              <span className="truncate text-[11px] text-white font-medium">
                {team.achievements[0].placement}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-[#8E8E93] font-mono uppercase tracking-wider">
              VERIFIED SQUAD
            </span>
          )}

          <Link href={`/teams/${team.slug}`}>
            <Button size="sm" variant="outline" className="text-xs group-hover:border-[#FFE93B]/60 group-hover:text-[#FFE93B]">
              VIEW ROSTER
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
