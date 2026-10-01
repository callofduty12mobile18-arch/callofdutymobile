'use client';

import * as React from 'react';
import { CheckCircle2, XCircle, Key, Copy, Check, Mail } from 'lucide-react';
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
  const [copied, setCopied] = React.useState(false);
  const [resendStatus, setResendStatus] = React.useState<string | null>(null);
  const [issuedCreds, setIssuedCreds] = React.useState<{ email: string; password: string } | null>(
    request.generatedPassword
      ? { email: request.email, password: request.generatedPassword }
      : null
  );

  const handleApprove = async () => {
    setLoading(true);
    const res = await approveCommunityRequestAction(request.id);
    setLoading(false);
    if (res.success && res.credentials) {
      setIssuedCreds(res.credentials);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    await rejectCommunityRequestAction(request.id);
    setLoading(false);
  };

  const handleResend = async () => {
    setLoading(true);
    setResendStatus('Sending...');
    const res = await resendCommunityRequestEmailAction(request.id);
    setLoading(false);
    if (res.success) {
      setResendStatus('Sent!');
      if (res.credentials) {
        setIssuedCreds(res.credentials);
      }
      setTimeout(() => setResendStatus(null), 3000);
    } else {
      setResendStatus('Failed');
      setTimeout(() => setResendStatus(null), 3000);
    }
  };

  const copyCreds = () => {
    if (!issuedCreds) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    navigator.clipboard.writeText(
      `CallOfDutyMobile Access\nEmail: ${issuedCreds.email}\nKey: ${issuedCreds.password}\nLogin URL: ${origin}/player/login`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        {issuedCreds || request.status === 'APPROVED' ? (
          <Badge variant="success">APPROVED</Badge>
        ) : request.status === 'REJECTED' ? (
          <Badge variant="error">REJECTED</Badge>
        ) : (
          <Badge variant="warning">PENDING</Badge>
        )}
      </td>

      <td className="py-3">
        {issuedCreds ? (
          <div className="flex items-center gap-2 bg-[#0A0A0A] border border-[#2A2A2A] px-2 py-1 rounded-[2px]">
            <Key className="w-3.5 h-3.5 text-[#FFE93B]" />
            <span className="font-mono text-[#FFE93B] font-bold text-[11px]">
              {issuedCreds.password}
            </span>
            <button
              onClick={copyCreds}
              className="text-[#837D72] hover:text-white p-0.5"
              title="Copy credentials"
            >
              {copied ? <Check className="w-3 h-3 text-[#00E676]" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        ) : (
          <span className="text-[#837D72] italic text-[11px]">Not issued yet</span>
        )}
      </td>

      <td className="py-3 text-right">
        {request.status === 'PENDING' && !issuedCreds ? (
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
              Accept & Send Key
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2.5">
            <span className="text-xs text-[#00E676] font-display uppercase font-semibold inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approved
            </span>
            <Button
              size="sm"
              variant="outline"
              className="text-[11px] h-7 px-2.5 border-[#2A2A2A] hover:border-[#FFE93B] text-[#ADABAB] hover:text-[#FFE93B]"
              onClick={handleResend}
              disabled={loading}
              title="Re-dispatch credentials email to player"
            >
              <Mail className="w-3 h-3 mr-1" />
              {resendStatus ? resendStatus : 'Resend Email'}
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
};
