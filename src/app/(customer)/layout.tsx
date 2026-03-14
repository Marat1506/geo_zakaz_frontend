'use client';

import { useAuthGuard } from '@/lib/hooks/use-auth-guard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from 'next/link';
import { User, Package, LogOut } from 'lucide-react';
import { useLogout } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuthGuard('customer');
  const logoutMutation = useLogout();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Customer Navigation Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/menu" className="text-xl font-bold text-orange-600">
                FoodOrder
              </Link>
              <nav className="hidden md:flex items-center gap-4">
                <Link
                  href="/menu"
                  className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  Menu
                </Link>
                <Link
                  href="/orders"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  <Package className="h-4 w-4" />
                  My Orders
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                {user.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
