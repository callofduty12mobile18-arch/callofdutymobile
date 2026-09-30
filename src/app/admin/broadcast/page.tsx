import * as React from 'react';
import { Megaphone, Users, Mail, Radio, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  getBroadcastRecipientEmails,
  getBroadcastHistoryList,
} from '@/server/actions/broadcast';
import { BroadcastCenterForm } from '@/components/admin/BroadcastCenterForm';

export default async function AdminBroadcastPage() {
  const [recipients, history] = await Promise.all([
    getBroadcastRecipientEmails(),
    getBroadcastHistoryList(),
  ]);

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase mb-1">
            <Radio className="w-4 h-4" />
            <span>COMMUNICATION NETWORK</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            PLAYER BROADCAST CENTER
          </h1>
          <p className="text-xs text-[#ADABAB] mt-1">
            Dispatch 1-click email announcements, tournament registration alerts, scrims schedules, and rulebook updates directly to all verified players&apos; mailboxes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="verified" className="text-xs px-3 py-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            SMTP DISPATCH READY
          </Badge>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#837D72] font-display uppercase tracking-wider block">
                Audience Reach
              </span>
              <span className="font-display font-black text-2xl text-[#FFE93B] mt-0.5 block">
                {recipients.length} Players
              </span>
            </div>
            <div className="w-9 h-9 rounded-[2px] bg-[#FFE93B]/10 border border-[#FFE93B]/30 flex items-center justify-center text-[#FFE93B]">
              <Users className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#837D72] font-display uppercase tracking-wider block">
                Total Broadcasts
              </span>
              <span className="font-display font-black text-2xl text-white mt-0.5 block">
                {history.length}
              </span>
            </div>
            <div className="w-9 h-9 rounded-[2px] bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-white">
              <Megaphone className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#837D72] font-display uppercase tracking-wider block">
                Delivery Protocol
              </span>
              <span className="font-display font-black text-2xl text-green-400 mt-0.5 block">
                DIRECT SSL
              </span>
            </div>
            <div className="w-9 h-9 rounded-[2px] bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-green-400">
              <Mail className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#837D72] font-display uppercase tracking-wider block">
                Email Template Engine
              </span>
              <span className="font-display font-black text-2xl text-cyan-400 mt-0.5 block">
                DARK THEME
              </span>
            </div>
            <div className="w-9 h-9 rounded-[2px] bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-cyan-400">
              <Radio className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Broadcast Composer & Live Preview */}
      <BroadcastCenterForm
        recipientCount={recipients.length}
        initialHistory={history}
      />
    </div>
  );
}
