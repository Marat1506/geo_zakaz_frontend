import { clearTokens } from '@/lib/api/client';
import { clearServerSession } from '@/lib/api/clear-server-session';
import { useAuthStore } from '@/lib/store/auth-store';

export async function handleSessionExpired(): Promise<void> {
  clearTokens();
  await clearServerSession();
  useAuthStore.getState().clearAuth();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
