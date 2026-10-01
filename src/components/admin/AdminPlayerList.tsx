'use client';

import * as React from 'react';
import { Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { AdminPlayerRow } from './AdminPlayerRow';

export interface AdminPlayerListProps {
  initialPlayers: Array<{
    id: string;
    slug: string;
    ign: string;
    primaryRole: string;
    state: string | null;
    verificationStatus: string;
    publishStatus: string;
    teamMemberships?: Array<{
      isCurrent: boolean;
      team: {
        name: string;
        tag: string;
      };
    }>;
  }>;
}

export const AdminPlayerList: React.FC<AdminPlayerListProps> = ({ initialPlayers }) => {
  const [deletedIds, setDeletedIds] = React.useState<string[]>([]);
  const players = initialPlayers.filter((p) => !deletedIds.includes(p.id));

  const handleDeleted = (deletedId: string) => {
    setDeletedIds((prev) => [...prev, deletedId]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4 text-[#FFE93B]" /> All Registered Players ({players.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#2A2A2A] text-[#837D72] font-display uppercase tracking-wider">
              <tr>
                <th className="pb-3 font-semibold">IGN</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Current Team</th>
                <th className="pb-3 font-semibold">Location</th>
                <th className="pb-3 font-semibold">Verification</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {players.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#837D72]">
                    No player profiles registered in the database yet.
                  </td>
                </tr>
              ) : (
                players.map((p) => (
                  <AdminPlayerRow key={p.id} player={p} onDeleted={handleDeleted} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
