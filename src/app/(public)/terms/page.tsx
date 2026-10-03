import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, FileText, ArrowLeft, CheckCircle2, PhoneOff, AlertTriangle, Gamepad2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms of service, community safety rules, and user agreement for MobileRoster India platform.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-4 border-b border-[#2A2A2A] pb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#837D72] hover:text-[#FFE93B] transition-colors font-display uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline">LEGAL DOCUMENTATION</Badge>
          <span className="text-xs text-[#837D72] font-mono">Last Updated: September 2026</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
          TERMS & CONDITIONS
        </h1>
        <p className="text-sm sm:text-base text-[#ADABAB] leading-relaxed max-w-2xl">
          Please read these terms and conditions carefully before using the MobileRoster India registry and platform services.
        </p>
      </div>

      {/* Terms Content Sections */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FFE93B]" /> 1. Acceptance of Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 leading-relaxed text-sm text-[#ADABAB]">
            <p>
              By accessing and using MobileRoster India (the &quot;Platform&quot;), including exploring directory listings, submitting player profiles, or logging into the Player Studio, you agree to comply with and be bound by these Terms and Conditions.
            </p>
            <p>
              If you do not agree with any part of these terms, you must refrain from using the platform and submitting competitive data.
            </p>
          </CardContent>
        </Card>

        {/* Highlighted Critical Safety & Community Rule */}
        <Card className="border border-[#FF3D00]/40 bg-[#160D0D]">
          <CardHeader className="border-b border-[#FF3D00]/20 bg-[#FF3D00]/5">
            <CardTitle className="text-base flex items-center justify-between text-white">
              <span className="flex items-center gap-2 text-[#FF3D00]">
                <PhoneOff className="w-4 h-4" /> 2. Strict Content & Privacy Rules (No Phone Numbers & Personal Media)
              </span>
              <span className="text-[10px] font-display uppercase tracking-wider bg-[#FF3D00]/20 text-[#FF3D00] px-2 py-0.5 rounded-[2px] font-bold">
                Mandatory Policy
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 leading-relaxed text-sm text-[#D4D4D4] pt-5">
            <div className="p-3.5 bg-black/60 border border-[#FF3D00]/30 rounded-[2px] flex items-start gap-3 text-xs text-[#FF8A80]">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#FF3D00]" />
              <p>
                <strong>Zero Tolerance on Personal Data:</strong> Do not share personal phone numbers, private real-life photos, or personal real-world incidents. This platform is strictly dedicated to MobileRoster esports and gaming content only.
              </p>
            </div>

            <ul className="list-disc list-inside space-y-2.5 text-xs sm:text-sm text-[#D4D4D4]">
              <li>
                <strong className="text-white">No Phone Numbers:</strong> Players must strictly <span className="underline text-[#FF3D00] font-semibold">NOT</span> post, publish, or share their personal mobile numbers, WhatsApp numbers, or private residential details in profile bios, gamer tags, media captions, or highlight feeds.
              </li>
              <li>
                <strong className="text-white">No Personal Incidents or Private Photos:</strong> Do not upload personal life incidents, real-world disputes, sensitive private photos, or non-gaming images.
              </li>
              <li>
                <strong className="text-white">Strictly MobileRoster Content Only:</strong> All uploaded photos (max 5), gameplay video clips (max 2), tournament achievements, and profile bios must be <strong>100% related to MobileRoster</strong> gameplay, scrims, esports tournaments, and esports team rosters.
              </li>
              <li>
                <strong className="text-white">Immediate Enforcement:</strong> Any profile found containing personal contact numbers or non-MobileRoster private media will have the media deleted immediately and the account permanently suspended from the registry.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#FFE93B]" /> 3. Independent Community Project & Non-Affiliation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 leading-relaxed text-sm text-[#ADABAB]">
            <p>
              MobileRoster India is an independent, non-commercial community documentation archive and esports registry for Indian players. <strong>This platform is purely informational and community-driven.</strong>
            </p>
            <p>
              <strong>Trademark Disclaimer:</strong> This platform is NOT affiliated with, endorsed by, sponsored by, or operated by Activision Publishing, Inc., TiMi Studio Group, Tencent Games, or any of their subsidiaries. 
            </p>
            <p>
              &quot;Call of Duty&quot;, &quot;Call of Duty: Mobile&quot;, and &quot;CODM&quot; are registered trademarks of Activision Publishing, Inc. All other trademarks, logos, and copyrights are the property of their respective owners. Any reference to these games is made under nominative fair use for identification purposes only, to indicate the specific game the community plays.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FFE93B]" /> 4. Player Profiles & Verification Standards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 leading-relaxed text-sm text-[#ADABAB]">
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm">
              <li>
                <strong>Accuracy of Information:</strong> Players must submit truthful in-game tags (IGNs), numeric MobileRoster UIDs, tournament achievements, and contact details.
              </li>
              <li>
                <strong>Profile Integrity:</strong> Misrepresenting tournament placements, impersonating other competitors, or submitting fabricated esports credentials will result in permanent removal from the directory.
              </li>
              <li>
                <strong>Fair Play & Anti-Cheat:</strong> Players found guilty of third-party illicit tools, emulators in mobile-only brackets, or official Activision competitive bans are subject to delisting from the registry.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-[#FFE93B]" /> 5. Intellectual Property & User Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 leading-relaxed text-sm text-[#ADABAB]">
            <p>
              By uploading avatars, banner covers, and gaming highlight media to the platform, you grant MobileRoster India a non-exclusive license to display this content on public directory pages, search results, and tournament leaderboards.
            </p>
            <p>
              You retain all ownership of your personal media and gamer brand assets.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#FFE93B]" /> 6. Modifications to Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 leading-relaxed text-sm text-[#ADABAB]">
            <p>
              We reserve the right to modify, update, or discontinue any feature of the platform at any time without prior notice. Terms are subject to periodic review.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
