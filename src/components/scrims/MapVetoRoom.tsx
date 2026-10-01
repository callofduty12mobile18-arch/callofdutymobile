'use client';

import * as React from 'react';
import { Shield, Swords, Ban, Check, Copy, CheckCircle2, Lock, Flame } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ScrimLobby, CODM_COMPETITIVE_MAP_POOL } from '@/server/data/scrims-data';
import { challengeScrimAction, acceptScrimAction, submitVetoAction } from '@/server/actions/scrims';

interface MapVetoRoomProps {
  scrim: ScrimLobby;
}

export const MapVetoRoom: React.FC<MapVetoRoomProps> = ({ scrim }) => {
  const [copied, setCopied] = React.useState(false);
  const [challengerName, setChallengerName] = React.useState('');
  const [challengerTag, setChallengerTag] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedActionMap, setSelectedActionMap] = React.useState<string | null>(null);

  const copyCredentials = () => {
    if (!scrim.roomCredentials) return;
    const text = `CODM Scrim Lobby\nRoom ID: ${scrim.roomCredentials.roomId}\nPassword: ${scrim.roomCredentials.roomPassword}\nSpectator: ${scrim.roomCredentials.spectatorPassword || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengerName || !challengerTag) return;
    setIsSubmitting(true);
    await challengeScrimAction(scrim.id, challengerName, challengerTag);
    setIsSubmitting(false);
  };

  const handleAccept = async () => {
    setIsSubmitting(true);
    await acceptScrimAction(scrim.id);
    setIsSubmitting(false);
  };

  const handleVeto = async (type: 'BAN' | 'PICK', mapName: string, mode?: string) => {
    setIsSubmitting(true);
    await submitVetoAction(scrim.id, type, mapName, mode);
    setIsSubmitting(false);
    setSelectedActionMap(null);
  };

  const isBanned = (mapName: string) => scrim.bannedMaps.some((b) => b.mapName === mapName);
  const isPicked = (mapName: string) => scrim.pickedMaps.some((p) => p.mapName === mapName);

  return (
    <div className="space-y-8">
      {/* Matchup Header Banner */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-[2px] p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="gold">{scrim.tier.replace('_', ' ')}</Badge>
              <Badge variant="secondary">{scrim.matchFormat}</Badge>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-[2px]">
                {scrim.status}
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight flex items-center gap-3">
              <span>{scrim.hostTeamName}</span>
              <span className="text-[#FFE93B] text-lg">VS</span>
              <span className="text-neutral-300">{scrim.opponentTeamName || 'Open Slot'}</span>
            </h1>
            <p className="text-sm text-[#ADABAB]">
              Scheduled for <strong className="text-white">{scrim.scheduledTime}</strong> • Server: {scrim.region}
            </p>
          </div>

          {/* Lobby Credentials Card (if confirmed) */}
          {scrim.status === 'CONFIRMED' && scrim.roomCredentials ? (
            <div className="bg-[#1C1C1C] border border-[#FFE93B]/40 p-4 rounded-[2px] space-y-2 min-w-[280px]">
              <div className="flex items-center justify-between text-xs text-[#FFE93B] font-bold">
                <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> PRIVATE LOBBY KEY</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">ACTIVE</span>
              </div>
              <div className="font-mono text-xs text-white space-y-1 bg-black/60 p-2.5 rounded border border-[#2E2E2E]">
                <div>Room ID: <strong className="text-[#FFE93B]">{scrim.roomCredentials.roomId}</strong></div>
                <div>Password: <strong className="text-[#FFE93B]">{scrim.roomCredentials.roomPassword}</strong></div>
                <div>Spectator: <span className="text-[#ADABAB]">{scrim.roomCredentials.spectatorPassword}</span></div>
              </div>
              <Button size="sm" variant="secondary" onClick={copyCredentials} className="w-full text-xs">
                {copied ? <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> COPIED DETAILS</> : <><Copy className="w-3.5 h-3.5 mr-1.5" /> COPY CREDENTIALS</>}
              </Button>
            </div>
          ) : (
            <div className="bg-[#1C1C1C] border border-[#2E2E2E] p-4 rounded-[2px] space-y-2 max-w-sm">
              <div className="text-xs font-bold text-[#ADABAB] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-neutral-500" /> ROOM CREDENTIALS LOCKED
              </div>
              <p className="text-xs text-neutral-400">
                Lobby ID and custom room passwords will be generated automatically once both teams confirm the challenge and complete map vetoes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Challenge / Confirmation Actions */}
      {scrim.status === 'OPEN' && (
        <Card className="bg-[#161616] border-[#FFE93B]/40">
          <CardHeader>
            <CardTitle className="text-lg text-white font-display uppercase tracking-wide flex items-center gap-2">
              <Swords className="w-5 h-5 text-[#FFE93B]" /> Challenge Host as Opponent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChallenge} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Your Team Name (e.g., GodLike)"
                value={challengerName}
                onChange={(e) => setChallengerName(e.target.value)}
                required
                className="flex-1 w-full bg-[#0D0D0D] border border-[#333333] text-white text-sm px-3.5 py-2.5 rounded-[2px] focus:outline-none focus:border-[#FFE93B]"
              />
              <input
                type="text"
                placeholder="Team Tag (e.g., GODL)"
                value={challengerTag}
                onChange={(e) => setChallengerTag(e.target.value)}
                required
                className="w-full sm:w-36 bg-[#0D0D0D] border border-[#333333] text-white text-sm px-3.5 py-2.5 rounded-[2px] focus:outline-none focus:border-[#FFE93B] uppercase"
              />
              <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full sm:w-auto">
                SEND CHALLENGE
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {scrim.status === 'CHALLENGED' && (
        <Card className="bg-[#161616] border-amber-500/40">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-display font-bold text-white text-base">
                Pending Challenge from {scrim.opponentTeamName} [{scrim.opponentTeamTag}]
              </div>
              <p className="text-xs text-[#ADABAB] mt-0.5">
                The challenger is ready to compete. Host must confirm to unlock room credentials.
              </p>
            </div>
            <Button onClick={handleAccept} disabled={isSubmitting} variant="primary">
              <Check className="w-4 h-4 mr-1.5" /> ACCEPT CHALLENGE & GENERATE ROOM
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Interactive Map & Mode Pick/Ban Veto Board */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A2A2A] pb-3">
          <div>
            <h2 className="font-display font-black text-xl text-white uppercase tracking-wide flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#FFE93B]" /> Competitive Map Veto Pool
            </h2>
            <p className="text-xs text-[#ADABAB] mt-0.5">
              Turn-based Pick & Ban rotation according to official CODM Stage Rules.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#ADABAB]">Current Action Turn:</span>
            <Badge variant="gold">
              {scrim.currentTurn === 'COMPLETED' ? 'VETO COMPLETE' : scrim.currentTurn === 'HOST' ? `${scrim.hostTeamTag} (HOST)` : `${scrim.opponentTeamTag || 'OPPONENT'}`}
            </Badge>
          </div>
        </div>

        {/* Selected Veto Results Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#141414] border border-rose-900/40 p-4 rounded-[2px] space-y-2">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Ban className="w-3.5 h-3.5" /> Banned Maps ({scrim.bannedMaps.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {scrim.bannedMaps.length === 0 ? (
                <span className="text-xs text-neutral-500 italic">No maps banned yet</span>
              ) : (
                scrim.bannedMaps.map((b) => (
                  <span key={b.mapName} className="text-xs bg-rose-950/80 text-rose-300 border border-rose-800/60 px-2.5 py-1 rounded-[2px]">
                    {b.mapName} <span className="text-[10px] text-rose-400/80 font-mono">({b.bannedBy})</span>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#141414] border border-emerald-900/40 p-4 rounded-[2px] space-y-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Check className="w-3.5 h-3.5" /> Picked Match Rotation ({scrim.pickedMaps.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {scrim.pickedMaps.length === 0 ? (
                <span className="text-xs text-neutral-500 italic">No maps picked yet</span>
              ) : (
                scrim.pickedMaps.map((p, idx) => (
                  <span key={p.mapName} className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2.5 py-1 rounded-[2px]">
                    Game {idx + 1}: {p.mapName} • <span className="text-[10px] text-[#FFE93B] uppercase font-mono">{p.mode}</span>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Maps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {CODM_COMPETITIVE_MAP_POOL.map((map) => {
            const banned = isBanned(map.name);
            const picked = isPicked(map.name);

            return (
              <div
                key={map.name}
                className={`relative group overflow-hidden rounded-[2px] border transition-all duration-200 ${
                  banned
                    ? 'border-rose-900/60 opacity-50 grayscale'
                    : picked
                    ? 'border-emerald-500/80 ring-1 ring-emerald-500/50'
                    : 'border-[#2A2A2A] bg-[#141414] hover:border-[#FFE93B]/60'
                }`}
              >
                <div className="h-32 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${map.image})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  
                  {banned && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-rose-400 font-display font-black text-sm uppercase tracking-wider">
                      <Ban className="w-5 h-5 mr-1" /> BANNED
                    </div>
                  )}

                  {picked && (
                    <div className="absolute top-2 right-2 bg-emerald-900/90 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-[2px] border border-emerald-500/50 flex items-center gap-1">
                      <Check className="w-3 h-3" /> PICKED
                    </div>
                  )}

                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                    <span className="font-display font-black text-base text-white uppercase tracking-wide">
                      {map.name}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#111111] space-y-2.5">
                  <div className="flex flex-wrap gap-1">
                    {map.modes.map((m) => (
                      <span key={m} className="text-[9px] text-[#ADABAB] bg-[#1F1F1F] px-1.5 py-0.5 rounded-[2px]">
                        {m}
                      </span>
                    ))}
                  </div>

                  {!banned && !picked && scrim.currentTurn !== 'COMPLETED' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleVeto('BAN', map.name)}
                        disabled={isSubmitting}
                        className="flex-1 text-[11px] font-bold py-1.5 px-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-[2px] transition-colors flex items-center justify-center gap-1"
                      >
                        <Ban className="w-3 h-3" /> BAN
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVeto('PICK', map.name, map.modes[0])}
                        disabled={isSubmitting}
                        className="flex-1 text-[11px] font-bold py-1.5 px-2 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 rounded-[2px] transition-colors flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" /> PICK
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
