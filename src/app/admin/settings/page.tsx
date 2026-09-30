import * as React from 'react';
import { Settings, ShieldCheck, Mail, Database, Server, Key } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function AdminSettingsPage() {
  const isSmtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase mb-1">
            <Settings className="w-4 h-4" />
            <span>PLATFORM CONFIGURATION</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            SYSTEM SETTINGS
          </h1>
          <p className="text-xs text-[#ADABAB] mt-1">
            Environment, SMTP email integration, database connection status, and security protocols.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email & SMTP Services */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#FFE93B]" /> Email Dispatch (SMTP)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-[#1F1F1F] rounded-[2px] border border-[#2A2A2A]">
              <span className="text-[#ADABAB]">SMTP Dispatch Status</span>
              <Badge variant={isSmtpConfigured ? 'verified' : 'warning'}>
                {isSmtpConfigured ? 'CONNECTED' : 'STANDBY'}
              </Badge>
            </div>
            <div className="space-y-2 text-[#837D72]">
              <p>
                <strong className="text-white">Server:</strong> {process.env.SMTP_HOST || 'smtp.gmail.com'}
              </p>
              <p>
                <strong className="text-white">Port:</strong> {process.env.SMTP_PORT || '465 (SSL)'}
              </p>
              <p>
                <strong className="text-white">Sender:</strong> {process.env.SMTP_FROM || 'CallOfDutyMobile India'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Database & Pooler */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-[#FFE93B]" /> PostgreSQL & Prisma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-[#1F1F1F] rounded-[2px] border border-[#2A2A2A]">
              <span className="text-[#ADABAB]">Database ORM</span>
              <Badge variant="primary">PRISMA 6.x</Badge>
            </div>
            <div className="space-y-2 text-[#837D72]">
              <p>
                <strong className="text-white">Pooler:</strong> Transaction Mode (PgBouncer)
              </p>
              <p>
                <strong className="text-white">Serverless:</strong> Ready for Vercel Edge & Lambda
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Content Moderation Rules */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FFE93B]" /> Content & Privacy Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-[#ADABAB] leading-relaxed">
            <p>
              • <strong className="text-white">Media Feed Uploads:</strong> Verified players may upload up to 5 landscape photos and 2 video clips (max 60s, max 50MB).
            </p>
            <p>
              • <strong className="text-white">Strict Rules:</strong> Real-life phone numbers, personal non-gaming photos, and real-life disputes are strictly prohibited across all profile bios and feeds.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
