import { jsonForScript } from '@/lib/security';
import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Shield,
  Trophy,
  MapPin,
  Calendar,
  Hash,
  Share2,
  ExternalLink,
  Globe,
  Film,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { getPlayerBySlug } from '@/server/queries/players';
import { PlayerMediaGallery } from '@/components/players/PlayerMediaGallery';

const YoutubeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const TwitterIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);


export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PlayerProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PlayerProfilePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const player = await getPlayerBySlug(resolvedParams.slug);

  if (!player) {
    return {
      title: 'Player Not Found',
    };
  }

  const parsedKeywords = player.seoTitle
    ? player.seoTitle.split(',').map((k: string) => k.trim()).filter(Boolean)
    : [];

  const title = `${player.ign}${player.displayName ? ` (${player.displayName})` : ''} — Indian MobileRoster Mobile Player`;
  const description =
    player.seoDescription ||
    player.bio ||
    `Official MobileRoster Mobile competitive profile, championships, and team history for Indian MobileRoster competitor ${player.ign}.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://MobileRoster.in';

  return {
    title,
    description,
    keywords: [
      player.ign,
      player.displayName || '',
      'MobileRoster Mobile',
      'MOBILEROSTER',
      'Indian MobileRoster Player',
      player.primaryRole,
      ...parsedKeywords,
    ].filter(Boolean),
    alternates: {
      canonical: `${siteUrl}/players/${player.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `/players/${player.slug}`,
      images: player.avatarUrl ? [{ url: player.avatarUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: player.avatarUrl ? [player.avatarUrl] : undefined,
    },
  };
}

