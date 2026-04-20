const DEFAULT_SERVER_API = 'http://localhost:3000/api';

/**
 * Resolves the JSON API base URL (Nest global prefix `/api`).
 * - With no env in the browser: same-origin `/api` (use Next rewrites to the backend).
 * - With no env on the server: `http://localhost:3000/api`.
 * - If env points at the Next dev port without `/api`, use the default backend URL.
 * - If env is an origin without `/api`, append `/api`.
 */
export function getApiBaseUrl(): string {
  const raw = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL?.trim() : undefined;
  if (raw) {
    try {
      const u = new URL(raw);
      const port = u.port || (u.protocol === 'https:' ? '443' : '80');
      const path = u.pathname.replace(/\/$/, '') || '';
      const isTypicalNextDev =
        (u.hostname === 'localhost' || u.hostname === '127.0.0.1') && port === '3001' && !path.endsWith('/api');
      if (isTypicalNextDev) {
        return DEFAULT_SERVER_API;
      }
    } catch {
      /* ignore invalid URL */
    }
    const trimmed = raw.replace(/\/$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return DEFAULT_SERVER_API;
}
