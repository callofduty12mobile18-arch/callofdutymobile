'use client';

import * as React from 'react';
import { CheckCircle2, XCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  approveCommunityRequestAction,
  rejectCommunityRequestAction,
  resendCommunityRequestEmailAction,
} from '@/server/actions/community';
import { CommunityRequestItem } from '@/server/data/community-store';
import { formatDate } from '@/lib/utils';

export const AdminRequestRow: React.FC<{ request: CommunityRequestItem }> = ({ request }) => {
  const [loading, setLoading] = React.useState(false);
  const [resendStatus, setResendStatus] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<'PENDING' | 'APPROVED' | 'REJECTED'>(request.status);

  const handleApprove = async () => {
    setLoading(true);
    const res = await approveCommunityRequestAction(request.id);
    setLoading(false);
    if (res.success) {
      setStatus('APPROVED');
    }
  };

  const handleReject = async () => {
    setLoading(true);
    const res = await rejectCommunityRequestAction(request.id);
    setLoading(false);
    if (res.success) {
      setStatus('REJECTED');
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setResendStatus('Sending...');
    const res = await resendCommunityRequestEmailAction(request.id);
    setLoading(false);
    if (res.success) {
      setResendStatus('Sent!');
      setTimeout(() => setResendStatus(null), 3000);
    } else {
      setResendStatus('Failed');
      setTimeout(() => setResendStatus(null), 3000);
    }
  };

  return (
    <tr className="hover:bg-[#1A1A1A]/60 transition-colors">
      <td className="py-3 font-mono text-white font-medium">
        {request.email}
      </td>

      <td className="py-3 text-[#ADABAB]">
        {request.gamerTag || request.fullName ? (
          <div>
            <span className="font-display font-bold text-white">
              {request.gamerTag || request.fullName}
            </span>
            {request.gamerTag && request.fullName && (
              <span className="text-[10px] text-[#837D72] block">
                {request.fullName}
              </span>
            )}
          </div>
        ) : (
          <span className="text-[#837D72] italic">—</span>
        )}
      </td>

      <td className="py-3 text-[#837D72]">
        {formatDate(request.createdAt)}
      </td>

      <td className="py-3">
        {status === 'APPROVED' ? (
          <Badge variant="success">APPROVED</Badge>
        ) : status === 'REJECTED' ? (
          <Badge variant="error">REJECTED</Badge>
        ) : (
          <Badge variant="warning">PENDING</Badge>
        )}
      </td>

      <td className="py-3 text-right">
        {status === 'PENDING' ? (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="danger"
              onClick={handleReject}
              disabled={loading}
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Reject
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleApprove}
              isLoading={loading}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Approve & Send Setup Link
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-end">
            <Button
              size="sm"
              variant="outline"
              className="text-[11px] h-7 px-2.5 border-[#2A2A2A] hover:border-[#FFE93B] text-[#ADABAB] hover:text-[#FFE93B]"
              onClick={handleResend}
              disabled={loading}
              title="Re-dispatch setup link email to player"
            >
              <Mail className="w-3 h-3 mr-1" />
              {resendStatus ? resendStatus : 'Resend Link'}
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
};
