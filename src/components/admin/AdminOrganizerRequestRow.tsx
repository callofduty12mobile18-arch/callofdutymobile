'use client';

import * as React from 'react';
import { Trophy, Swords, CheckCircle2, XCircle, Clock, ShieldCheck, User, Calendar, DollarSign, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { reviewOrganizerRequestAction, OrganizerRequestItem } from '@/server/actions/organizer';
import { formatDate } from '@/lib/utils';

export const AdminOrganizerRequestRow: React.FC<{
  request: OrganizerRequestItem;
}> = ({ request }) => {
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState(request.status);
  const [expanded, setExpanded] = React.useState(false);

  const handleReview = async (decision: 'APPROVE' | 'REJECT') => {
    if (!confirm(`Are you sure you want to ${decision === 'APPROVE' ? 'approve and grant permission for' : 'reject'} this request?`)) {
      return;
    }
    setLoading(true);
    const res = await reviewOrganizerRequestAction(request.id, decision);
    setLoading(false);
    if (res.success) {
      setStatus(decision === 'APPROVE' ? 'APPROVED' : 'REJECTED');
    }
  };

  const isTourney = request.type === 'TOURNAMENT_ORGANIZER_REQUEST';

  return (
    <>
      <tr className="hover:bg-[#1A1A1A]/60 transition-colors">
        <td className="py-3.5">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-[2px] flex items-center justify-center ${isTourney ? 'bg-[#FFE93B]/10 text-[#FFE93B] border border-[#FFE93B]/30' : 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/40'}`}>
              {isTourney ? <Trophy className="w-4 h-4" /> : <Swords className="w-4 h-4" />}
            </div>
            <div>
              <span className="font-display font-bold text-white block text-xs">
                {request.details.eventTitle || 'Untitled Event'}
              </span>
              <span className="text-[10px] text-[#837D72] uppercase font-mono">
                {isTourney ? 'Tournament Event' : 'Scrim Matchmaking'}
              </span>
            </div>
          </div>
        </td>

        <td className="py-3.5">
          <span className="font-display font-bold text-white text-xs block">
            {request.submitterName}
          </span>
          <span className="text-[11px] font-mono text-[#837D72] block">
            {request.submitterEmail}
          </span>
        </td>

        <td className="py-3.5 text-xs text-[#ADABAB]">
          {request.details.plannedDate || 'Upcoming'}
        </td>

        <td className="py-3.5 text-xs font-mono">
          <div className="text-[#FFE93B] font-bold">
            {request.details.prizePool || 'Just for Fun'}
          </div>
          <div className="text-[10px] text-[#ADABAB] font-sans">
            Entry: {request.details.entryFee || (request.details.entryType === 'PAID' ? 'Payable' : 'Free Entry')}
          </div>
        </td>

        <td className="py-3.5 text-xs text-[#837D72]">
          {formatDate(request.createdAt)}
        </td>

        <td className="py-3.5">
          {status === 'APPROVED' ? (
            <Badge variant="verified" className="text-[10px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> PERMISSION GRANTED
            </Badge>
          ) : status === 'REJECTED' ? (
            <Badge variant="error" className="text-[10px] flex items-center gap-1">
              <XCircle className="w-3 h-3" /> DECLINED
            </Badge>
          ) : (
            <Badge variant="warning" className="text-[10px] flex items-center gap-1 animate-pulse">
              <Clock className="w-3 h-3" /> PENDING REVIEW
            </Badge>
          )}
        </td>

        <td className="py-3.5 text-right">
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7 px-2 text-[#ADABAB] hover:text-white"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Hide Details' : 'Details'}
            </Button>

            {status === 'PENDING' && (
              <>
                <Button
                  size="sm"
                  variant="primary"
                  className="text-xs h-7 px-2.5 font-bold"
                  isLoading={loading}
                  onClick={() => handleReview('APPROVE')}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  GRANT PERMISSION
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 px-2 text-rose-400 hover:text-rose-300 hover:border-rose-700"
                  isLoading={loading}
                  onClick={() => handleReview('REJECT')}
                >
                  REJECT
                </Button>
              </>
            )}
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-[#121212] border-b border-[#2A2A2A]">
          <td colSpan={7} className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#181818] p-3 rounded-[2px] border border-[#2A2A2A]">
                <span className="text-[10px] uppercase font-display text-[#837D72] block mb-1">Host Organization / Clan</span>
                <span className="text-white font-bold">{request.details.organizationOrClan || request.submitterName}</span>
              </div>
              <div className="bg-[#181818] p-3 rounded-[2px] border border-[#2A2A2A]">
                <span className="text-[10px] uppercase font-display text-[#837D72] block mb-1">Match Format / Rules</span>
                <span className="text-white">{request.details.format || 'Standard Competitive Rules'}</span>
              </div>
              <div className="bg-[#181818] p-3 rounded-[2px] border border-[#2A2A2A]">
                <span className="text-[10px] uppercase font-display text-[#837D72] block mb-1">Prize & Entry Fee</span>
                <div className="text-[#FFE93B] font-mono">{request.details.prizePool || 'Just for Fun'}</div>
                <div className="text-[11px] text-[#ADABAB]">Entry: {request.details.entryFee || 'Free Entry'}</div>
              </div>
              <div className="bg-[#181818] p-3 rounded-[2px] border border-[#2A2A2A]">
                <span className="text-[10px] uppercase font-display text-[#837D72] block mb-1">Discord / Contact Handle</span>
                <span className="text-[#FFE93B] font-mono">{request.details.discordOrContact || request.submitterEmail}</span>
              </div>
            </div>

            {request.details.description && (
              <div className="bg-[#181818] p-3 rounded-[2px] border border-[#2A2A2A] text-xs">
                <span className="text-[10px] uppercase font-display text-[#837D72] block mb-1">Event Description & Notes</span>
                <p className="text-[#CCCCCC] leading-relaxed">{request.details.description}</p>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
};
