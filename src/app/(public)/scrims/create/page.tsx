import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Swords, ArrowLeft, Shield, Clock, MapPin, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createScrimAction } from '@/server/actions/scrims';

export const metadata: Metadata = {
  title: 'Host Scrim Lobby | CODM India',
  description: 'Create and publish a competitive Call of Duty: Mobile scrimmage lobby for your team.',
};

export default function CreateScrimPage() {
  async function handleSubmit(formData: FormData) {
    'use server';
    const res = await createScrimAction(formData);
    if (res.success && res.scrimId) {
      redirect(`/scrims/${res.scrimId}`);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Link href="/scrims" className="inline-flex items-center text-xs font-bold text-[#ADABAB] hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> BACK TO SCRIM FINDER
      </Link>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-[#FFE93B]/10 border border-[#FFE93B]/30 text-xs font-bold text-[#FFE93B]">
          <Swords className="w-3.5 h-3.5" />
          <span>MATCH HOSTING WIZARD</span>
        </div>
        <h1 className="font-display font-black text-3xl text-white uppercase tracking-tight">
          HOST A <span className="text-[#FFE93B]">SCRIM LOBBY</span>
        </h1>
        <p className="text-sm text-[#ADABAB]">
          Set up match rules, select your preferred competitive tier, and start receiving challenges from verified teams.
        </p>
      </div>

      <Card className="bg-[#141414] border-[#2A2A2A]">
        <CardContent className="p-6 sm:p-8">
          <form action={handleSubmit} className="space-y-6">
            {/* Team Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  Host Team Name *
                </label>
                <input
                  type="text"
                  name="hostTeamName"
                  required
                  placeholder="e.g. GodLike Esports"
                  className="w-full bg-[#0D0D0D] border border-[#333333] text-white text-sm px-3.5 py-2.5 rounded-[2px] focus:outline-none focus:border-[#FFE93B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  Team Clan Tag *
                </label>
                <input
                  type="text"
                  name="hostTeamTag"
                  required
                  placeholder="e.g. GODL"
                  className="w-full bg-[#0D0D0D] border border-[#333333] text-white text-sm px-3.5 py-2.5 rounded-[2px] focus:outline-none focus:border-[#FFE93B] uppercase"
                />
              </div>
            </div>

            {/* Tier & Format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  Target Competitive Tier
                </label>
                <select
                  name="tier"
                  defaultValue="A_TIER"
                  className="w-full bg-[#0D0D0D] border border-[#333333] text-white text-sm px-3.5 py-2.5 rounded-[2px] focus:outline-none focus:border-[#FFE93B]"
                >
                  <option value="S_TIER">S-TIER (National Finalists & Pro Orgs)</option>
                  <option value="A_TIER">A-TIER (Semi-Pro & Regular Tournament Teams)</option>
                  <option value="B_TIER">B-TIER (Academy & Intermediate Clans)</option>
                  <option value="OPEN">OPEN (All Skill Levels Welcome)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  Match Format
                </label>
                <select
                  name="matchFormat"
                  defaultValue="BO5"
                  className="w-full bg-[#0D0D0D] border border-[#333333] text-white text-sm px-3.5 py-2.5 rounded-[2px] focus:outline-none focus:border-[#FFE93B]"
                >
                  <option value="BO3">Best of 3 (HP - S&D - CTL)</option>
                  <option value="BO5">Best of 5 (HP - S&D - CTL - HP - S&D)</option>
                  <option value="BO7">Best of 7 (Pro Grand Finals Format)</option>
                </select>
              </div>
            </div>

            {/* Game Modes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider block">
                Included Game Modes
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className="flex items-center gap-2 bg-[#1A1A1A] border border-[#333333] p-3 rounded-[2px] cursor-pointer hover:border-[#FFE93B]/60">
                  <input type="checkbox" name="mode_hp" defaultChecked className="accent-[#FFE93B]" />
                  <span className="text-xs font-bold text-white">Hardpoint</span>
                </label>
                <label className="flex items-center gap-2 bg-[#1A1A1A] border border-[#333333] p-3 rounded-[2px] cursor-pointer hover:border-[#FFE93B]/60">
                  <input type="checkbox" name="mode_snd" defaultChecked className="accent-[#FFE93B]" />
                  <span className="text-xs font-bold text-white">Search & Destroy</span>
                </label>
                <label className="flex items-center gap-2 bg-[#1A1A1A] border border-[#333333] p-3 rounded-[2px] cursor-pointer hover:border-[#FFE93B]/60">
                  <input type="checkbox" name="mode_ctl" defaultChecked className="accent-[#FFE93B]" />
                  <span className="text-xs font-bold text-white">Control</span>
                </label>
              </div>
            </div>

            {/* Timing & Server */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  Scheduled Time Slot *
                </label>
                <input
                  type="text"
                  name="scheduledTime"
                  required
                  defaultValue="Today, 8:30 PM IST"
                  placeholder="e.g. Today, 9:00 PM IST"
                  className="w-full bg-[#0D0D0D] border border-[#333333] text-white text-sm px-3.5 py-2.5 rounded-[2px] focus:outline-none focus:border-[#FFE93B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  Server Region / Preference
                </label>
                <input
                  type="text"
                  name="region"
                  defaultValue="India (Mumbai Server)"
                  placeholder="e.g. India (Delhi / Mumbai)"
                  className="w-full bg-[#0D0D0D] border border-[#333333] text-white text-sm px-3.5 py-2.5 rounded-[2px] focus:outline-none focus:border-[#FFE93B]"
                />
              </div>
            </div>

            {/* Custom Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white uppercase tracking-wider block">
                Additional Notes / Rules
              </label>
              <textarea
                name="notes"
                rows={3}
                placeholder="e.g. Practicing aggressive anchor play. No persistent scorestreaks. Official CDL weapon loadouts only."
                className="w-full bg-[#0D0D0D] border border-[#333333] text-white text-sm p-3 rounded-[2px] focus:outline-none focus:border-[#FFE93B]"
              />
            </div>

            <Button type="submit" size="lg" variant="primary" className="w-full">
              PUBLISH SCRIM LOBBY
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
