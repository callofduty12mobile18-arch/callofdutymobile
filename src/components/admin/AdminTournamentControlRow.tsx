'use client';

import * as React from 'react';
import { Eye, EyeOff, Trash2, Trophy, Swords } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PublishStatus, TournamentTier, TournamentStatus } from '@prisma/client';
import { updateTournamentPublishStatusAction, deleteTournamentAction } from '@/server/actions/admin-tournaments';
import { toggleScrimVisibilityAction, deleteScrimAdminAction } from '@/server/actions/scrims';
import { ScrimLobby } from '@/server/data/scrims-data';
import Link from 'next/link';

export interface AdminTournamentRowProps {
  tournament: {
    id: string;
    slug: string;
    name: string;
    organizer: string;
    tier: TournamentTier;
    status: TournamentStatus;
    publishStatus: PublishStatus;
    startDate: Date;
    prizePoolInr?: number | unknown;
    mvpPlayer?: { ign: string } | null;
  };
}

export const AdminTournamentRow: React.FC<AdminTournamentRowProps> = ({ tournament }) => {
  const [loading, setLoading] = React.useState(false);
  const [publishStatus, setPublishStatus] = React.useState<PublishStatus>(tournament.publishStatus);
  const [deleted, setDeleted] = React.useState(false);

  const handleTogglePublish = async () => {
    const nextStatus = publishStatus === PublishStatus.PUBLISHED ? PublishStatus.DRAFT : PublishStatus.PUBLISHED;
    setLoading(true);
    const res = await updateTournamentPublishStatusAction(tournament.id, nextStatus);
    setLoading(false);
    if (res.success) {
      setPublishStatus(nextStatus);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to archive/remove "${tournament.name}" from listings?`)) {
      return;
    }
    setLoading(true);
    const res = await deleteTournamentAction(tournament.id);
    setLoading(false);
    if (res.success) {
      setDeleted(true);
    }
  };

  if (deleted) return null;

  const isVisible = publishStatus === PublishStatus.PUBLISHED;
  const prizePoolDisplay = tournament.prizePoolInr ? `₹${Number(tournament.prizePoolInr).toLocaleString('en-IN')}` : '—';

  return (
    <tr className="hover:bg-[#1A1A1A]/60 transition-colors">
      <td className="py-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[2px] bg-[#FFE93B]/10 text-[#FFE93B] border border-[#FFE93B]/30 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <Link
              href={`/tournaments/${tournament.slug}`}
              target="_blank"
              className="font-display font-bold text-white text-xs hover:text-[#FFE93B] transition-colors"
            >
              {tournament.name}
            </Link>
            <span className="text-[10px] text-[#837D72] block font-mono">
              /{tournament.slug}
            </span>
          </div>
        </div>
      </td>

      <td className="py-3.5">
        <Badge variant={tournament.tier === 'S_TIER' || tournament.tier === 'A_TIER' ? 'warning' : 'secondary'} className="text-[10px]">
          {tournament.tier}
        </Badge>
      </td>

      <td className="py-3.5 text-xs text-[#ADABAB]">
        {tournament.organizer}
      </td>

      <td className="py-3.5 text-xs text-[#FFE93B] font-mono">
        {prizePoolDisplay}
      </td>

      <td className="py-3.5">
        <Badge variant="outline" className="text-[10px] font-mono">
          {tournament.status}
        </Badge>
      </td>

      {/* Visibility Status Badge */}
      <td className="py-3.5">
        {isVisible ? (
          <Badge variant="verified" className="text-[10px] flex items-center gap-1 w-fit">
            <Eye className="w-3 h-3" /> VISIBLE (PUBLISHED)
          </Badge>
        ) : (
          <Badge variant="error" className="text-[10px] flex items-center gap-1 w-fit">
            <EyeOff className="w-3 h-3" /> HIDDEN (DRAFT)
          </Badge>
        )}
      </td>

      {/* Admin Actions */}
      <td className="py-3.5 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant={isVisible ? 'outline' : 'primary'}
            className="text-xs h-7 px-2.5 font-bold"
            isLoading={loading}
            onClick={handleTogglePublish}
            title={isVisible ? 'Hide from public website' : 'Publish to website'}
          >
            {isVisible ? (
              <>
                <EyeOff className="w-3.5 h-3.5 mr-1 text-[#ADABAB]" />
                HIDE PAGE
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 mr-1" />
                MAKE VISIBLE
              </>
            )}
          </Button>

          <Link href={`/tournaments/${tournament.slug}`} target="_blank">
            <Button size="sm" variant="ghost" className="text-xs h-7 px-2 text-[#ADABAB] hover:text-white">
              View
            </Button>
          </Link>

          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-950/30"
            isLoading={loading}
            onClick={handleDelete}
            title="Archive / Remove Tournament"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export interface AdminScrimRowProps {
  scrim: ScrimLobby;
}

export const AdminScrimRow: React.FC<AdminScrimRowProps> = ({ scrim }) => {
  const [loading, setLoading] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(scrim.isVisible ?? true);
  const [deleted, setDeleted] = React.useState(false);

  const handleToggle = async () => {
    const nextVisible = !isVisible;
    setLoading(true);
    const res = await toggleScrimVisibilityAction(scrim.id, nextVisible);
    setLoading(false);
    if (res.success) {
      setIsVisible(nextVisible);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete scrim lobby hosted by "${scrim.hostTeamName}"?`)) return;
    setLoading(true);
    const res = await deleteScrimAdminAction(scrim.id);
    setLoading(false);
    if (res.success) {
      setDeleted(true);
    }
  };

  if (deleted) return null;

  return (
    <tr className="hover:bg-[#1A1A1A]/60 transition-colors">
      <td className="py-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[2px] bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 flex items-center justify-center">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <span className="font-display font-bold text-white text-xs block">
              {scrim.hostTeamName} vs {scrim.opponentTeamName || 'Open Challenger'}
            </span>
            <span className="text-[10px] text-[#837D72] block font-mono">
              {scrim.matchFormat} • {scrim.modes.join(', ')}
            </span>
          </div>
        </div>
      </td>

      <td className="py-3.5 text-xs text-white font-semibold">
        {scrim.hostTeamName} <span className="text-[#837D72] font-mono">[{scrim.hostTeamTag}]</span>
      </td>

      <td className="py-3.5 text-xs text-[#ADABAB]">
        {scrim.scheduledTime}
      </td>

      <td className="py-3.5 text-xs font-mono text-[#FFE93B]">
        {scrim.opponentTeamName ? '2 / 2 (Full)' : '1 / 2 (Open)'}
      </td>

      <td className="py-3.5">
        {isVisible ? (
          <Badge variant="verified" className="text-[10px] flex items-center gap-1 w-fit">
            <Eye className="w-3 h-3" /> VISIBLE (LIVE)
          </Badge>
        ) : (
          <Badge variant="error" className="text-[10px] flex items-center gap-1 w-fit">
            <EyeOff className="w-3 h-3" /> HIDDEN (DRAFT)
          </Badge>
        )}
      </td>

      <td className="py-3.5 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant={isVisible ? 'outline' : 'primary'}
            className="text-xs h-7 px-2.5 font-bold"
            isLoading={loading}
            onClick={handleToggle}
          >
            {isVisible ? (
              <>
                <EyeOff className="w-3.5 h-3.5 mr-1 text-[#ADABAB]" />
                HIDE SCRIM
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 mr-1" />
                MAKE VISIBLE
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-950/30"
            isLoading={loading}
            onClick={handleDelete}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
};
