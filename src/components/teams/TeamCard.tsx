import * as React from 'react';
import Link from 'next/link';
import { Shield, Users, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

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
    <Link href={`/teams/${team.slug}`} className="block group">
      <Card
        variant="interactive"
        className="h-full flex flex-col justify-between border-[#2A2A2A] hover:border-[#FFE93B]"
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="w-14 h-14 rounded-[2px] bg-[#1F1F1F] border border-[#2A2A2A] group-hover:border-[#FFE93B]/60 flex items-center justify-center overflow-hidden flex-shrink-0">
              {team.logoUrl ? (
                <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain p-2" />
              ) : (
                <img src="/photos/codm-team.jpg" alt={team.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
              )}
            </div>
            <Badge variant="outline" className="font-mono text-[11px]">
              [{team.tag}]
            </Badge>
          </div>

          <h3 className="font-display font-black text-xl text-white tracking-wide group-hover:text-[#FFE93B] transition-colors">
            {team.name}
          </h3>
          {team.organization && (
            <p className="text-xs text-[#ADABAB] mt-0.5">
              {team.organization.name}
            </p>
          )}

          {/* Active Roster Avatars / Tags */}
          <div className="mt-5 pt-3 border-t border-[#2A2A2A]">
            <div className="flex items-center gap-1.5 text-xs text-[#837D72] mb-2 font-display uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Active Roster ({activeMembers.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeMembers.slice(0, 5).map((m, idx) => (
                <span
                  key={idx}
                  className="bg-[#1F1F1F] text-white text-[11px] font-display font-medium px-2 py-0.5 rounded-[2px] border border-[#2A2A2A]"
                >
                  {m.player.ign}
                </span>
              ))}
              {activeMembers.length > 5 && (
                <span className="text-[11px] text-[#ADABAB] self-center">
                  +{activeMembers.length - 5}
                </span>
              )}
            </div>
          </div>
        </div>

        {team.achievements && team.achievements.length > 0 && (
          <div className="px-5 py-2.5 bg-[#0F0F0F] border-t border-[#2A2A2A] flex items-center gap-1.5 text-xs text-[#ADABAB]">
            <Trophy className="w-3.5 h-3.5 text-[#FFE93B] flex-shrink-0" />
            <span className="truncate text-[11px]">
              {team.achievements[0].placement}
            </span>
          </div>
        )}
      </Card>
    </Link>
  );
};
