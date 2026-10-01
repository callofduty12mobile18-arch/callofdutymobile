'use server';

import { revalidatePath } from 'next/cache';
import { scrimLobbiesStore, ScrimLobby, CODM_COMPETITIVE_MAP_POOL } from '../data/scrims-data';
import { recordAuditLog } from '../data/audit-store';

export async function getScrimLobbies(): Promise<ScrimLobby[]> {
  return scrimLobbiesStore;
}

export async function getScrimById(id: string): Promise<ScrimLobby | null> {
  const found = scrimLobbiesStore.find((s) => s.id === id);
  return found || null;
}

export interface CreateScrimInput {
  hostTeamName: string;
  hostTeamTag: string;
  tier: 'S_TIER' | 'A_TIER' | 'B_TIER' | 'OPEN';
  modes: ('Hardpoint' | 'Search & Destroy' | 'Control')[];
  matchFormat: 'BO3' | 'BO5' | 'BO7';
  scheduledTime: string;
  region: string;
  notes?: string;
}

export async function createScrimAction(formData: FormData) {
  const hostTeamName = (formData.get('hostTeamName') as string)?.trim();
  const hostTeamTag = (formData.get('hostTeamTag') as string)?.trim().toUpperCase();
  const tier = (formData.get('tier') as 'S_TIER' | 'A_TIER' | 'B_TIER' | 'OPEN') || 'OPEN';
  const matchFormat = (formData.get('matchFormat') as 'BO3' | 'BO5' | 'BO7') || 'BO5';
  const scheduledTime = (formData.get('scheduledTime') as string)?.trim() || 'Today, 8:00 PM IST';
  const region = (formData.get('region') as string)?.trim() || 'India';
  const notes = (formData.get('notes') as string)?.trim();

  const modesSelected: ('Hardpoint' | 'Search & Destroy' | 'Control')[] = [];
  if (formData.get('mode_hp')) modesSelected.push('Hardpoint');
  if (formData.get('mode_snd')) modesSelected.push('Search & Destroy');
  if (formData.get('mode_ctl')) modesSelected.push('Control');

  if (!hostTeamName || !hostTeamTag) {
    return { success: false, message: 'Team Name and Tag are required.' };
  }

  const newScrim: ScrimLobby = {
    id: `scrim-${Date.now()}`,
    hostTeamName,
    hostTeamTag,
    tier,
    modes: modesSelected.length > 0 ? modesSelected : ['Hardpoint', 'Search & Destroy', 'Control'],
    matchFormat,
    scheduledTime,
    status: 'OPEN',
    region,
    bannedMaps: [],
    pickedMaps: [],
    currentTurn: 'HOST',
    notes,
  };

  scrimLobbiesStore.unshift(newScrim);

  await recordAuditLog(
    'STATUS_MODIFIED',
    hostTeamTag,
    `Created ${tier} scrim lobby scheduled for ${scheduledTime}`,
    newScrim.id,
    'INFO'
  );

  revalidatePath('/scrims');
  return { success: true, scrimId: newScrim.id };
}

export async function challengeScrimAction(scrimId: string, opponentName: string, opponentTag: string) {
  const scrim = scrimLobbiesStore.find((s) => s.id === scrimId);
  if (!scrim) {
    return { success: false, message: 'Scrim not found.' };
  }

  scrim.opponentTeamName = opponentName;
  scrim.opponentTeamTag = opponentTag.toUpperCase();
  scrim.status = 'CHALLENGED';

  await recordAuditLog(
    'STATUS_MODIFIED',
    opponentTag,
    `Challenged host ${scrim.hostTeamTag} for ${scrim.matchFormat} match`,
    scrimId,
    'INFO'
  );

  revalidatePath(`/scrims/${scrimId}`);
  revalidatePath('/scrims');
  return { success: true };
}

export async function acceptScrimAction(scrimId: string) {
  const scrim = scrimLobbiesStore.find((s) => s.id === scrimId);
  if (!scrim) {
    return { success: false, message: 'Scrim not found.' };
  }

  scrim.status = 'CONFIRMED';
  scrim.roomCredentials = {
    roomId: `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    roomPassword: `codm${Math.floor(100 + Math.random() * 900)}`,
    spectatorPassword: `spec${Math.floor(100 + Math.random() * 900)}`,
  };

  revalidatePath(`/scrims/${scrimId}`);
  revalidatePath('/scrims');
  return { success: true };
}

export async function submitVetoAction(scrimId: string, actionType: 'BAN' | 'PICK', mapName: string, mode?: string, teamTag?: string) {
  const scrim = scrimLobbiesStore.find((s) => s.id === scrimId);
  if (!scrim) {
    return { success: false, message: 'Scrim not found.' };
  }

  const actor = teamTag || (scrim.currentTurn === 'HOST' ? scrim.hostTeamTag : scrim.opponentTeamTag || 'OPP');

  if (actionType === 'BAN') {
    scrim.bannedMaps.push({ mapName, bannedBy: actor });
  } else {
    scrim.pickedMaps.push({ mapName, mode: mode || 'Hardpoint', pickedBy: actor });
  }

  // Toggle turn
  if (scrim.bannedMaps.length + scrim.pickedMaps.length >= 5) {
    scrim.currentTurn = 'COMPLETED';
  } else {
    scrim.currentTurn = scrim.currentTurn === 'HOST' ? 'OPPONENT' : 'HOST';
  }

  revalidatePath(`/scrims/${scrimId}`);
  return { success: true };
}
