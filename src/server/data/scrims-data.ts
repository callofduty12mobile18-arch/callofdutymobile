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
}

export const CODM_COMPETITIVE_MAP_POOL = [
  { name: 'Summit', modes: ['Hardpoint', 'Search & Destroy', 'Control'], image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Raid', modes: ['Hardpoint', 'Search & Destroy', 'Control'], image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80' },
  { name: 'Standoff', modes: ['Hardpoint', 'Search & Destroy', 'Control'], image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80' },
  { name: 'Slums', modes: ['Hardpoint', 'Search & Destroy'], image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80' },
  { name: 'Firing Range', modes: ['Hardpoint', 'Search & Destroy'], image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80' },
  { name: 'Hacienda', modes: ['Hardpoint', 'Control'], image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80' },
  { name: 'Express', modes: ['Search & Destroy', 'Control'], image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80' },
  { name: 'Frequency', modes: ['Hardpoint', 'Control'], image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80' },
];

// Initial seeded scrims for Indian competitive scene
export const scrimLobbiesStore: ScrimLobby[] = [
  {
    id: 'scrim-godl-01',
    hostTeamName: 'GodLike Esports',
    hostTeamTag: 'GODL',
    hostTeamLogo: '/photos/godl.png',
    opponentTeamName: 'Team Vitality India',
    opponentTeamTag: 'VIT',
    opponentTeamLogo: '/photos/vitality.png',
    tier: 'S_TIER',
    modes: ['Hardpoint', 'Search & Destroy', 'Control'],
    matchFormat: 'BO5',
    scheduledTime: 'Today, 9:00 PM IST',
    status: 'CONFIRMED',
    region: 'India (Mumbai Server)',
    roomCredentials: {
      roomId: '9482-1049',
      roomPassword: 'godlvitscrim',
      spectatorPassword: 'spec778',
    },
    bannedMaps: [
      { mapName: 'Hacienda', bannedBy: 'GODL' },
      { mapName: 'Express', bannedBy: 'VIT' },
    ],
    pickedMaps: [
      { mapName: 'Raid', mode: 'Hardpoint', pickedBy: 'GODL' },
      { mapName: 'Standoff', mode: 'Search & Destroy', pickedBy: 'VIT' },
      { mapName: 'Summit', mode: 'Control', pickedBy: 'GODL' },
    ],
    currentTurn: 'COMPLETED',
    notes: 'Official Tier 1 warm-up ahead of India Cup Masters. Strict CDL ruleset.',
  },
  {
    id: 'scrim-soul-02',
    hostTeamName: 'Team SouL',
    hostTeamTag: 'SOUL',
    hostTeamLogo: '/photos/soul.png',
    tier: 'S_TIER',
    modes: ['Hardpoint', 'Search & Destroy'],
    matchFormat: 'BO5',
    scheduledTime: 'Today, 10:00 PM IST',
    status: 'OPEN',
    region: 'India (Delhi / Mumbai)',
    bannedMaps: [],
    pickedMaps: [],
    currentTurn: 'HOST',
    notes: 'Looking for top tier S-Tier / A-Tier partner. 5v5 Competitive rules.',
  },
  {
    id: 'scrim-revenant-03',
    hostTeamName: 'Revenant Esports',
    hostTeamTag: 'RNT',
    hostTeamLogo: '/photos/revenant.png',
    opponentTeamName: 'Blind Esports',
    opponentTeamTag: 'BLIND',
    tier: 'A_TIER',
    modes: ['Hardpoint', 'Search & Destroy', 'Control'],
    matchFormat: 'BO3',
    scheduledTime: 'Tomorrow, 7:30 PM IST',
    status: 'CHALLENGED',
    region: 'India (All Regions)',
    bannedMaps: [{ mapName: 'Slums', bannedBy: 'RNT' }],
    pickedMaps: [{ mapName: 'Summit', mode: 'Hardpoint', pickedBy: 'BLIND' }],
    currentTurn: 'HOST',
    notes: 'A-Tier tournament preparation. Need fast-paced Hardpoint anchor practice.',
  },
  {
    id: 'scrim-s8ul-04',
    hostTeamName: 'S8UL Academy',
    hostTeamTag: 'S8ULA',
    tier: 'B_TIER',
    modes: ['Hardpoint', 'Search & Destroy'],
    matchFormat: 'BO3',
    scheduledTime: 'Tomorrow, 8:00 PM IST',
    status: 'OPEN',
    region: 'India',
    bannedMaps: [],
    pickedMaps: [],
    currentTurn: 'HOST',
    notes: 'Academy roster scrimmage. Looking for disciplined Tier 2/3 teams.',
  },
];
