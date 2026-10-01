import * as React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/server/actions/admin-auth';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Administrator Login | MOBILEROSTER',
  description: 'Authorized administrative personnel access portal.',
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session && session.role === 'ADMIN') {
    redirect('/admin/dashboard');
  }

  return <AdminLoginForm />;
}
