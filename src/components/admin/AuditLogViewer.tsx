'use client';

import * as React from 'react';
import {
  Activity,
  Shield,
  Search,
  Filter,
  Key,
  UserCheck,
  Mail,
  Edit3,
  Image as ImageIcon,
  LogIn,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AuditLogItem } from '@/server/data/audit-store';

interface AuditLogViewerProps {
  initialLogs: AuditLogItem[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ initialLogs }) => {
  const [categoryFilter, setCategoryFilter] = React.useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredLogs = initialLogs.filter((log) => {
    // Category filter
    if (categoryFilter === 'AUTH') {
      if (!['CREDENTIALS_ISSUED', 'DIRECT_INVITE_SENT', 'PLAYER_LOGGED_IN'].includes(log.action)) {
        return false;
      }
    } else if (categoryFilter === 'PROFILES') {
      if (!['PROFILE_UPDATED', 'MEDIA_UPLOADED'].includes(log.action)) {
        return false;
      }
    } else if (categoryFilter === 'INTAKE') {
      if (!['COMMUNITY_JOIN_REQUESTED', 'STATUS_MODIFIED'].includes(log.action)) {
        return false;
      }
    }

    // Severity filter
    if (severityFilter !== 'ALL' && log.severity !== severityFilter) {
      return false;
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchActor = log.actor.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchTarget = log.target?.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      return matchActor || matchDetails || matchTarget || matchAction;
    }

    return true;
  });

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(initialLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREDENTIALS_ISSUED':
      case 'DIRECT_INVITE_SENT':
        return <Key className="w-3.5 h-3.5 text-[#FFE93B]" />;
      case 'PLAYER_LOGGED_IN':
        return <LogIn className="w-3.5 h-3.5 text-green-400" />;
      case 'PROFILE_UPDATED':
        return <Edit3 className="w-3.5 h-3.5 text-blue-400" />;
      case 'MEDIA_UPLOADED':
        return <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />;
      case 'COMMUNITY_JOIN_REQUESTED':
        return <Mail className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-white" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'SUCCESS':
        return <Badge variant="verified" className="text-[9px]">SUCCESS</Badge>;
      case 'WARNING':
        return <Badge variant="warning" className="text-[9px]">WARNING</Badge>;
      case 'CRITICAL':
        return <Badge variant="error" className="text-[9px]">CRITICAL</Badge>;
      default:
        return <Badge variant="secondary" className="text-[9px]">INFO</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#141414] border border-[#2A2A2A] p-4 rounded-[2px]">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-[2px] font-display text-xs uppercase tracking-wider font-semibold transition-colors ${
              categoryFilter === 'ALL'
                ? 'bg-[#FFE93B] text-black font-bold'
                : 'bg-[#1F1F1F] text-[#ADABAB] hover:text-white'
            }`}
          >
            All Logs ({initialLogs.length})
          </button>
          <button
            onClick={() => setCategoryFilter('AUTH')}
            className={`px-3 py-1.5 rounded-[2px] font-display text-xs uppercase tracking-wider font-semibold transition-colors ${
              categoryFilter === 'AUTH'
                ? 'bg-[#FFE93B] text-black font-bold'
                : 'bg-[#1F1F1F] text-[#ADABAB] hover:text-white'
            }`}
          >
            Auth & Invitations
          </button>
          <button
            onClick={() => setCategoryFilter('PROFILES')}
            className={`px-3 py-1.5 rounded-[2px] font-display text-xs uppercase tracking-wider font-semibold transition-colors ${
              categoryFilter === 'PROFILES'
                ? 'bg-[#FFE93B] text-black font-bold'
                : 'bg-[#1F1F1F] text-[#ADABAB] hover:text-white'
            }`}
          >
            Profiles & Media
          </button>
          <button
            onClick={() => setCategoryFilter('INTAKE')}
            className={`px-3 py-1.5 rounded-[2px] font-display text-xs uppercase tracking-wider font-semibold transition-colors ${
              categoryFilter === 'INTAKE'
                ? 'bg-[#FFE93B] text-black font-bold'
                : 'bg-[#1F1F1F] text-[#ADABAB] hover:text-white'
            }`}
          >
            Community Intake
          </button>
        </div>

        {/* Search & Export Actions */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#837D72] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actor, target, details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#837D72] focus:outline-none focus:border-[#FFE93B] transition-colors"
            />
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleExport}
            className="flex-shrink-0 text-xs border border-[#2A2A2A] hover:border-[#FFE93B]/40"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-[#FFE93B]" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-[2px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#2A2A2A] bg-[#191919] text-[#837D72] font-display uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Action / Event</th>
                <th className="py-3 px-4 font-semibold">Actor</th>
                <th className="py-3 px-4 font-semibold">Target Entity</th>
                <th className="py-3 px-4 font-semibold">Activity Details</th>
                <th className="py-3 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#837D72]">
                    No audit records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const dateObj = new Date(log.timestamp);
                  const timeFormatted = dateObj.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });
                  const dateFormatted = dateObj.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  });

                  return (
                    <tr key={log.id} className="hover:bg-[#1A1A1A]/80 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap text-[#837D72] font-mono text-[11px]">
                        <span className="text-white block font-bold">{timeFormatted}</span>
                        <span>{dateFormatted}</span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-[2px] bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                            {getActionIcon(log.action)}
                          </div>
                          <span className="font-display font-semibold text-white tracking-wide">
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-[#FFE93B]">
                        {log.actor}
                      </td>

                      {/* Target */}
                      <td className="py-3 px-4 whitespace-nowrap text-[#ADABAB] font-mono text-[11px]">
                        {log.target || '—'}
                      </td>

                      {/* Details */}
                      <td className="py-3 px-4 text-[#ADABAB] max-w-md leading-relaxed">
                        {log.details}
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        {getSeverityBadge(log.severity)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
