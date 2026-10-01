import * as React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ExternalLink, 
  Trophy, 
  Users, 
  Swords, 
  Crosshair, 
  Zap, 
  Search, 
  Mail, 
  Info 
} from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 w-full bg-[#080808] border-t border-[#1C1C1C] text-[#ADABAB] mt-auto">
      {/* Main Footer Container with Left to Right Alignment */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Column 1: Brand & Identity (Left Aligned - Span 5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-[2px] overflow-hidden flex items-center justify-center bg-[#141414] border border-[#2A2A2A] group-hover:border-[#FFE93B]/60 transition-colors flex-shrink-0">
                <img 
                  src="/photos/logo1.png" 
                  alt="CallOfDuty Mobile India Logo" 
                  className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" 
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-xl tracking-wider text-white">
                  CALL<span className="text-[#FFE93B]">OF</span>DUTY
                </span>
                <span className="font-display text-[10px] tracking-[0.25em] text-[#ADABAB] -mt-0.5 font-bold">
                  MOBILE <span className="text-[#FFE93B]">INDIA</span>
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed max-w-md">
              The premier competitive registry, tournament archive, and tier-verified scrim matchmaking network for the Indian MobileRoster esports community.
            </p>


          </div>

          {/* Column 2: Registry & Roster Links (Span 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-[#FFE93B]">
              REGISTRY
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/players" className="hover:text-white hover:translate-x-0.5 transition-all inline-block">
                  Players Directory
                </Link>
              </li>
              <li>
                <Link href="/teams" className="hover:text-white hover:translate-x-0.5 transition-all inline-block">
                  Teams & Clans
                </Link>
              </li>
              <li>
                <Link href="/tournaments" className="hover:text-white hover:translate-x-0.5 transition-all inline-block">
                  Tournament Calendar
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white hover:translate-x-0.5 transition-all inline-block">
                  About Us & Vision
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Matchmaking & Competition (Span 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-[#FFE93B]">
              COMPETITIVE
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/scrims" className="hover:text-white hover:translate-x-0.5 transition-all inline-block">
                  Scrims Hub
                </Link>
              </li>
              <li>
                <Link href="/scrims/create" className="hover:text-white hover:translate-x-0.5 transition-all inline-block">
                  Host Scrim Lobby
                </Link>
              </li>
              <li>
                <Link href="/join" className="hover:text-white hover:translate-x-0.5 transition-all inline-block">
                  Join Community
                </Link>
              </li>
              <li>
                <Link href="/player/login" className="hover:text-white hover:translate-x-0.5 transition-all inline-block">
                  Player Studio
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-white hover:translate-x-0.5 transition-all inline-block">
                  Global Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Community & Legal (Right Aligned - Span 3 cols on lg) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-[#FFE93B]">
              ECOSYSTEM
            </h4>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              Connect with tournament organizers, challenge rival rosters, and verify competitive player profiles.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/join"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#FFE93B] text-black font-display font-bold text-xs hover:bg-[#FFE93B]/90 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                GET VERIFIED
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#141414] border border-[#2A2A2A] text-white font-display font-bold text-xs hover:border-[#FFE93B]/60 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#FFE93B]" />
                HELP DESK
              </Link>
            </div>

            <div className="pt-2 text-[11px] text-[#666666]">
              Community-operated esports platform. Not affiliated with or endorsed by Activision or Tencent.
            </div>
          </div>

        </div>

        {/* Bottom Bar - Left to Right Alignment */}
        <div className="border-t border-[#1C1C1C] mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8E8E93]">
          {/* Left: Copyright */}
          <div className="text-center md:text-left">
            <p>© {currentYear} CallOfDutyMobile India. All rights reserved.</p>
          </div>

          {/* Right: Legal & Policy Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-5 font-display uppercase tracking-wider text-[11px]">
            <Link href="/about" className="hover:text-[#FFE93B] transition-colors">
              About
            </Link>
            <span className="text-[#333333]">·</span>
            <Link href="/terms" className="hover:text-[#FFE93B] transition-colors">
              Terms & Conditions
            </Link>
            <span className="text-[#333333]">·</span>
            <Link href="/privacy" className="hover:text-[#FFE93B] transition-colors">
              Privacy Policy
            </Link>
            <span className="text-[#333333]">·</span>
            <Link href="/support" className="hover:text-[#FFE93B] transition-colors">
              Support
            </Link>

          </div>
        </div>
      </div>
    </footer>
  );
};
