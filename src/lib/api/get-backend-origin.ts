import { getApiBaseUrl } from '@/lib/api/get-api-base-url';

/** Origin for WebSocket / static backend (no /api suffix). */
export function getBackendOrigin(): string {
  const api = getApiBaseUrl();
  try {
    const u = new URL(api);
    return u.origin;
  } catch {
    return 'http://localhost:3000';
  }
}
