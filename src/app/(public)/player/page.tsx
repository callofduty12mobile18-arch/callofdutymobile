import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { User, Shield, Trophy, ExternalLink, LogOut, CheckCircle2, Sparkles, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getPlayerSession, logoutPlayerAction } from '@/server/actions/player-auth';
import { prisma } from '@/lib/db/prisma';
import { PlayerProfileEditorForm } from '@/components/players/PlayerProfileEditorForm';

import { getPlayerForStudio } from '@/server/queries/players';

export const metadata: Metadata = {
  title: 'Player Profile Studio | Manage Your Profile',
  description: 'Self-service competitive profile builder for verified Indian CODM competitors.',
};

export default async function PlayerDashboardPage() {
  const session = await getPlayerSession();

  // If not logged in, redirect to player login
  if (!session) {
    redirect('/player/login');
  }

  // Load current player record from live database (cached)
  const existingPlayer = session.slug ? await getPlayerForStudio(session.slug) : null;

  const currentTeam = existingPlayer?.teamMemberships?.[0]?.team;
  const youtubeLink = existingPlayer?.socialLinks?.find((s: { platform: string; url: string }) => s.platform === 'YOUTUBE')?.url || '';
  const instagramLink = existingPlayer?.socialLinks?.find((s: { platform: string; url: string }) => s.platform === 'INSTAGRAM')?.url || '';
  const twitterLink = existingPlayer?.socialLinks?.find((s: { platform: string; url: string }) => s.platform === 'TWITTER_X')?.url || '';

  const photoFeed = existingPlayer?.media?.filter((m: { mediaType: string }) => m.mediaType === 'IMAGE').map((m: { publicUrl: string }) => m.publicUrl) || [];
  const videoFeed = existingPlayer?.media?.filter((m: { mediaType: string }) => m.mediaType === 'VIDEO_CLIP').map((m: { publicUrl: string }) => m.publicUrl) || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-[2px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[2px] bg-[#1F1F1F] border border-[#FFE93B] overflow-hidden flex items-center justify-center text-[#FFE93B] font-display font-black text-2xl flex-shrink-0">
            {existingPlayer?.avatarUrl ? (
              <img src={existingPlayer.avatarUrl} alt={session.ign} className="w-full h-full object-cover" />
            ) : (
              <img src="/photos/logo1.png" alt={session.ign} className="w-full h-full object-contain p-1" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                {session.ign}
              </h1>
            </div>
            <p className="text-xs text-[#ADABAB] mt-0.5">
              Account: <strong className="text-white">{session.email}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {session.slug && (
            <Link href={`/players/${session.slug}`} target="_blank">
              <Button size="sm" variant="outline">
                <ExternalLink className="w-4 h-4 mr-1.5" />
                VIEW PUBLIC PROFILE
              </Button>
            </Link>
          )}
          <form action={logoutPlayerAction}>
            <Button size="sm" variant="ghost" type="submit">
              <LogOut className="w-4 h-4 mr-1.5" />
              SIGN OUT
            </Button>
          </form>
        </div>
      </div>

      {/* Editor Form */}
      <PlayerProfileEditorForm
        initialData={{
          ign: existingPlayer?.ign || session.ign,
          displayName: existingPlayer?.displayName || '',
          realName: existingPlayer?.realName || '',
          primaryRole: existingPlayer?.primaryRole || 'SLAYER',
          state: existingPlayer?.state || '',
          codmUid: existingPlayer?.city || '',
          joinedYear: existingPlayer?.competitiveHistory || '',
          avatarUrl: existingPlayer?.avatarUrl || '',
          coverImageUrl: existingPlayer?.coverImageUrl || '',
          teamName: currentTeam?.name || '',
          teamTag: currentTeam?.tag || '',
          bio: existingPlayer?.bio || '',
          competitiveHistory: existingPlayer?.competitiveHistory || '',
          photoFeed,
          videoFeed,
          youtubeUrl: youtubeLink,
          instagramUrl: instagramLink,
          twitterUrl: twitterLink,
          seoKeywords: existingPlayer?.seoTitle || '',
          seoDescription: existingPlayer?.seoDescription || '',
          slug: existingPlayer?.slug || session.slug,
        }}
      />
    </div>
  );
}
