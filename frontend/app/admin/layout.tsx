'use client';

import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/components/admin/auth-guard';
import { AdminLayoutNew } from '@/components/admin/admin-layout-new';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  if (pathname === '/admin/login') {
    return children;
  }

  return (
    <AuthGuard>
      <AdminLayoutNew>{children}</AdminLayoutNew>
    </AuthGuard>
  );
}