export default async function PlayerProfilePage({
  params,
}: PlayerProfilePageProps) {
  const resolvedParams = await params;
  const player = await getPlayerBySlug(resolvedParams.slug);

  if (!player) {
    notFound();
  }

  const currentTeam = player.teamMemberships?.find((m) => m.isCurrent)?.team;
  const isVerified = player.verificationStatus === 'VERIFIED';

  const parsedKeywords = player.seoTitle
    ? player.seoTitle.split(',').map((k: string) => k.trim()).filter(Boolean)
    : [];

  const alternateNames = Array.from(
    new Set([
      player.ign,
      ...(player.displayName ? [player.displayName] : []),
      ...(player.realName ? [player.realName] : []),
      ...parsedKeywords,
    ])
  );

  const sameAsLinks = player.socialLinks?.map((s) => s.url) || [];

  // JSON-LD Structured Data for Google Knowledge Graph & Search
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: player.displayName || player.ign,
    alternateName: alternateNames,
    jobTitle: `MobileRoster Mobile Competitive Player (${player.primaryRole})`,
    nationality: 'Indian',
    description: player.seoDescription || player.bio || `Official MobileRoster Mobile player profile for ${player.ign}.`,
    image: player.avatarUrl || undefined,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://MobileRoster.in'}/players/${player.slug}`,
    sameAs: sameAsLinks.length > 0 ? sameAsLinks : undefined,
    ...(currentTeam && {
      memberOf: {
        '@type': 'SportsTeam',
        name: currentTeam.name,
      },
    }),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonForScript(jsonLd) }}
      />

      {/* 1. HERO / PROFILE HEADER WITH COVER BANNER */}
      <div className="relative overflow-hidden bg-[#141414] border border-[#2A2A2A] rounded-[2px]">
        {/* Full Cover Banner Header */}
        <div className="relative w-full h-48 sm:h-64 md:h-72 bg-[#1F1F1F] overflow-hidden">
          <img
            src={player.coverImageUrl || '/photos/hero-bg.jpg'}
            alt={`${player.ign} Cover Banner`}
            className="w-full h-full object-cover"
          />
          {/* Subtle bottom fade to transition into the profile card body */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/20 to-black/30" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFE93B]" />
        </div>

        {/* Profile Info Row (Overlaps bottom of banner) */}
        <div className="relative z-10 px-6 sm:px-10 pb-6 sm:pb-8 pt-0 -mt-16 sm:-mt-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Avatar Frame */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-[2px] bg-[#141414] border-4 border-[#141414] ring-2 ring-[#FFE93B] shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden flex-shrink-0">
              {player.avatarUrl ? (
                <img src={player.avatarUrl} alt={player.ign} className="w-full h-full object-cover" />
              ) : (
                <img src="/photos/logo1.png" alt={player.ign} className="w-full h-full object-contain p-2" />
              )}
            </div>

            {/* Core Info */}
            <div className="space-y-2 pt-2 sm:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="role">{player.primaryRole}</Badge>
                {player.secondaryRole && (
                  <Badge variant="outline">SEC: {player.secondaryRole}</Badge>
                )}
              </div>

              <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
                {player.ign}
              </h1>

              {(player.displayName || player.realName) && (
                <p className="text-sm sm:text-base text-[#ADABAB] font-medium">
                  {player.displayName || player.realName}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#837D72] pt-1 font-display uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FFE93B]" />
                  {player.state ? `${player.state}, ` : ''}INDIA
                </span>
                {player.city && (
                  <span className="flex items-center gap-1 font-mono text-[#ADABAB]">
                    <Hash className="w-3.5 h-3.5 text-[#FFE93B]" />
                    UID: {player.city}
                  </span>
                )}
                {player.competitiveHistory && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#FFE93B]" />
                    JOINED: {player.competitiveHistory}
                  </span>
                )}
                {currentTeam && (
                  <span className="flex items-center gap-1 text-white">
                    <Shield className="w-3.5 h-3.5 text-[#FFE93B]" />
                    [{currentTeam.tag}] {currentTeam.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Social Links Bar */}
          {player.socialLinks && player.socialLinks.length > 0 && (
            <div className="flex items-center gap-2 self-start md:self-end pb-1">
              {player.socialLinks.map((s, idx) => (
                <a
                  key={idx}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-[#1F1F1F] border border-[#2A2A2A] hover:border-[#FFE93B] text-[#ADABAB] hover:text-[#FFE93B] rounded-[2px] transition-colors"
                  aria-label={s.platform}
                >
                  {s.platform === 'YOUTUBE' && <YoutubeIcon className="w-4 h-4 text-[#FF0000]" />}
                  {s.platform === 'INSTAGRAM' && <InstagramIcon className="w-4 h-4 text-[#E1306C]" />}
                  {s.platform === 'TWITTER_X' && <TwitterIcon className="w-4 h-4 text-[#1DA1F2]" />}
                  {s.platform !== 'YOUTUBE' && s.platform !== 'INSTAGRAM' && s.platform !== 'TWITTER_X' && <ExternalLink className="w-4 h-4" />}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2-COLUMN PROFILE CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: About & Achievements (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          {player.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-4 h-4 text-[#FFE93B]" /> Competitive Bio
                </CardTitle>
              </CardHeader>
              <CardContent className="leading-relaxed whitespace-pre-line text-sm">
                {player.bio}
              </CardContent>
            </Card>
          )}

          {/* Major Achievements Showcase */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="w-4 h-4 text-[#FFE93B]" /> Championships & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {player.achievements && player.achievements.length > 0 ? (
                <div className="space-y-3">
                  {player.achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className="p-4 bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[2px] bg-[#FFE93B]/10 border border-[#FFE93B]/30 flex items-center justify-center flex-shrink-0">
                          <Trophy className="w-5 h-5 text-[#FFE93B]" />
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-white text-sm">
                            {ach.placement || ach.achievement?.title}
                          </h4>
                          {ach.tournament && (
                            <p className="text-xs text-[#ADABAB] mt-0.5">
                              {ach.tournament.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="primary" className="text-[10px]">
                        {ach.achievement?.category || 'AWARD'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#837D72] italic">
                  No verified tournament achievements recorded yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* 3. Landscape Highlights & Media Feed (Videos & Photos) */}
          {((player.media && player.media.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-[#FFE93B]" /> Gameplay Highlights & Media Feed
                  </span>
                  <span className="text-xs font-mono text-[#837D72] font-normal">
                    Landscape View
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PlayerMediaGallery
                  media={player.media}
                  playerIgn={player.ign}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Roster & Quick Details (1 col) */}
        <div className="space-y-8">
          {/* Current Team Box */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="w-4 h-4 text-[#FFE93B]" /> Current Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentTeam ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[2px] bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center">
                      <Shield className="w-6 h-6 text-[#FFE93B]" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-white">
                        {currentTeam.name}
                      </h4>
                      <span className="font-mono text-xs text-[#ADABAB]">
                        [{currentTeam.tag}]
                      </span>
                    </div>
                  </div>
                  <Link href={`/teams/${currentTeam.slug}`}>
                    <Button size="sm" variant="outline" className="w-full">
                      VIEW TEAM ROSTER
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-[#ADABAB]">Currently an active Free Agent</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Media Channels Box */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Share2 className="w-4 h-4 text-[#FFE93B]" /> Social Media Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              {player.socialLinks && player.socialLinks.length > 0 ? (
                <div className="space-y-2.5">
                  {player.socialLinks.map((s, idx) => {
                    const isYoutube = s.platform === 'YOUTUBE';
                    const isInstagram = s.platform === 'INSTAGRAM';
                    const isTwitter = s.platform === 'TWITTER_X';

                    const platformLabel = isYoutube
                      ? 'YouTube'
                      : isInstagram
                      ? 'Instagram'
                      : isTwitter
                      ? 'Twitter / X'
                      : s.platform;

                    const platformColor = isYoutube
                      ? 'hover:border-[#FF0000]/60 hover:shadow-[0_0_15px_rgba(255,0,0,0.2)]'
                      : isInstagram
                      ? 'hover:border-[#E1306C]/60 hover:shadow-[0_0_15px_rgba(225,48,108,0.2)]'
                      : isTwitter
                      ? 'hover:border-[#1DA1F2]/60 hover:shadow-[0_0_15px_rgba(29,161,242,0.2)]'
                      : 'hover:border-[#FFE93B]';

                    return (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between p-3 bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] transition-all group ${platformColor}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-[2px] bg-black/60 flex items-center justify-center flex-shrink-0">
                            {isYoutube && <YoutubeIcon className="w-4 h-4 text-[#FF0000]" />}
                            {isInstagram && <InstagramIcon className="w-4 h-4 text-[#E1306C]" />}
                            {isTwitter && <TwitterIcon className="w-4 h-4 text-[#1DA1F2]" />}
                            {!isYoutube && !isInstagram && !isTwitter && <Globe className="w-4 h-4 text-[#FFE93B]" />}
                          </div>
                          <div className="min-w-0">
                            <span className="font-display uppercase text-xs text-white font-bold block truncate">
                              {platformLabel}
                            </span>
                            <span className="text-[11px] text-[#837D72] truncate block font-mono group-hover:text-[#ADABAB]">
                              {s.handle || s.url.replace(/^https?:\/\/(www\.)?/, '')}
                            </span>
                          </div>
                        </div>

                        <ExternalLink className="w-3.5 h-3.5 text-[#837D72] group-hover:text-[#FFE93B] flex-shrink-0 ml-2 transition-colors" />
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-[#837D72]">
                  No social channels connected yet.
                </div>
              )}
            </CardContent>
          </Card>



          {/* Profile Link Box */}
          <Card>
            <CardContent className="p-4 space-y-2 text-xs">
              <span className="text-[10px] font-display uppercase tracking-wider text-[#837D72] block font-semibold">
                Permanent Profile Link
              </span>
              <div className="p-2.5 bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] font-mono text-[11px] text-[#FFE93B] break-all">
                /players/{player.slug}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
