import * as React from 'react';
import { Mail, CheckCircle2, XCircle, Clock, Key, ShieldCheck, UserCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getCommunityRequestsList } from '@/server/actions/community';
import { AdminRequestRow } from '@/components/admin/AdminRequestRow';
import { DirectInviteModal } from '@/components/admin/DirectInviteModal';

export default async function AdminRequestsPage() {
  const requests = await getCommunityRequestsList();
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase mb-1">
            <Mail className="w-4 h-4" />
            <span>COMMUNITY INTAKE</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            COMMUNITY ACCESS REQUESTS
          </h1>
          <p className="text-xs text-[#ADABAB] mt-1">
            Review incoming player emails. When you accept or invite, exclusive credentials are generated and dispatched so players can log in to /player and build their own profiles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="warning" className="text-xs px-3 py-1">
            {pendingCount} PENDING
          </Badge>
          <DirectInviteModal triggerButtonText="INVITE PLAYER BY MAIL" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FFE93B]" /> Access Requests Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#2A2A2A] text-[#837D72] font-display uppercase tracking-wider">
                <tr>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Name / Gamer Tag</th>
                  <th className="pb-3 font-semibold">Date Requested</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Credentials Issued</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#837D72]">
                      No community access requests yet. New requests submitted via /join will appear here.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <AdminRequestRow key={req.id} request={req} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
