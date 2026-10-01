import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Shield, Trophy, Users, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getTeamBySlug } from '@/server/queries/teams';
import { formatInr } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface TeamProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: TeamProfilePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const team = await getTeamBySlug(resolvedParams.slug);

  if (!team) {
    return { title: 'Team Not Found' };
  }

  const title = `${team.name} [${team.tag}] - Indian MobileRoster Team Profile`;
  const description =
    team.bio || `Official roster, achievements, and statistics for Indian MobileRoster team ${team.name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/teams/${team.slug}`,
    },
  };
}

export default async function TeamProfilePage({
  params,
}: TeamProfilePageProps) {
  const resolvedParams = await params;
  const team = await getTeamBySlug(resolvedParams.slug);

  if (!team) {
    notFound();
  }

  const activeMembers = team.members?.filter((m) => m.isCurrent) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Team Hero */}
      <div className="relative overflow-hidden bg-[#141414] border border-[#2A2A2A] rounded-[2px] p-6 sm:p-10">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFE93B]" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2px] bg-[#1F1F1F] border-2 border-[#837D72] flex items-center justify-center flex-shrink-0">
            {team.logoUrl ? (
              <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain p-3" />
            ) : (
              <Shield className="w-12 h-12 text-[#FFE93B]" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                [{team.tag}]
              </Badge>
              {team.organization && (
                <span className="text-xs text-[#837D72] font-display uppercase tracking-wider">
                  Org: {team.organization.name}
                </span>
              )}
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
              {team.name}
            </h1>

            {team.bio && (
              <p className="text-sm text-[#ADABAB] max-w-2xl leading-relaxed">
                {team.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Roster & Achievements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Roster List (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4 text-[#FFE93B]" /> Active Starting Roster
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeMembers.map((member) => (
                  <Link
                    key={member.player.slug}
                    href={`/players/${member.player.slug}`}
                    className="p-4 bg-[#1F1F1F] border border-[#2A2A2A] hover:border-[#FFE93B] rounded-[2px] flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <h4 className="font-display font-bold text-white group-hover:text-[#FFE93B] transition-colors text-base">
                        {member.player.ign}
                      </h4>
                      <Badge variant="role" className="mt-1">
                        {member.player.primaryRole}
                      </Badge>
                    </div>
                    <span className="text-xs text-[#837D72] font-display uppercase tracking-wider">
                      {member.role.replace('_', ' ')}
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Achievements (1 col) */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="w-4 h-4 text-[#FFE93B]" /> Championships Won
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {team.achievements && team.achievements.length > 0 ? (
                team.achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="p-3.5 bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-display font-bold text-white text-sm">
                        {ach.placement}
                      </h4>
                      {ach.tournament && (
                        <p className="text-xs text-[#ADABAB] mt-0.5">
                          {ach.tournament.name}
                        </p>
                      )}
                    </div>
                    {ach.prizeWonInr && (
                      <span className="font-display font-bold text-[#FFE93B] text-xs">
                        {formatInr(ach.prizeWonInr)}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#837D72] italic">
                  No verified championships registered yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
