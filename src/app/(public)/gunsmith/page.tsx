import * as React from 'react';
import type { Metadata } from 'next';
import { Crosshair, Zap, Shield, Copy, CheckCircle2, Flame, Sparkles, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GunsmithLoadoutCard } from '@/components/gunsmith/GunsmithLoadoutCard';

export const metadata: Metadata = {
  title: 'Gunsmith Studio & Weapon Meta Hub | CODM India',
  description: 'Explore pro player gunsmith loadouts, weapon tier lists, attachment stats, and copyable build codes for Call of Duty: Mobile.',
};

export interface GunsmithBuild {
  id: string;
  weaponName: string;
  weaponCategory: 'ASSAULT_RIFLE' | 'SMG' | 'SNIPER' | 'LMG' | 'SHOTGUN' | 'MARKSMAN';
  tierBadge: 'META_S_TIER' | 'A_TIER' | 'B_TIER';
  proPlayerIgn: string;
  proTeamTag: string;
  shareCode: string;
  damage: number;
  fireRate: number;
  accuracy: number;
  mobility: number;
  range: number;
  control: number;
  attachments: { slot: string; name: string }[];
  recommendedPlaystyle: string;
  seasonMeta: string;
}

const META_BUILDS: GunsmithBuild[] = [
  {
    id: 'switchblade-godl',
    weaponName: 'Switchblade X9',
    weaponCategory: 'SMG',
    tierBadge: 'META_S_TIER',
    proPlayerIgn: 'Learn',
    proTeamTag: 'GODL',
    shareCode: 'Switchblade-1C2A4A8B9A',
    damage: 78,
    fireRate: 85,
    accuracy: 72,
    mobility: 94,
    range: 65,
    control: 68,
    attachments: [
      { slot: 'Muzzle', name: 'Monolithic Suppressor' },
      { slot: 'Barrel', name: 'MIP Extended Light Barrel' },
      { slot: 'Stock', name: 'YKM Light Stock' },
      { slot: 'Laser', name: 'OWC Laser - Tactical' },
      { slot: 'Ammunition', name: 'Extended Mag A' },
    ],
    recommendedPlaystyle: 'Aggressive Entry & Close-Quarter Hardpoint Clearing',
    seasonMeta: 'Season 2026 Competitive Staple',
  },
  {
    id: 'krig6-vit',
    weaponName: 'Krig 6',
    weaponCategory: 'ASSAULT_RIFLE',
    tierBadge: 'META_S_TIER',
    proPlayerIgn: 'Sammy',
    proTeamTag: 'VIT',
    shareCode: 'Krig6-2B4A6C8E9F',
    damage: 82,
    fireRate: 70,
    accuracy: 88,
    mobility: 74,
    range: 86,
    control: 82,
    attachments: [
      { slot: 'Muzzle', name: 'Agency Suppressor' },
      { slot: 'Barrel', name: '6.2" Task Force' },
      { slot: 'Optic', name: 'Classic Red Dot Sight' },
      { slot: 'Underbarrel', name: 'Field Agent Grip' },
      { slot: 'Ammunition', name: 'Large Extended Mag B' },
    ],
    recommendedPlaystyle: 'Main AR Anchor / Cross-Map Lane Dominance',
    seasonMeta: 'Undisputed Tier 1 Long-Range Beam',
  },
  {
    id: 'dlq33-soul',
    weaponName: 'DL Q33',
    weaponCategory: 'SNIPER',
    tierBadge: 'META_S_TIER',
    proPlayerIgn: 'Abhi',
    proTeamTag: 'SOUL',
    shareCode: 'DLQ33-1A3B5C7D9E',
    damage: 96,
    fireRate: 32,
    accuracy: 92,
    mobility: 62,
    range: 95,
    control: 58,
    attachments: [
      { slot: 'Barrel', name: 'MIP Light' },
      { slot: 'Stock', name: 'YKM Combat Stock' },
      { slot: 'Laser', name: 'OWC Laser - Tactical' },
      { slot: 'Perk', name: 'Sleight of Hand' },
      { slot: 'Ammunition', name: 'Maevwat Omega Concussion' },
    ],
    recommendedPlaystyle: 'First-Pick Search & Destroy Opening Sniper',
    seasonMeta: 'Essential S&D First Blood Tool',
  },
  {
    id: 'cx9-rnt',
    weaponName: 'CX-9',
    weaponCategory: 'SMG',
    tierBadge: 'A_TIER',
    proPlayerIgn: 'Spooky',
    proTeamTag: 'RNT',
    shareCode: 'CX9-2C4E6A8B9D',
    damage: 74,
    fireRate: 92,
    accuracy: 69,
    mobility: 96,
    range: 58,
    control: 64,
    attachments: [
      { slot: 'Muzzle', name: 'Monolithic Suppressor' },
      { slot: 'Barrel', name: 'CX-38S' },
      { slot: 'Stock', name: 'CX-FR Stock' },
      { slot: 'Laser', name: 'OWC Laser - Tactical' },
      { slot: 'Ammunition', name: '50-Round Drum' },
    ],
    recommendedPlaystyle: 'Ultra-Fast Sprint-to-Fire Flex Slayer',
    seasonMeta: 'High-RPM Burst Control',
  },
  {
    id: 'holger26-godl',
    weaponName: 'Holger 26',
    weaponCategory: 'LMG',
    tierBadge: 'A_TIER',
    proPlayerIgn: 'Trunx',
    proTeamTag: 'GODL',
    shareCode: 'Holger-1B3D5E7A9C',
    damage: 84,
    fireRate: 71,
    accuracy: 85,
    mobility: 68,
    range: 82,
    control: 79,
    attachments: [
      { slot: 'Muzzle', name: 'MIP Light Flash Guard' },
      { slot: 'Barrel', name: 'MIP Light Barrel (Short)' },
      { slot: 'Stock', name: 'No Stock' },
      { slot: 'Laser', name: 'OWC Laser - Tactical' },
      { slot: 'Optic', name: 'Classic Red Dot Sight' },
    ],
    recommendedPlaystyle: 'Suppressive Fire Anchor & Site Lockdown',
    seasonMeta: 'Infinite Mag Hardpoint Anchor Build',
  },
  {
    id: 'type19-meta',
    weaponName: 'Type 19',
    weaponCategory: 'ASSAULT_RIFLE',
    tierBadge: 'META_S_TIER',
    proPlayerIgn: 'Vortex',
    proTeamTag: 'VIT',
    shareCode: 'Type19-3A5B7C9D1E',
    damage: 80,
    fireRate: 78,
    accuracy: 84,
    mobility: 80,
    range: 78,
    control: 81,
    attachments: [
      { slot: 'Muzzle', name: 'Tactical Suppressor' },
      { slot: 'Barrel', name: 'Support Barrel' },
      { slot: 'Stock', name: 'Agile Stock' },
      { slot: 'Laser', name: 'Aim Assist Laser' },
      { slot: 'Ammunition', name: 'Fast Extended Mag' },
    ],
    recommendedPlaystyle: 'Universal Flex Slayer (Mid to Long Range)',
    seasonMeta: 'Top Hybrid AR/SMG Competitive Choice',
  },
];

export default function GunsmithMetaPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#141414] border border-[#2A2A2A] rounded-[2px] p-6 sm:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-[#FFE93B]/10 border border-[#FFE93B]/30 text-xs font-bold text-[#FFE93B]">
              <Zap className="w-3.5 h-3.5" />
              <span>PRO GUNSMITH BLUEPRINTS & PATCH META</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight leading-none">
              GUNSMITH <span className="text-[#FFE93B]">META</span> STUDIO
            </h1>
            <p className="text-sm sm:text-base text-[#ADABAB] leading-relaxed">
              Curated weapon builds and attachment blueprints from India's champion esports athletes. Copy instant weapon codes directly to your game.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#1F1F1F] border border-[#333333] p-4 rounded-[2px] text-center">
              <span className="text-[10px] text-[#ADABAB] uppercase tracking-wider block">CURRENT META</span>
              <span className="font-display font-bold text-lg text-[#FFE93B]">SEASON 2026 STAGE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gunsmith Loadout Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {META_BUILDS.map((build) => (
          <GunsmithLoadoutCard key={build.id} build={build} />
        ))}
      </div>
    </div>
  );
}
