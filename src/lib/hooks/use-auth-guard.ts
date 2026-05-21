import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { loginRedirectParam } from '@/lib/auth/post-login-redirect';

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
  return '/';
}

export function useAuthGuard(requiredRole?: UserRole) {
  const { isAuthenticated, user, authReady } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !authReady) return;
    if (!isAuthenticated || !user) {
      const redirect = loginRedirectParam(
        typeof window !== 'undefined' ? window.location.pathname : '/',
      );
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }
    if (requiredRole && !hasAccess(user.role, requiredRole)) {
      router.replace(getDefaultRoute(user.role));
    }
  }, [mounted, authReady, isAuthenticated, user, requiredRole, router]);

  return {
    isAuthenticated: mounted && authReady && isAuthenticated,
    user: mounted && authReady ? user : null,
  };
}
