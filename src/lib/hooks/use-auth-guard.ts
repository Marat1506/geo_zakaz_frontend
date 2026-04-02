import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

type UserRole = 'customer' | 'admin' | 'superadmin' | 'seller';

export function useAuthGuard(requiredRole?: UserRole) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }
    if (requiredRole && user.role !== requiredRole) {
      router.replace('/');
    }
  }, [isAuthenticated, user, requiredRole, router]);

  return { isAuthenticated, user };
}
