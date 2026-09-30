import * as React from 'react';
import Link from 'next/link';
import { Shield, Users, Trophy, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getPublishedTeams } from '@/server/queries/teams';

export default async function AdminTeamsPage() {
  const teams = await getPublishedTeams();

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase mb-1">
            <Shield className="w-4 h-4" />
            <span>ORGANIZATIONS & CLANS</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            TEAMS MANAGEMENT
          </h1>
          <p className="text-xs text-[#ADABAB] mt-1">
            Official Indian competitive rosters, clan tags, and tournament achievements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="text-xs px-3 py-1">
            {teams.length} REGISTERED TEAMS
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#FFE93B]" /> All Active Rosters ({teams.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#2A2A2A] text-[#837D72] font-display uppercase tracking-wider">
                <tr>
                  <th className="pb-3 font-semibold">Team Name</th>
                  <th className="pb-3 font-semibold">Clan Tag</th>
                  <th className="pb-3 font-semibold">Active Roster</th>
                  <th className="pb-3 font-semibold">Organization</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {teams.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#837D72]">
                      No competitive teams registered in the database yet.
                    </td>
                  </tr>
                ) : (
                  teams.map((t) => (
                    <tr key={t.id} className="hover:bg-[#1A1A1A]/60 transition-colors">
                      <td className="py-3 font-display font-bold text-white">
                        <Link
                          href={`/teams/${t.slug}`}
                          target="_blank"
                          className="hover:text-[#FFE93B] transition-colors flex items-center gap-2"
                        >
                          {t.name}
                        </Link>
                      </td>
                      <td className="py-3">
                        <Badge variant="role">[{t.tag}]</Badge>
                      </td>
                      <td className="py-3 text-[#ADABAB]">
                        {t.members?.length || 0} Players
                      </td>
                      <td className="py-3 text-[#837D72]">
                        {t.organization?.name || 'Independent Clan'}
                      </td>
                      <td className="py-3">
                        <Badge variant="primary" className="text-[10px]">
                          {t.publishStatus}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Link href={`/teams/${t.slug}`} target="_blank">
                          <Button size="sm" variant="ghost">
                            View Public Profile
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
