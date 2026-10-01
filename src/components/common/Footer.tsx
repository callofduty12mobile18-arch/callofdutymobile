import * as React from 'react';
import Link from 'next/link';
import { Crosshair } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#080808] border-t border-[#181818] py-12 mt-24 text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Centered Logo */}
        <div className="flex justify-center items-center">
          <Link href="/" className="inline-flex items-center justify-center group" aria-label="Home">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[2px] overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img src="/photos/logo1.png" alt="CODM India" className="w-full h-full object-contain" />
            </div>
          </Link>
        </div>

        {/* Centered Attribution Text */}
        <div className="text-[11px] sm:text-xs leading-relaxed max-w-2xl mx-auto">
          <p className="font-display uppercase tracking-wider text-[#CCCCCC] text-[10px] sm:text-[11px]">
            CALL OF DUTY: MOBILE INDIA IS AN INDEPENDENT COMMUNITY REGISTRY & ESPORTS ARCHIVE DOCUMENTING PLAYERS AND TEAMS.
          </p>
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-[#A1A1AA] pt-1">
          <p>© {new Date().getFullYear()} CallOfDutyMobile India. All Rights Reserved.</p>
        </div>

        {/* Competitive Hub Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-display font-bold uppercase tracking-wider text-[#ADABAB] pt-2">
          <Link href="/scrims" className="hover:text-[#FFE93B] transition-colors">
            Scrim Matchmaking
          </Link>
          <span className="text-[#333333]">·</span>
          <Link href="/lft" className="hover:text-[#FFE93B] transition-colors">
            LFT Free Agents
          </Link>
          <span className="text-[#333333]">·</span>
          <Link href="/gunsmith" className="hover:text-[#FFE93B] transition-colors">
            Gunsmith Meta
          </Link>
          <span className="text-[#333333]">·</span>
          <Link href="/player" className="hover:text-[#FFE93B] transition-colors">
            Player Studio
          </Link>
        </div>

        {/* Legal & Support Links */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-display uppercase tracking-wider text-[#B4B4B8] pt-1">
          <Link href="/terms" className="hover:text-[#FFE93B] transition-colors">
            Terms & Conditions
          </Link>
          <span className="text-[#666666]">·</span>
          <Link href="/privacy" className="hover:text-[#FFE93B] transition-colors">
            Privacy Policy
          </Link>
          <span className="text-[#666666]">·</span>
          <Link href="/support" className="hover:text-[#FFE93B] transition-colors">
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
};
