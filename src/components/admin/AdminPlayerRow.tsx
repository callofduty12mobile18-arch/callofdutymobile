'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { deletePlayerAction } from '@/server/actions/admin-players';

export interface AdminPlayerRowProps {
  player: {
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
  };
  onDeleted?: (id: string) => void;
}

export const AdminPlayerRow: React.FC<AdminPlayerRowProps> = ({ player, onDeleted }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const currentTeam = player.teamMemberships?.find((m) => m.isCurrent)?.team;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMsg(null);

    const res = await deletePlayerAction(player.id);
    setIsDeleting(false);

    if (res.success) {
      setIsModalOpen(false);
      if (onDeleted) {
        onDeleted(player.id);
      }
      router.refresh();
    } else {
      setErrorMsg(res.message || 'Failed to delete player.');
    }
  };

  return (
    <>
      <tr className="hover:bg-[#1A1A1A]/60 transition-colors">
        <td className="py-3 font-display font-bold text-white">
          <Link
            href={`/players/${player.slug}`}
            target="_blank"
            className="hover:text-[#FFE93B] transition-colors"
          >
            {player.ign}
          </Link>
        </td>

        <td className="py-3">
          <Badge variant="role">{player.primaryRole}</Badge>
        </td>

        <td className="py-3 text-[#ADABAB]">
          {currentTeam ? `[${currentTeam.tag}] ${currentTeam.name}` : 'Free Agent'}
        </td>

        <td className="py-3 text-[#837D72]">
          {player.state ? `${player.state}, IN` : 'IN'}
        </td>

        <td className="py-3">
          <Badge variant={player.verificationStatus === 'VERIFIED' ? 'verified' : 'secondary'}>
            {player.verificationStatus}
          </Badge>
        </td>

        <td className="py-3">
          <Badge variant="primary" className="text-[10px]">
            {player.publishStatus}
          </Badge>
        </td>

        <td className="py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <Link href={`/players/${player.slug}`} target="_blank">
              <Button size="sm" variant="ghost" className="text-xs">
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                View Profile
              </Button>
            </Link>

            <Button
              size="sm"
              variant="danger"
              onClick={() => setIsModalOpen(true)}
              className="text-xs bg-red-950/40 text-red-400 border border-red-800/60 hover:bg-red-600 hover:text-white transition-all shadow-none"
              title={`Delete player ${player.ign}`}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete
            </Button>
          </div>
        </td>
      </tr>

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <tr>
          <td colSpan={7} className="p-0">
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="relative w-full max-w-md bg-[#141414] border-2 border-red-600/80 rounded-[2px] p-6 space-y-5 shadow-[0_0_50px_rgba(255,0,0,0.25)] text-left">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-red-500">
                    <div className="p-2 rounded-full bg-red-500/10 border border-red-500/30">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">
                        DELETE PLAYER PROFILE
                      </h3>
                      <p className="text-xs text-[#837D72]">Permanent destructive action</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!isDeleting) setIsModalOpen(false);
                    }}
                    className="text-[#837D72] hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="space-y-3 text-xs text-[#ADABAB] leading-relaxed">
                  <p>
                    Are you sure you want to permanently delete player{' '}
                    <span className="font-display font-bold text-[#FFE93B] text-sm">
                      {player.ign}
                    </span>
                    ?
                  </p>
                  <p className="text-[#837D72] bg-[#0A0A0A] p-3 border border-[#2A2A2A] rounded-[2px]">
                    This will remove their profile, team membership, verified achievements, and public archive listings from the database.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-[2px] text-xs text-red-300">
                    {errorMsg}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={isDeleting}
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    isLoading={isDeleting}
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold"
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete Player'}
                  </Button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};
