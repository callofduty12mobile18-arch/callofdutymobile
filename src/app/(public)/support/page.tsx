import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MessageSquare, HelpCircle, ArrowLeft, ShieldCheck, CheckCircle2, Send, Key } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Support & Help Desk',
  description: 'Get help with your player profile, credentials, verification, or report issues.',
};

export default function SupportPage() {
  const faqs = [
    {
      q: 'How do I get a Verified Player badge?',
      a: 'Submit your request on the "Join Community" page. Our editorial team verifies your official tournament history, in-game stats, and competitive team roster before granting verified status.',
    },
    {
      q: 'I did not receive my login credentials. What should I do?',
      a: 'Check your spam or promotions folder for an email from support@callofdutymobile.in. If you still cannot find it, send us an email with your registered IGN and email address.',
    },
    {
      q: 'How do I update my IGN, UID, or competitive team?',
      a: 'Log into your Player Studio at /player/login. You can edit your IGN, CODM UID, competitive role, team tag, bio, and social media channels anytime.',
    },
    {
      q: 'How do I report an incorrect profile or tournament record?',
      a: 'Contact our staff via email or our Discord server with screenshot proof, official tournament bracket links, or UID verification.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-4 border-b border-[#2A2A2A] pb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#837D72] hover:text-[#FFE93B] transition-colors font-display uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline">COMMUNITY DESK</Badge>
          <span className="text-xs text-[#837D72] font-mono">Support & Verification Team</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
          SUPPORT & HELP DESK
        </h1>
        <p className="text-sm sm:text-base text-[#ADABAB] leading-relaxed max-w-2xl">
          Need assistance with your profile, access key, tournament records, or editorial verification? We&apos;re here to assist.
        </p>
      </div>

      {/* Support Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card variant="interactive" className="p-6 space-y-4">
          <div className="w-10 h-10 rounded-[2px] bg-[#1F1F1F] border border-[#FFE93B]/40 flex items-center justify-center text-[#FFE93B]">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-base">Direct Email Support</h3>
            <p className="text-xs text-[#ADABAB] mt-1 leading-relaxed">
              For verification queries, access resets, and profile corrections.
            </p>
          </div>
          <a
            href="mailto:support@callofdutymobile.in"
            className="inline-flex items-center text-xs font-display uppercase tracking-wider text-[#FFE93B] hover:underline pt-2 font-bold"
          >
            support@callofdutymobile.in
          </a>
        </Card>

        <Card variant="interactive" className="p-6 space-y-4">
          <div className="w-10 h-10 rounded-[2px] bg-[#1F1F1F] border border-[#FFE93B]/40 flex items-center justify-center text-[#FFE93B]">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-base">Discord Community</h3>
            <p className="text-xs text-[#ADABAB] mt-1 leading-relaxed">
              Connect with Indian CODM scrim organizers, players, and platform mods.
            </p>
          </div>
          <Link
            href="/join"
            className="inline-flex items-center text-xs font-display uppercase tracking-wider text-[#FFE93B] hover:underline pt-2 font-bold"
          >
            Request Discord Invite →
          </Link>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6 pt-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-white uppercase tracking-tight flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#FFE93B]" /> Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base text-white normal-case font-semibold">
                  {faq.q}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm text-[#ADABAB] leading-relaxed">
                {faq.a}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Action Box */}
      <Card className="p-6 sm:p-8 bg-[#141414] border border-[#FFE93B]/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-display font-black text-lg text-white uppercase">
            Ready to join the registry?
          </h3>
          <p className="text-xs text-[#ADABAB]">
            Submit your competitive credentials to get your profile indexed.
          </p>
        </div>
        <Link href="/join">
          <Button size="md" variant="primary">
            JOIN COMMUNITY NOW
          </Button>
        </Link>
      </Card>
    </div>
  );
}
