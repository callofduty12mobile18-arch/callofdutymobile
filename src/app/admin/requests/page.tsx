import * as React from 'react';
import { Mail, Clock, Trophy, Swords, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getCommunityRequestsList } from '@/server/actions/community';
import { getAdminOrganizerRequests } from '@/server/actions/organizer';
import { AdminRequestRow } from '@/components/admin/AdminRequestRow';
import { AdminOrganizerRequestRow } from '@/components/admin/AdminOrganizerRequestRow';
import { DirectInviteModal } from '@/components/admin/DirectInviteModal';

export const dynamic = 'force-dynamic';

export default async function AdminRequestsPage() {
  const [communityRequests, organizerRequests] = await Promise.all([
    getCommunityRequestsList(),
    getAdminOrganizerRequests(),
  ]);

  const pendingCommunityCount = communityRequests.filter((r) => r.status === 'PENDING').length;
  const pendingOrganizerCount = organizerRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-10 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase mb-1">
            <Mail className="w-4 h-4" />
            <span>COMMUNITY & ORGANIZER INTAKE</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            REQUESTS & PERMISSIONS MANAGEMENT
          </h1>
          <p className="text-xs text-[#ADABAB] mt-1 max-w-3xl">
            Review player community access requests and tournament / scrim organizer permission requests. As Admin, approve or reject requests to control who can publish competitive events on the platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="warning" className="text-xs px-3 py-1">
            {pendingOrganizerCount + pendingCommunityCount} TOTAL PENDING
          </Badge>
          <DirectInviteModal triggerButtonText="INVITE PLAYER BY MAIL" />
        </div>
      </div>

      {/* SECTION 1: Tournament & Scrim Organizer Permissions Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#FFE93B]" />
            <h2 className="font-display font-bold text-lg text-white uppercase tracking-wide">
              Tournament & Scrim Organizer Requests
            </h2>
          </div>
          <Badge variant="secondary" className="text-xs">
            {pendingOrganizerCount} PENDING APPROVAL
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between text-[#CCCCCC]">
              <span>Organizer Verification & Permissions Queue</span>
              <span className="text-xs text-[#837D72] font-normal">
                Approving grants permission to create and manage the tournament / scrim.
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#2A2A2A] text-[#837D72] font-display uppercase tracking-wider">
                  <tr>
                    <th className="pb-3 font-semibold">Event / Scrim</th>
                    <th className="pb-3 font-semibold">Organizer / Email</th>
                    <th className="pb-3 font-semibold">Planned Date</th>
                    <th className="pb-3 font-semibold">Prize Pool / Rules</th>
                    <th className="pb-3 font-semibold">Requested On</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {organizerRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#837D72]">
                        No organizer permission requests submitted yet. When players submit requests via Player Studio, they will appear here.
                      </td>
                    </tr>
                  ) : (
                    organizerRequests.map((req) => (
                      <AdminOrganizerRequestRow key={req.id} request={req} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 2: Community Profile Access Intake */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#FFE93B]" />
            <h2 className="font-display font-bold text-lg text-white uppercase tracking-wide">
              Player Community Access Requests
            </h2>
          </div>
          <Badge variant="secondary" className="text-xs">
            {pendingCommunityCount} PENDING
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between text-[#CCCCCC]">
              <span>Player Onboarding Queue</span>
              <span className="text-xs text-[#837D72] font-normal">
                Generates self-service studio credentials for verified players.
              </span>
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
                  {communityRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#837D72]">
                        No community access requests yet. New requests submitted via /join will appear here.
                      </td>
                    </tr>
                  ) : (
                    communityRequests.map((req) => (
                      <AdminRequestRow key={req.id} request={req} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
