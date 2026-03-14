import { useAuthStore } from '@/lib/store/auth-store';

export function useAuthGuard(requiredRole?: 'customer' | 'admin') {
  const { isAuthenticated, user } = useAuthStore();
  return { isAuthenticated, user };
}
