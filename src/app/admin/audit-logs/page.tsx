import * as React from 'react';
import { Activity, ShieldCheck, Key, RefreshCw, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getAuditLogs } from '@/server/data/audit-store';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';

export default async function AdminAuditLogsPage() {
  const logs = await getAuditLogs();

  const authLogsCount = logs.filter((l) =>
    ['CREDENTIALS_ISSUED', 'DIRECT_INVITE_SENT', 'PLAYER_LOGGED_IN'].includes(l.action)
  ).length;

  const contentLogsCount = logs.filter((l) =>
    ['PROFILE_UPDATED', 'MEDIA_UPLOADED'].includes(l.action)
  ).length;

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase mb-1">
            <Activity className="w-4 h-4" />
            <span>SECURITY & COMPLIANCE</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            SYSTEM AUDIT LOGS & ACTIVITY FEED
          </h1>
          <p className="text-xs text-[#ADABAB] mt-1">
            Real-time ledger tracking player invitations, credential generations, profile changes, media uploads, and community activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="verified" className="text-xs px-3 py-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            IMMUTABLE JOURNAL ACTIVE
          </Badge>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#837D72] font-display uppercase tracking-wider block">
                Total Logged Events
              </span>
              <span className="font-display font-black text-2xl text-white mt-0.5 block">
                {logs.length}
              </span>
            </div>
            <div className="w-9 h-9 rounded-[2px] bg-[#FFE93B]/10 border border-[#FFE93B]/30 flex items-center justify-center text-[#FFE93B]">
              <FileText className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#837D72] font-display uppercase tracking-wider block">
                Auth & Key Dispatches
              </span>
              <span className="font-display font-black text-2xl text-[#FFE93B] mt-0.5 block">
                {authLogsCount}
              </span>
            </div>
            <div className="w-9 h-9 rounded-[2px] bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-[#FFE93B]">
              <Key className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#837D72] font-display uppercase tracking-wider block">
                Content & Media Actions
              </span>
              <span className="font-display font-black text-2xl text-blue-400 mt-0.5 block">
                {contentLogsCount}
              </span>
            </div>
            <div className="w-9 h-9 rounded-[2px] bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#837D72] font-display uppercase tracking-wider block">
                Security Integrity
              </span>
              <span className="font-display font-black text-2xl text-green-400 mt-0.5 block">
                HEALTHY
              </span>
            </div>
            <div className="w-9 h-9 rounded-[2px] bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-green-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Log Explorer */}
      <AuditLogViewer initialLogs={logs} />
    </div>
  );
}
