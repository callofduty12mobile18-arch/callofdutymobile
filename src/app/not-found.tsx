import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-[#FFE93B] selection:text-black">
      <Navbar />
      <main className="flex-1 w-full flex items-center justify-center py-20 px-4 sm:px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-[2px] bg-[#141414] border border-[#FFE93B]/40 flex items-center justify-center mx-auto text-[#FFE93B]">
            <Compass className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-[#FFE93B] tracking-widest uppercase">
              ERROR 404
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
              MISSION TARGET NOT FOUND
            </h1>
            <p className="text-xs text-[#ADABAB] max-w-sm mx-auto leading-relaxed">
              The player dossier, team squad, scrim lobby, or briefing you are looking for does not exist or has been relocated.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full text-xs font-display font-black uppercase tracking-wider">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> RETURN TO BASE
              </Button>
            </Link>
            <Link href="/players" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full text-xs font-display uppercase tracking-wider text-[#CCCCCC]">
                BROWSE PLAYERS
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
