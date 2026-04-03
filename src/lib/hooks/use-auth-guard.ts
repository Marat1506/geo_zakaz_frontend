import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

type UserRole = 'customer' | 'admin' | 'superadmin' | 'seller';

function hasAccess(userRole: string, requiredRole: UserRole): boolean {
  if (requiredRole === 'admin') {
    return userRole === 'admin' || userRole === 'superadmin';
  }
  return userRole === requiredRole;
}

function getDefaultRoute(role: string): string {
  if (role === 'admin' || role === 'superadmin') return '/admin/dashboard';
  if (role === 'seller') return '/seller/dashboard';
  return '/menu';
}

export function useAuthGuard(requiredRole?: UserRole) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }
    if (requiredRole && !hasAccess(user.role, requiredRole)) {
      router.replace(getDefaultRoute(user.role));
    }
  }, [mounted, isAuthenticated, user, requiredRole, router]);

  return { isAuthenticated: mounted && isAuthenticated, user: mounted ? user : null };
}
