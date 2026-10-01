import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock, Eye, ShieldCheck, ArrowLeft, Database, UserCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy and data protection practices of MobileRoster India platform.',
};

export default function PrivacyPage() {
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
          <Badge variant="outline">DATA PRIVACY & SECURITY</Badge>
          <span className="text-xs text-[#837D72] font-mono">Last Updated: September 2026</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
          PRIVACY POLICY
        </h1>
        <p className="text-sm sm:text-base text-[#ADABAB] leading-relaxed max-w-2xl">
          We respect your privacy and are committed to safeguarding your personal data across the MobileRoster India platform.
        </p>
      </div>

      {/* Privacy Sections */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-[#FFE93B]" /> 1. Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 leading-relaxed text-sm text-[#ADABAB]">
            <p>
              When you interact with the platform (such as registering for community access or maintaining your player profile), we may collect:
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm">
              <li>
                <strong>Public Gaming Data:</strong> In-game name (IGN), MobileRoster numeric UID, competitive role, team affiliation, state of residence, and social media handles.
              </li>
              <li>
                <strong>Contact Information:</strong> Email address for dispatching access credentials, verification updates, and security alerts.
              </li>
              <li>
                <strong>Uploaded Media:</strong> Custom avatar photos and background cover banners submitted via the Profile Studio.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#FFE93B]" /> 2. How We Use Your Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 leading-relaxed text-sm text-[#ADABAB]">
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm">
              <li>To construct and display public player directory profiles and tournament records.</li>
              <li>To authenticate player credentials securely and protect profile edit permissions.</li>
              <li>To verify tournament placements with organizers and esports editorial staff.</li>
              <li>We never sell, rent, or monetize personal user data or email addresses.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#FFE93B]" /> 3. Data Protection & Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 leading-relaxed text-sm text-[#ADABAB]">
            <p>
              We utilize encrypted HTTP-only session cookies strictly for maintaining your player and admin authentication state. We do not use third-party tracking or advertising cookies.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#FFE93B]" /> 4. Your Rights & Data Deletion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 leading-relaxed text-sm text-[#ADABAB]">
            <p>
              Players retain full control over their competitive profile. You may modify your public information anytime via the Player Studio or request complete account and profile deletion by reaching out to our support desk.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
