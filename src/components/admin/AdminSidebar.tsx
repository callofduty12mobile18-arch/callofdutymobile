'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Shield,
  Trophy,
  Inbox,
  Image as ImageIcon,
  Settings,
  Activity,
  Megaphone,
  Crosshair,
  ExternalLink,
  Mail,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logoutAdminAction } from '@/server/actions/admin-auth';

interface AdminSidebarProps {
  adminUsername?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ adminUsername }) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const links: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }> = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Join Requests', href: '/admin/requests', icon: Mail },
    { label: 'Players', href: '/admin/players', icon: Users },
    { label: 'Teams', href: '/admin/teams', icon: Shield },
    { label: 'Tournaments', href: '/admin/tournaments', icon: Trophy },
    { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
    { label: 'Broadcast Center', href: '/admin/broadcast', icon: Megaphone },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: Activity },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Admin Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0D0D0D] border-b border-[#2A2A2A] w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[2px] overflow-hidden flex items-center justify-center flex-shrink-0">
            <img src="/photos/logo1.png" alt="CODM Admin" className="w-full h-full object-contain" />
          </div>
          <h2 className="font-display font-black text-sm text-white tracking-wider">
            CODM<span className="text-[#FFE93B]">ADMIN</span>
          </h2>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-[#ADABAB] hover:text-white"
          aria-label="Toggle admin navigation"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Desktop & Mobile Collapsible Drawer */}
      <aside
        className={cn(
          'w-full md:w-64 bg-[#0D0D0D] border-r border-[#2A2A2A] flex flex-col justify-between p-4 flex-shrink-0 transition-all duration-200',
          mobileOpen ? 'block' : 'hidden md:flex min-h-screen'
        )}
      >
        <div className="space-y-6">
          {/* Admin Brand Desktop */}
          <div className="hidden md:flex items-center gap-2.5 px-2 py-3 border-b border-[#2A2A2A]">
            <div className="w-9 h-9 rounded-[2px] overflow-hidden flex items-center justify-center flex-shrink-0">
              <img src="/photos/logo1.png" alt="CODM Admin" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-display font-black text-sm text-white tracking-wider">
                CODM<span className="text-[#FFE93B]">ADMIN</span>
              </h2>
              <span className="text-[10px] text-[#837D72] tracking-wider uppercase block font-mono">
                EDITORIAL CMS
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-[3px] text-xs font-display uppercase tracking-wider font-semibold transition-colors',
                    isActive
                      ? 'bg-[#FFE93B] text-black font-bold'
                      : 'text-[#ADABAB] hover:text-white hover:bg-[#141414]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.count && (
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded font-bold',
                        isActive ? 'bg-black text-[#FFE93B]' : 'bg-[#FFE93B] text-black'
                      )}
                    >
                      {link.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Quick Return & Logout */}
        <div className="pt-4 mt-6 md:mt-0 border-t border-[#2A2A2A] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 bg-[#141414] hover:bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] text-xs text-[#ADABAB] hover:text-white transition-colors"
          >
            <span className="font-display uppercase tracking-wider">Public Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#FFE93B]" />
          </Link>
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-between px-3 py-2 bg-[#141414] hover:bg-red-950/40 border border-[#2A2A2A] hover:border-red-800 rounded-[2px] text-xs text-[#ADABAB] hover:text-red-300 transition-colors"
            >
              <span className="font-display uppercase tracking-wider">Sign Out Admin</span>
              <LogOut className="w-3.5 h-3.5 text-[#FF3D00]" />
            </button>
          </form>
        </div>
      </aside>
    </>
  );
};

