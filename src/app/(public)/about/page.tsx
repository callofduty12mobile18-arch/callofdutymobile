import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Target, 
  Trophy, 
  Users, 
  Swords, 
  Sparkles, 
  Award, 
  Globe, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  UserCheck,
  BookOpen,
  FolderArchive
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { prisma } from '@/lib/db/prisma';
import { PublishStatus } from '@prisma/client';

export const metadata: Metadata = {
  title: 'About Us & Vision | Indian CODM Player Directory',
  description: 'The official open directory and competitive profile archive for Indian CODM players, clans, and teams.',
};

export default async function AboutPage() {
  const [playerCount, teamCount] = await Promise.all([
    prisma.player.count({ where: { publishStatus: PublishStatus.PUBLISHED } }),
    prisma.team.count({ where: { publishStatus: PublishStatus.PUBLISHED } }),
  ]);

  const corePillars = [
    {
      icon: UserCheck,
      title: 'Verified Player Directory',
      tag: 'DIRECTORY',
      color: 'text-[#FFE93B]',
      description: 'The definitive database documenting Indian CODM players — tracking competitive roles (Slayer, Anchor, OBJ, IGL, Sniper), in-game IDs, social handles, and verified gamer tags.',
    },
    {
      icon: Users,
      title: 'Team & Clan Registry',
      tag: 'ROSTERS',
      color: 'text-cyan-400',
      description: 'Official directory of Indian gaming clans, active starting lineups, substitute benches, and team achievements across the community.',
    },
    {
      icon: Trophy,
      title: 'Tournament & Event Archive',
      tag: 'ARCHIVE',
      color: 'text-amber-400',
      description: 'Community-verified records of national LANs, regional cups, seasonal championships, and tournament MVP accolades with full admin transparency.',
    },
    {
      icon: Swords,
      title: 'Player Matchmaking & Scrims',
      tag: 'COMMUNITY',
      color: 'text-emerald-400',
      description: 'Self-service custom room scrim coordination and tournament discovery connecting players with active clans and teams across India.',
    },
  ];

  const milestones = [
    { number: playerCount.toLocaleString(), label: 'Registered Players', sub: 'Verified across all roles and tiers' },
    { number: teamCount.toLocaleString(), label: 'Clans & Teams Listed', sub: 'From major organizations to grassroots clans' },
    { number: '100%', label: 'Player-First Platform', sub: 'Self-service studio to manage your profile' },
    { number: 'Free', label: 'Open Access Directory', sub: 'Accessible for the entire Indian gaming scene' },
  ];

  const directoryFeatures = [
    {
      step: '01',
      title: 'Self-Service Player Studio',
      desc: 'Every player can log into /player to customize their gamer tag, competitive role, biography, photos, highlight clips, and social links.',
    },
    {
      step: '02',
      title: 'Verified Badges & Status',
      desc: 'Direct admin verification to ensure genuine identities, protecting players and clan names against impersonation.',
    },
    {
      step: '03',
      title: 'Competitive Matchmaking & Scrims',
      desc: 'Self-service scrim lobby hosting allowing teams and clans to coordinate practice matches with verified rosters.',
    },
    {
      step: '04',
      title: 'Community Tournaments & Scrims',
      desc: 'Admin-governed tournament submissions and structured scrim lobbies for active competitive practice.',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#FFE93B] selection:text-black">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-[#2A2A2A] bg-gradient-to-b from-[#141414] via-[#0A0A0A] to-black py-20 lg:py-28">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#FFE93B]/5 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[3px] bg-[#1F1F1F] border border-[#FFE93B]/40 text-[#FFE93B] text-xs font-display tracking-widest uppercase font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>INDIAN CODM PLAYER & CLAN DIRECTORY</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-white uppercase tracking-tight leading-[1.05]">
            THE OFFICIAL INDIAN <br />
            <span className="text-[#FFE93B] drop-shadow-[0_0_25px_rgba(255,233,59,0.25)]">
              CODM PLAYER DIRECTORY
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-[#ADABAB] text-sm sm:text-base md:text-lg leading-relaxed font-sans">
            <strong className="text-white">CallOfDutyMobile</strong> is the centralized registry and player directory connecting gamers, clans, and tournament organizers across India into one verified ecosystem.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link href="/join">
              <Button size="lg" variant="primary" className="font-bold tracking-wider">
                <ShieldCheck className="w-4 h-4 mr-2" />
                CREATE YOUR PLAYER PROFILE
              </Button>
            </Link>
            <Link href="/players">
              <Button size="lg" variant="outline" className="font-bold tracking-wider text-[#ADABAB] hover:text-white">
                <Users className="w-4 h-4 mr-2 text-[#FFE93B]" />
                BROWSE PLAYER DIRECTORY
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* METRICS STRIP */}
      <section className="border-b border-[#2A2A2A] bg-[#0E0E0E] py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {milestones.map((m, i) => (
              <div key={i} className="space-y-1 p-3">
                <div className="font-display font-black text-3xl sm:text-4xl text-[#FFE93B]">
                  {m.number}
                </div>
                <div className="font-display font-bold text-xs uppercase tracking-wider text-white">
                  {m.label}
                </div>
                <div className="text-[11px] text-[#837D72]">
                  {m.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUR VISION & MISSION */}
      <section className="py-20 border-b border-[#2A2A2A] bg-black relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase">
                <Target className="w-4 h-4" />
                <span>OUR MISSION & PURPOSE</span>
              </div>

              <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
                GIVING EVERY INDIAN GAMER A RECOGNIZED DIGITAL IDENTITY.
              </h2>

              <p className="text-sm text-[#CCCCCC] leading-relaxed">
                Finding genuine player stats, team rosters, and active clan members in CODM used to be difficult with fragmented social posts. 
              </p>

              <p className="text-sm text-[#CCCCCC] leading-relaxed">
                Our platform provides a single, structured community directory where players create official profiles, teams showcase their lineups, and players find scrim partners and squads quickly.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FFE93B]/20 text-[#FFE93B] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-[#ADABAB]">
                    <strong className="text-white">Player Profiles:</strong> Individual showcase with IGN, UID, primary competitive role, state, and team affiliations.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-950/60 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-[#ADABAB]">
                    <strong className="text-white">Clan Lineups:</strong> Complete listings of team rosters, captain contacts, and clan tags.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-950/60 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-[#ADABAB]">
                    <strong className="text-white">Matchmaking & Scrims:</strong> Direct hub for finding competitive practice and custom lobbies.
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Feature Card */}
            <div className="relative">
              <div className="relative bg-[#141414] border border-[#2A2A2A] rounded-[2px] p-8 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[2px] bg-[#FFE93B]/10 border border-[#FFE93B]/30 flex items-center justify-center">
                      <img src="/photos/logo1.png" alt="CODM" className="w-7 h-7 object-contain" />
                    </div>
                    <div>
                      <span className="font-display font-black text-sm text-white block">CODM DIRECTORY</span>
                      <span className="text-[10px] text-[#FFE93B] font-mono uppercase">Community Database</span>
                    </div>
                  </div>
                  <Badge variant="verified" className="text-[10px]">VERIFIED REGISTRY</Badge>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="bg-[#181818] p-4 rounded-[2px] border border-[#262626]">
                    <div className="text-[10px] uppercase font-display text-[#837D72] mb-1">Platform Type</div>
                    <p className="text-white font-semibold">Community Player & Team Directory Hub</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#181818] p-3 rounded-[2px] border border-[#262626]">
                      <span className="text-[10px] uppercase font-display text-[#837D72] block">Region</span>
                      <span className="text-[#FFE93B] font-mono font-bold">India (All States)</span>
                    </div>
                    <div className="bg-[#181818] p-3 rounded-[2px] border border-[#262626]">
                      <span className="text-[10px] uppercase font-display text-[#837D72] block">Profile Access</span>
                      <span className="text-white font-mono font-bold">Self-Service Studio</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#2A2A2A] flex items-center justify-between text-xs text-[#837D72]">
                  <span>Independent Community Portal</span>
                  <span className="font-mono text-[#FFE93B]">MobileRoster.in</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PLATFORM PILLARS */}
      <section className="py-20 border-b border-[#2A2A2A] bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase">
              <Zap className="w-4 h-4" />
              <span>WHAT THE DIRECTORY PROVIDES</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
              KEY PILLARS OF OUR PLATFORM
            </h2>
            <p className="text-xs sm:text-sm text-[#ADABAB]">
              Everything you need to discover players, showcase team rosters, and coordinate matches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {corePillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className="bg-[#141414] border border-[#2A2A2A] p-6 rounded-[2px] hover:border-[#FFE93B]/50 transition-all duration-300 space-y-4 group"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-[2px] bg-[#1F1F1F] border border-[#2E2E2E] flex items-center justify-center ${pillar.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#837D72] bg-[#1A1A1A] px-2.5 py-1 rounded-[2px] border border-[#2E2E2E]">
                      {pillar.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-base text-white uppercase tracking-wide group-hover:text-[#FFE93B] transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-[#ADABAB] leading-relaxed mt-2 font-sans">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DIRECTORY FEATURES */}
      <section className="py-20 border-b border-[#2A2A2A] bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase">
              <FolderArchive className="w-4 h-4" />
              <span>COMMUNITY FEATURES</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
              HOW TO USE THE DIRECTORY
            </h2>
            <p className="text-xs sm:text-sm text-[#ADABAB]">
              Tools created for individual players, team managers, and clan owners.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {directoryFeatures.map((v, i) => (
              <div key={i} className="bg-[#121212] border border-[#222222] p-5 rounded-[2px] space-y-3 relative">
                <span className="text-[#FFE93B] font-display font-black text-2xl opacity-40 block font-mono">
                  {v.step}
                </span>
                <h4 className="font-display font-bold text-sm text-white uppercase">
                  {v.title}
                </h4>
                <p className="text-xs text-[#837D72] leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-t from-[#141414] to-black text-center relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
            CLAIM YOUR PLAYER PROFILE TODAY
          </h2>
          <p className="text-xs sm:text-sm text-[#ADABAB] max-w-xl mx-auto leading-relaxed">
            Join hundreds of verified CODM players and clans across India. Create your profile to be discoverable in the directory.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link href="/join">
              <Button size="lg" variant="primary" className="font-bold tracking-wider">
                JOIN THE DIRECTORY
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/players">
              <Button size="lg" variant="outline" className="font-bold tracking-wider text-[#ADABAB] hover:text-white">
                VIEW ALL PLAYERS
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
