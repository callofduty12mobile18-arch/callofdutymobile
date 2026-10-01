'use client';

import * as React from 'react';
import { Copy, CheckCircle2, Shield, Crosshair, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GunsmithBuild } from '@/app/(public)/gunsmith/page';

interface GunsmithCardProps {
  build: GunsmithBuild;
}

export const GunsmithLoadoutCard: React.FC<GunsmithCardProps> = ({ build }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(build.shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-[#141414] border-[#2A2A2A] hover:border-[#FFE93B]/60 transition-all duration-200 flex flex-col justify-between">
      <CardContent className="p-6 space-y-5">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={build.tierBadge === 'META_S_TIER' ? 'gold' : 'primary'}>
                {build.tierBadge === 'META_S_TIER' ? 'META S-TIER' : 'A-TIER'}
              </Badge>
              <span className="text-[10px] font-mono text-[#ADABAB] bg-[#1F1F1F] px-2 py-0.5 rounded-[2px]">
                {build.weaponCategory}
              </span>
            </div>
            <h3 className="font-display font-black text-2xl text-white uppercase tracking-tight mt-2">
              {build.weaponName}
            </h3>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#ADABAB] block uppercase tracking-wider">PRO BUILD BY</span>
            <span className="font-display font-bold text-sm text-[#FFE93B]">
              {build.proPlayerIgn} <span className="text-xs text-neutral-400">[{build.proTeamTag}]</span>
            </span>
          </div>
        </div>

        {/* Playstyle note */}
        <p className="text-xs text-neutral-300 italic bg-[#1A1A1A] p-2.5 rounded-[2px] border border-[#2E2E2E]">
          "{build.recommendedPlaystyle}"
        </p>

        {/* Stats Bars */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
            <div>
              <div className="flex justify-between text-[#ADABAB] mb-0.5">
                <span>Damage</span>
                <span className="text-white font-mono">{build.damage}</span>
              </div>
              <div className="h-1.5 bg-[#222222] rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${build.damage}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#ADABAB] mb-0.5">
                <span>Fire Rate</span>
                <span className="text-white font-mono">{build.fireRate}</span>
              </div>
              <div className="h-1.5 bg-[#222222] rounded-full overflow-hidden">
                <div className="h-full bg-amber-400" style={{ width: `${build.fireRate}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#ADABAB] mb-0.5">
                <span>Accuracy</span>
                <span className="text-white font-mono">{build.accuracy}</span>
              </div>
              <div className="h-1.5 bg-[#222222] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400" style={{ width: `${build.accuracy}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#ADABAB] mb-0.5">
                <span>Mobility</span>
                <span className="text-white font-mono">{build.mobility}</span>
              </div>
              <div className="h-1.5 bg-[#222222] rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: `${build.mobility}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Attachments List */}
        <div className="space-y-1.5 pt-2 border-t border-[#222222]">
          <span className="text-[10px] font-bold text-[#ADABAB] uppercase tracking-wider block">
            Equipped Attachments (5/5)
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {build.attachments.map((att) => (
              <div key={att.slot} className="flex items-center justify-between text-xs bg-[#111111] px-2.5 py-1 rounded-[2px] border border-[#262626]">
                <span className="text-[#888888] text-[11px] font-mono">{att.slot}:</span>
                <span className="text-white font-medium">{att.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Share Code Action */}
        <div className="pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="w-full justify-between font-mono text-xs border-[#333333] hover:border-[#FFE93B]"
          >
            <span className="text-[#ADABAB] truncate mr-2">Code: <strong className="text-white">{build.shareCode}</strong></span>
            {copied ? (
              <span className="flex items-center text-emerald-400 font-bold"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> COPIED</span>
            ) : (
              <span className="flex items-center text-[#FFE93B]"><Copy className="w-3.5 h-3.5 mr-1" /> COPY</span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
