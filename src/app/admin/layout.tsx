import * as React from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Badge } from '@/components/ui/Badge';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white selection:bg-[#FFE93B] selection:text-black">
      <AdminSidebar />
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
            <span className="text-xs text-[#ADABAB] font-mono hidden sm:inline">admin@callofdutymobile.in</span>
            <Badge variant="primary" className="text-[10px]">
              ADMIN
            </Badge>
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

