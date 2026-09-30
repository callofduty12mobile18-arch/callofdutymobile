import * as React from 'react';
import { PlayerCard } from './PlayerCard';

interface PlayerGridProps {
  players: Parameters<typeof PlayerCard>[0]['player'][];
}

export const PlayerGrid: React.FC<PlayerGridProps> = ({ players }) => {
  if (!players || players.length === 0) {
    return (
      <div className="text-center py-20 px-4 bg-[#141414]/70 backdrop-blur-md border border-[#837D72]/40 rounded-[2px] shadow-2xl">
        <p className="text-[#ADABAB] font-display uppercase tracking-wider text-sm">
          No players match your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
};
