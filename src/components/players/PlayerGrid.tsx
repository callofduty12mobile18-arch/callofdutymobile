import * as React from 'react';
import { User, Search } from 'lucide-react';
import { PlayerCard } from './PlayerCard';

interface PlayerGridProps {
  players: Parameters<typeof PlayerCard>[0]['player'][];
}

export const PlayerGrid: React.FC<PlayerGridProps> = ({ players }) => {
  if (!players || players.length === 0) {
    return (
      <div className="bg-[#141414] border border-[#2A2A2A] p-12 text-center rounded-[2px] space-y-4">
        <Search className="w-10 h-10 text-neutral-600 mx-auto" />
        <h3 className="font-display font-bold text-lg text-white">No Registered Players Found</h3>
        <p className="text-xs text-[#ADABAB] max-w-sm mx-auto">
          No players match your search or role filter criteria. Try clearing filters or searching with a different in-game name.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
};
