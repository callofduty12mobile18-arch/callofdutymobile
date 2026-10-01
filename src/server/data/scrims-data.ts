export interface ScrimLobby {
  id: string;
  hostTeamName: string;
  hostTeamTag: string;
  hostTeamLogo?: string;
  opponentTeamName?: string;
  opponentTeamTag?: string;
  opponentTeamLogo?: string;
  tier: 'S_TIER' | 'A_TIER' | 'B_TIER' | 'OPEN';
  modes: ('Hardpoint' | 'Search & Destroy' | 'Control')[];
  matchFormat: 'BO3' | 'BO5' | 'BO7';
  scheduledTime: string; // e.g. "Today, 8:30 PM IST"
  status: 'OPEN' | 'CHALLENGED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED';
  region: string;
  roomCredentials?: {
    roomId: string;
    roomPassword: string;
    spectatorPassword?: string;
  };
  bannedMaps: { mapName: string; bannedBy: string }[];
  pickedMaps: { mapName: string; mode: string; pickedBy: string }[];
  currentTurn: 'HOST' | 'OPPONENT' | 'COMPLETED';
  notes?: string;
  ownerEmail?: string;
  opponentEmail?: string;
  publishStatus?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isVisible?: boolean;
}

export const MobileRoster_COMPETITIVE_MAP_POOL = [
  { name: 'Summit', modes: ['Hardpoint', 'Search & Destroy', 'Control'], image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Raid', modes: ['Hardpoint', 'Search & Destroy', 'Control'], image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80' },
  { name: 'Standoff', modes: ['Hardpoint', 'Search & Destroy', 'Control'], image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80' },
  { name: 'Slums', modes: ['Hardpoint', 'Search & Destroy'], image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80' },
  { name: 'Firing Range', modes: ['Hardpoint', 'Search & Destroy'], image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80' },
  { name: 'Hacienda', modes: ['Hardpoint', 'Control'], image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80' },
  { name: 'Express', modes: ['Search & Destroy', 'Control'], image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80' },
  { name: 'Frequency', modes: ['Hardpoint', 'Control'], image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80' },
];

// Clean runtime store for active competitive scrim lobbies
export const scrimLobbiesStore: ScrimLobby[] = [];
