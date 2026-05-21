import { authApi } from '@/lib/api/endpoints/auth';

import { clearServerSession } from '@/lib/api/clear-server-session';

import { HttpError } from '@/lib/api/http-error';

import { useAuthStore } from '@/lib/store/auth-store';



/** Restore user from JWT cookies (no localStorage). */

export async function bootstrapAuthFromCookies(): Promise<void> {

  const { setAuthReady, setSession, clearAuth } = useAuthStore.getState();

  setAuthReady(false);



  if (typeof window !== 'undefined') {

    localStorage.removeItem('auth-storage');

  }



  try {

    const user = await authApi.getCurrentUser();

    setSession(user);

  } catch (err) {

    clearAuth();

    if (
      err instanceof HttpError &&
      (err.response.status === 401 || err.response.status === 403)
    ) {

      await clearServerSession();

    }

  }

}


