import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Calendar, MapPin, Crown, Shield, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { getTournamentBySlug } from '@/server/queries/tournaments';
import { formatInr, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface TournamentProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: TournamentProfilePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tournament = await getTournamentBySlug(resolvedParams.slug);

  if (!tournament) {
    return { title: 'Tournament Not Found' };
  }

  const title = `${tournament.name} - Indian CODM Tournament Profile`;
  const description =
    tournament.formatDescription ||
    `Official standings, results, and prize pool for ${tournament.name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/tournaments/${tournament.slug}`,
    },
  };
}

export default async function TournamentProfilePage({
  params,
}: TournamentProfilePageProps) {
  const resolvedParams = await params;
  const tournament = await getTournamentBySlug(resolvedParams.slug);

  if (!tournament) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Tournament Hero */}
      <div className="relative overflow-hidden bg-[#141414] border border-[#2A2A2A] rounded-[2px] p-6 sm:p-10">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFE93B]" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{tournament.tier.replace('_', ' ')}</Badge>
              <Badge variant="outline">{tournament.status}</Badge>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
              {tournament.name}
            </h1>

            <p className="text-sm text-[#ADABAB] font-medium">
              Organized by {tournament.organizer}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#ADABAB] pt-2 font-display uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#FFE93B]" />
                {formatDate(tournament.startDate)}
              </span>
              {tournament.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#FFE93B]" />
                  {tournament.location}
                </span>
              )}
              {tournament.prizePoolInr && (
                <span className="flex items-center gap-1.5 text-white font-bold">
                  <Trophy className="w-4 h-4 text-[#FFE93B]" />
                  {formatInr(tournament.prizePoolInr)} INR
                </span>
              )}
            </div>
          </div>

          {tournament.mvpPlayer && (
            <div className="p-4 bg-[#1F1F1F] border border-[#837D72] rounded-[2px] text-center min-w-[200px]">
              <Crown className="w-6 h-6 text-[#FFE93B] mx-auto mb-1" />
              <span className="text-[10px] text-[#837D72] font-display uppercase tracking-wider block">
                TOURNAMENT MVP
              </span>
              <Link
                href={`/players/${tournament.mvpPlayer.slug}`}
                className="font-display font-black text-lg text-white hover:text-[#FFE93B] transition-colors"
              >
                {tournament.mvpPlayer.ign}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Details & Standings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Format Description */}
          {tournament.formatDescription && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tournament Format & Overview</CardTitle>
              </CardHeader>
              <CardContent className="leading-relaxed whitespace-pre-line text-sm">
                {tournament.formatDescription}
              </CardContent>
            </Card>
          )}

          {/* Placements & Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="w-4 h-4 text-[#FFE93B]" /> Official Placements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tournament.teamAchievements && tournament.teamAchievements.length > 0 ? (
                <div className="space-y-3">
                  {tournament.teamAchievements.map((ta, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-[2px] bg-[#FFE93B] text-black font-display font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <Link
                            href={`/teams/${ta.team.slug}`}
                            className="font-display font-bold text-white hover:text-[#FFE93B] transition-colors"
                          >
                            {ta.team.name} [{ta.team.tag}]
                          </Link>
                          <p className="text-xs text-[#ADABAB] mt-0.5">{ta.placement}</p>
                        </div>
                      </div>
                      {ta.prizeWonInr && (
                        <span className="font-display font-bold text-[#FFE93B] text-sm">
                          {formatInr(ta.prizeWonInr)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#837D72] italic">
                  Tournament standings are currently being updated by tournament admins.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Event Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-[#ADABAB]">
              <p>
                All results recorded here are verified through official stage scorecards and tournament organizers.
              </p>
              <div className="pt-2 border-t border-[#2A2A2A] text-[11px] text-[#837D72]">
                Permanent Canonical URL: <br />
                <code className="text-[#FFE93B] font-mono text-[10px]">
                  /tournaments/{tournament.slug}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
