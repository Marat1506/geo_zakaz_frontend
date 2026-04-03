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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      <AdminSidebar />
      <main className="flex-1 w-0 min-w-0 p-4 pt-14 pl-4 lg:pt-6 lg:pl-6 lg:p-6">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
