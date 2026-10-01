'use server';

import { revalidatePath } from 'next/cache';
import { scrimLobbiesStore, ScrimLobby, CODM_COMPETITIVE_MAP_POOL } from '../data/scrims-data';
import { recordAuditLog } from '../data/audit-store';
import { randomInt, randomUUID } from 'crypto';
import { getPlayerSession } from './player-auth';

const NOT_LOGGED_IN = { success: false, message: 'Please log in to the Player Studio to use scrims.' };
const MAX_TEXT = 100;

/** Strip owner emails, and hide room credentials from everyone except the two participating teams. */
function toPublic(scrim: ScrimLobby, email?: string): ScrimLobby {
  const isParticipant = !!email && (scrim.ownerEmail === email || scrim.opponentEmail === email);
  const { ownerEmail, opponentEmail, roomCredentials, ...rest } = scrim;
  void ownerEmail;
  void opponentEmail;
  return isParticipant ? { ...rest, roomCredentials } : rest;
}

export async function getScrimLobbies(): Promise<ScrimLobby[]> {
  const session = await getPlayerSession();
  return scrimLobbiesStore.map((s) => toPublic(s, session?.email));
}

export async function getScrimById(id: string): Promise<ScrimLobby | null> {
  const session = await getPlayerSession();
  const found = scrimLobbiesStore.find((s) => s.id === id);
  return found ? toPublic(found, session?.email) : null;
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

export async function createScrimAction(
  formData: FormData
): Promise<{ success: boolean; message?: string; scrimId?: string }> {
  const session = await getPlayerSession();
  if (!session) return NOT_LOGGED_IN;

  const text = (key: string) => (formData.get(key) as string | null)?.trim().slice(0, MAX_TEXT);
  const hostTeamName = text('hostTeamName');
  const hostTeamTag = text('hostTeamTag')?.toUpperCase();
  const tierInput = text('tier');
  const tier = (['S_TIER', 'A_TIER', 'B_TIER', 'OPEN'] as const).find((t) => t === tierInput) ?? 'OPEN';
  const formatInput = text('matchFormat');
  const matchFormat = (['BO3', 'BO5', 'BO7'] as const).find((f) => f === formatInput) ?? 'BO5';
  const scheduledTime = text('scheduledTime') || 'Today, 8:00 PM IST';
  const region = text('region') || 'India';
  const notes = (formData.get('notes') as string | null)?.trim().slice(0, 500);

  const modesSelected: ('Hardpoint' | 'Search & Destroy' | 'Control')[] = [];
  if (formData.get('mode_hp')) modesSelected.push('Hardpoint');
  if (formData.get('mode_snd')) modesSelected.push('Search & Destroy');
  if (formData.get('mode_ctl')) modesSelected.push('Control');

  if (!hostTeamName || !hostTeamTag) {
    return { success: false, message: 'Team Name and Tag are required.' };
  }

  const newScrim: ScrimLobby = {
    id: `scrim-${randomUUID()}`,
    ownerEmail: session.email,
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
  const session = await getPlayerSession();
  if (!session) return NOT_LOGGED_IN;

  const scrim = scrimLobbiesStore.find((s) => s.id === scrimId);
  if (!scrim) {
    return { success: false, message: 'Scrim not found.' };
  }
  if (scrim.status !== 'OPEN') {
    return { success: false, message: 'This scrim is no longer open for challenges.' };
  }
  if (scrim.ownerEmail === session.email) {
    return { success: false, message: 'You cannot challenge your own scrim.' };
  }
  opponentName = String(opponentName ?? '').trim().slice(0, MAX_TEXT);
  opponentTag = String(opponentTag ?? '').trim().slice(0, 10);
  if (!opponentName || !opponentTag) {
    return { success: false, message: 'Team name and tag are required.' };
  }

  scrim.opponentTeamName = opponentName;
  scrim.opponentTeamTag = opponentTag.toUpperCase();
  scrim.opponentEmail = session.email;
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
  const session = await getPlayerSession();
  if (!session) return NOT_LOGGED_IN;

  const scrim = scrimLobbiesStore.find((s) => s.id === scrimId);
  if (!scrim) {
    return { success: false, message: 'Scrim not found.' };
  }
  if (scrim.ownerEmail !== session.email) {
    return { success: false, message: 'Only the host team can accept a challenge.' };
  }
  if (scrim.status !== 'CHALLENGED') {
    return { success: false, message: 'There is no pending challenge to accept.' };
  }

  scrim.status = 'CONFIRMED';
  scrim.roomCredentials = {
    roomId: `${randomInt(1000, 10000)}-${randomInt(1000, 10000)}`,
    roomPassword: `codm${randomInt(100000, 1000000)}`,
    spectatorPassword: `spec${randomInt(100000, 1000000)}`,
  };

  revalidatePath(`/scrims/${scrimId}`);
  revalidatePath('/scrims');
  return { success: true };
}

export async function submitVetoAction(scrimId: string, actionType: 'BAN' | 'PICK', mapName: string, mode?: string) {
  const session = await getPlayerSession();
  if (!session) return NOT_LOGGED_IN;

  const scrim = scrimLobbiesStore.find((s) => s.id === scrimId);
  if (!scrim) {
    return { success: false, message: 'Scrim not found.' };
  }
  if (!scrim.opponentEmail || scrim.currentTurn === 'COMPLETED') {
    return { success: false, message: 'Veto is not available for this scrim.' };
  }
  const turnOwner = scrim.currentTurn === 'HOST' ? scrim.ownerEmail : scrim.opponentEmail;
  if (session.email !== turnOwner) {
    return { success: false, message: 'It is not your turn.' };
  }
  const map = CODM_COMPETITIVE_MAP_POOL.find((m) => m.name === mapName);
  if (!map || (actionType !== 'BAN' && actionType !== 'PICK')) {
    return { success: false, message: 'Invalid map or action.' };
  }
  if (scrim.bannedMaps.some((b) => b.mapName === mapName) || scrim.pickedMaps.some((p) => p.mapName === mapName)) {
    return { success: false, message: 'That map has already been used.' };
  }

  const actor = scrim.currentTurn === 'HOST' ? scrim.hostTeamTag : scrim.opponentTeamTag || 'OPP';

  if (actionType === 'BAN') {
    scrim.bannedMaps.push({ mapName, bannedBy: actor });
  } else {
    scrim.pickedMaps.push({ mapName, mode: mode && map.modes.includes(mode) ? mode : map.modes[0], pickedBy: actor });
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
