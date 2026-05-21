import { getApiBaseUrl } from '@/lib/api/get-api-base-url';

/** Clear httpOnly auth cookies on the API host (no redirect). */
export async function clearServerSession(): Promise<void> {
  try {
    await fetch(`${getApiBaseUrl()}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    /* ignore */
  }
}
