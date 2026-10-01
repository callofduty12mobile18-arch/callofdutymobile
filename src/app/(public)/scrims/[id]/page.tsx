import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Swords } from 'lucide-react';
import { MapVetoRoom } from '@/components/scrims/MapVetoRoom';
import { getScrimById } from '@/server/actions/scrims';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const scrim = await getScrimById(id);
  if (!scrim) return { title: 'Scrim Not Found | CODM India' };

  return {
    title: `${scrim.hostTeamName} vs ${scrim.opponentTeamName || 'Open Slot'} Scrim Lobby | CODM India`,
    description: `Competitive scrimmage lobby for ${scrim.hostTeamName} scheduled at ${scrim.scheduledTime}.`,
  };
}

export default async function ScrimLobbyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scrim = await getScrimById(id);

  if (!scrim) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link href="/scrims" className="inline-flex items-center text-xs font-bold text-[#ADABAB] hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> BACK TO ALL SCRIMS
      </Link>

      <MapVetoRoom scrim={scrim} />
    </div>
  );
}
