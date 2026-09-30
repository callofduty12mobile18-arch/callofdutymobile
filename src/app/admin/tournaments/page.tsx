import * as React from 'react';
import Link from 'next/link';
import { Trophy, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getPublishedTournaments } from '@/server/queries/tournaments';

export default async function AdminTournamentsPage() {
  const tournaments = await getPublishedTournaments();

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase mb-1">
            <Trophy className="w-4 h-4" />
            <span>COMPETITIVE BRACKETS</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            TOURNAMENTS MANAGEMENT
          </h1>
          <p className="text-xs text-[#ADABAB] mt-1">
            Championship records, official national LANs, and collegiate brackets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="text-xs px-3 py-1">
            {tournaments.length} TOURNAMENTS
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FFE93B]" /> All Tournaments ({tournaments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#2A2A2A] text-[#837D72] font-display uppercase tracking-wider">
                <tr>
                  <th className="pb-3 font-semibold">Tournament Name</th>
                  <th className="pb-3 font-semibold">Tier</th>
                  <th className="pb-3 font-semibold">Organizer</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">MVP Player</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {tournaments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#837D72]">
                      No tournaments recorded in the database yet.
                    </td>
                  </tr>
                ) : (
                  tournaments.map((t) => (
                    <tr key={t.id} className="hover:bg-[#1A1A1A]/60 transition-colors">
                      <td className="py-3 font-display font-bold text-white">
                        <Link
                          href={`/tournaments/${t.slug}`}
                          target="_blank"
                          className="hover:text-[#FFE93B] transition-colors flex items-center gap-2"
                        >
                          {t.name}
                        </Link>
                      </td>
                      <td className="py-3">
                        <Badge variant="warning">{t.tier}</Badge>
                      </td>
                      <td className="py-3 text-[#ADABAB]">{t.organizer}</td>
                      <td className="py-3">
                        <Badge variant="secondary" className="text-[10px]">
                          {t.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-[#FFE93B]">
                        {t.mvpPlayer?.ign || '—'}
                      </td>
                      <td className="py-3 text-right">
                        <Link href={`/tournaments/${t.slug}`} target="_blank">
                          <Button size="sm" variant="ghost">
                            View Tournament
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
