import * as React from 'react';
import { getAdminSession, logoutAdminAction } from '@/server/actions/admin-auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LogOut } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // If unauthenticated (e.g. login page), render children without admin chrome
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white selection:bg-[#FFE93B] selection:text-black">
      <AdminSidebar adminUsername={session.username} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-[#2A2A2A] bg-[#0A0A0A] px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#837D72] font-display uppercase tracking-wider">
              Environment:
            </span>
            <Badge variant="outline" className="text-[10px]">
              DEVELOPMENT / STAGING
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#FFE93B] font-mono font-bold hidden sm:inline">
              {session.username}
            </span>
            <Badge variant="primary" className="text-[10px]">
              ADMIN
            </Badge>
            <form action={logoutAdminAction}>
              <Button size="sm" variant="ghost" type="submit" className="text-xs text-[#ADABAB] hover:text-white px-2.5 py-1 h-7 border border-[#2A2A2A] hover:border-[#FF3D00]">
                <LogOut className="w-3.5 h-3.5 mr-1 text-[#FF3D00]" />
                LOGOUT
              </Button>
            </form>
          </div>
        </header>

        {/* Admin Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
