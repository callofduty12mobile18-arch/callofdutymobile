import * as React from 'react';
import { getPublishedPlayers } from '@/server/queries/players';
import { DirectInviteModal } from '@/components/admin/DirectInviteModal';
import { AdminPlayerList } from '@/components/admin/AdminPlayerList';

export default async function AdminPlayersPage() {
  const { players, total } = await getPublishedPlayers({ limit: 50 });

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            PLAYERS MANAGEMENT
          </h1>
          <p className="text-xs text-[#ADABAB] mt-1">
            Browse, manage, and invite players to create their official profiles via email invitation.
          </p>
        </div>
        <DirectInviteModal triggerButtonText="SEND INVITATION TO MAIL" />
      </div>

      <AdminPlayerList initialPlayers={players} />
    </div>
  );
}

