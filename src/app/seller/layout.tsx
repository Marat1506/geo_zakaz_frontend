'use client';

import { useAuthGuard } from '@/lib/hooks/use-auth-guard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SellerSidebar } from '@/components/layout/seller-sidebar';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuthGuard('seller');

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50/30">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50/30">
      <SellerSidebar />
      <main className="flex-1 min-w-0 px-3 pt-16 pb-4 sm:px-4 lg:px-6 lg:pt-6 lg:pb-6">
        <div className="w-full max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
