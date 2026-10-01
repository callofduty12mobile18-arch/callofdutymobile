import * as React from 'react';
import Link from 'next/link';
import { Trophy, Swords, Shield, Eye, Plus, Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getAllAdminTournaments } from '@/server/actions/admin-tournaments';
import { getAllAdminScrimLobbies } from '@/server/actions/scrims';
import { AdminTournamentRow, AdminScrimRow } from '@/components/admin/AdminTournamentControlRow';

export const dynamic = 'force-dynamic';

export default async function AdminTournamentsPage() {
  const [tournaments, scrims] = await Promise.all([
    getAllAdminTournaments(),
    getAllAdminScrimLobbies(),
  ]);

  const visibleTournaments = tournaments.filter((t) => t.publishStatus === 'PUBLISHED').length;
  const hiddenTournaments = tournaments.length - visibleTournaments;

  const visibleScrims = scrims.filter((s) => s.publishStatus === 'PUBLISHED').length;
  const hiddenScrims = scrims.length - visibleScrims;

  return (
    <div className="space-y-10 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase mb-1">
            <Trophy className="w-4 h-4" />
            <span>COMPETITIVE & EVENT CONTROL CENTER</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            TOURNAMENTS & SCRIMS GOVERNANCE
          </h1>
          <p className="text-xs text-[#ADABAB] mt-1 max-w-3xl">
            Complete administrative control over all published tournament and scrim pages. Instantly toggle visibility (show / hide pages from public site), moderate organizer submissions, or adjust competitive tiers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="primary" className="text-xs px-3 py-1 font-mono">
            {visibleTournaments + visibleScrims} LIVE EVENTS
          </Badge>
          <Link href="/admin/requests">
            <Button size="sm" variant="outline" className="text-xs">
              <Shield className="w-3.5 h-3.5 mr-1.5 text-[#FFE93B]" />
              REVIEW PERMISSIONS
            </Button>
          </Link>
        </div>
      </div>

      {/* SECTION 1: Tournaments Control */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#FFE93B]" />
            <h2 className="font-display font-bold text-lg text-white uppercase tracking-wide">
              All Tournaments ({tournaments.length})
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="verified" className="text-[10px]">
              {visibleTournaments} PUBLIC
            </Badge>
            {hiddenTournaments > 0 && (
              <Badge variant="error" className="text-[10px]">
                {hiddenTournaments} HIDDEN / DRAFT
              </Badge>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between text-[#CCCCCC]">
              <span>Tournament Directory & Visibility Manager</span>
              <span className="text-xs text-[#837D72] font-normal">
                Click &ldquo;Hide Page&rdquo; to instantly unpublish any tournament without losing bracket data.
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#2A2A2A] text-[#837D72] font-display uppercase tracking-wider">
                  <tr>
                    <th className="pb-3 font-semibold">Tournament Name / URL</th>
                    <th className="pb-3 font-semibold">Tier</th>
                    <th className="pb-3 font-semibold">Organizer</th>
                    <th className="pb-3 font-semibold">Prize Pool</th>
                    <th className="pb-3 font-semibold">Event Status</th>
                    <th className="pb-3 font-semibold">Website Visibility</th>
                    <th className="pb-3 font-semibold text-right">Admin Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {tournaments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#837D72]">
                        No tournaments created yet.
                      </td>
                    </tr>
                  ) : (
                    tournaments.map((t) => (
                      <AdminTournamentRow key={t.id} tournament={t} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 2: Scrims Moderation & Control */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display font-bold text-lg text-white uppercase tracking-wide">
              Live Scrim Matchmaking Lobbies ({scrims.length})
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="verified" className="text-[10px]">
              {visibleScrims} PUBLIC
            </Badge>
            {hiddenScrims > 0 && (
              <Badge variant="error" className="text-[10px]">
                {hiddenScrims} HIDDEN
              </Badge>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between text-[#CCCCCC]">
              <span>Scrim Lobbies Moderation</span>
              <span className="text-xs text-[#837D72] font-normal">
                Manage live player scrim listings across T1, T2, and CDL formats.
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#2A2A2A] text-[#837D72] font-display uppercase tracking-wider">
                  <tr>
                    <th className="pb-3 font-semibold">Scrim Lobby / Rules</th>
                    <th className="pb-3 font-semibold">Host Organizer</th>
                    <th className="pb-3 font-semibold">Schedule</th>
                    <th className="pb-3 font-semibold">Team Slots</th>
                    <th className="pb-3 font-semibold">Website Visibility</th>
                    <th className="pb-3 font-semibold text-right">Admin Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {scrims.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#837D72]">
                        No active scrims currently registered.
                      </td>
                    </tr>
                  ) : (
                    scrims.map((s) => (
                      <AdminScrimRow key={s.id} scrim={s} />
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
