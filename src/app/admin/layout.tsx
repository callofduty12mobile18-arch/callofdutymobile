import * as React from 'react';
import { getAdminSession } from '@/server/actions/admin-auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Badge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // If unauthenticated (e.g. login page), render children without public footer
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white selection:bg-[#FFE93B] selection:text-black">
        <main className="flex-1 w-full flex flex-col">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white selection:bg-[#FFE93B] selection:text-black">
      <AdminSidebar adminUsername={session.username} />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="h-14 border-b border-[#2A2A2A] bg-[#0A0A0A] px-4 sm:px-6 flex items-center justify-end flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#FFE93B] font-mono font-bold hidden sm:inline">
              {session.username}
            </span>
            <Badge variant="primary" className="text-[10px]">
              ADMIN
            </Badge>
          </div>
        </header>

        {/* Admin Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col">
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
