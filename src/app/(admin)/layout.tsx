'use client';

import { useAuthGuard } from '@/lib/hooks/use-auth-guard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuthGuard('admin');

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <main className="flex-1 p-4 lg:p-8 lg:ml-0">{children}</main>
    </div>
  );
}
