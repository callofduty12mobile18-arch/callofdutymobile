import * as React from 'react';
import Link from 'next/link';
import {
  Users,
  Shield,
  Trophy,
  Inbox,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Plus,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getPublishedPlayers } from '@/server/queries/players';
import { getPublishedTeams } from '@/server/queries/teams';
import { getPublishedTournaments } from '@/server/queries/tournaments';
import { getCommunityRequestsList } from '@/server/actions/community';
import { DirectInviteModal } from '@/components/admin/DirectInviteModal';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [playersData, teams, tournaments, requests] = await Promise.all([
    getPublishedPlayers({ limit: 10 }),
    getPublishedTeams(),
    getPublishedTournaments(),
    getCommunityRequestsList(),
  ]);

  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            ADMINISTRATIVE DASHBOARD
          </h1>
          <p className="text-xs text-[#ADABAB] mt-1">
            Platform health, submission intake, verification queue, and directory records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DirectInviteModal triggerButtonText="INVITE PLAYER" />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Submissions / Requests */}
        <Card variant="elevated">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#837D72] font-display uppercase tracking-wider block">
                Pending Requests
              </span>
              <span className="font-display font-black text-3xl text-[#FFE93B] mt-1 block">
                {pendingRequestsCount}
              </span>
            </div>
            <div className="w-10 h-10 rounded-[2px] bg-[#FFE93B]/10 border border-[#FFE93B]/30 flex items-center justify-center text-[#FFE93B]">
              <Inbox className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Players */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#837D72] font-display uppercase tracking-wider block">
                Published Players
              </span>
              <span className="font-display font-black text-3xl text-white mt-1 block">
                {playersData.total}
              </span>
            </div>
            <div className="w-10 h-10 rounded-[2px] bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Teams */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#837D72] font-display uppercase tracking-wider block">
                Active Teams
              </span>
              <span className="font-display font-black text-3xl text-white mt-1 block">
                {teams.length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-[2px] bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-white">
              <Shield className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Tournaments */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#837D72] font-display uppercase tracking-wider block">
                Tournaments
              </span>
              <span className="font-display font-black text-3xl text-white mt-1 block">
                {tournaments.length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-[2px] bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-white">
              <Trophy className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Community Requests Queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FFE93B]" /> Community Access Requests Queue
          </CardTitle>
          <Link
            href="/admin/requests"
            className="text-xs text-[#FFE93B] font-display uppercase font-semibold hover:underline flex items-center gap-1"
          >
            VIEW ALL <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#2A2A2A] text-[#837D72] font-display uppercase tracking-wider">
                <tr>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Name / Gamer Tag</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#837D72]">
                      No join requests received yet. New requests submitted via /join will appear here.
                    </td>
                  </tr>
                ) : (
                  requests.slice(0, 5).map((req) => (
                    <tr key={req.id}>
                      <td className="py-3 font-display font-bold text-white">{req.email}</td>
                      <td className="py-3 text-[#ADABAB]">{req.fullName || req.gamerTag || '—'}</td>
                      <td className="py-3">
                        <Badge
                          variant={
                            req.status === 'APPROVED'
                              ? 'verified'
                              : req.status === 'REJECTED'
                              ? 'error'
                              : 'warning'
                          }
                        >
                          {req.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Link href="/admin/requests">
                          <Button size="sm" variant="primary">
                            Manage
                          </Button>
                        </Link>
                      </td>
                    </tr>
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
