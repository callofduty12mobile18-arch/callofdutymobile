'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'PLAYERS', href: '/players' },
    { label: 'TEAMS', href: '/teams' },
    { label: 'TOURNAMENTS', href: '/tournaments' },
    { label: 'SCRIMS', href: '/scrims' },
    { label: 'ABOUT', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-black/95 backdrop-blur border-b border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Wordmark with Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-[2px] overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
            <img src="/photos/logo1.png" alt="Call of Duty: Mobile India" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-black text-lg tracking-wider text-white">
              CALL<span className="text-[#FFE93B]">OF</span>DUTY
            </span>
            <span className="font-display text-[9px] tracking-[0.25em] text-[#ADABAB] -mt-0.5 font-bold">
              MOBILE <span className="text-[#FFE93B]">INDIA</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-display text-sm font-semibold tracking-wider transition-colors relative py-1',
                  isActive
                    ? 'text-[#FFE93B]'
                    : 'text-[#ADABAB] hover:text-white'
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FFE93B]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/search" className="p-2 text-[#ADABAB] hover:text-white hover:bg-[#141414] rounded-[5px] transition-colors" aria-label="Search">
            <Search className="w-4 h-4" />
          </Link>
          <Link href="/join">
            <Button size="sm" variant="primary">
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              JOIN COMMUNITY
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <Link href="/search" className="p-2 text-[#ADABAB]" aria-label="Search">
            <Search className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#ADABAB] hover:text-white"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="lg:hidden bg-[#141414] border-b border-[#2A2A2A] px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block font-display text-base font-semibold py-2 text-[#ADABAB] hover:text-[#FFE93B]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <Link href="/join" onClick={() => setMobileMenuOpen(false)}>
              <Button size="md" variant="primary" className="w-full">
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                JOIN WITH THE COMMUNITY
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
