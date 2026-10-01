import * as React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-20 w-full bg-[#080808]/95 backdrop-blur-md border-t border-[#222222] py-12 mt-auto text-center shadow-2xl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
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
          <p className="font-display uppercase tracking-wider text-[#A1A1AA] text-[11px] sm:text-[12px]">
            CALL OF DUTY: MOBILE INDIA IS AN INDEPENDENT COMMUNITY PLAYER DIRECTORY & CLAN REGISTRY.
          </p>
        </div>

        {/* Navigation & Legal Links */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-display uppercase tracking-wider text-[#A1A1AA] pt-1">
          <Link href="/about" className="hover:text-white transition-colors">
            About Us & Vision
          </Link>
          <span className="text-[#444444]">·</span>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms & Conditions
          </Link>
          <span className="text-[#444444]">·</span>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <span className="text-[#444444]">·</span>
          <Link href="/support" className="hover:text-white transition-colors">
            Support
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-[#71717A] pt-2">
          <p>© {new Date().getFullYear()} CallOfDutyMobile India. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};
