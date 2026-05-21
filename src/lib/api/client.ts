import { HttpError } from '@/lib/api/http-error';
import { getApiBaseUrl } from '@/lib/api/get-api-base-url';
import { handleSessionExpired } from '@/lib/api/session-expired';

const REQUEST_TIMEOUT_MS = 15_000;

let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

export function getAccessToken(): string | null {
  return memoryAccessToken;
}

export function getRefreshToken(): string | null {
  return memoryRefreshToken;
}

export function setTokens(accessToken: string, refreshToken: string): void {
  memoryAccessToken = accessToken;
  memoryRefreshToken = refreshToken;
}

export function clearTokens(): void {
  memoryAccessToken = null;
  memoryRefreshToken = null;
}

function joinApiUrl(path: string): string {
  const base = getApiBaseUrl().replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

function timeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }
  const c = new AbortController();
  setTimeout(() => c.abort(new DOMException('Timeout', 'AbortError')), ms);
  return c.signal;
}

async function parseJsonBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

/** Paths where 401 means invalid credentials — do not try refresh. */
function shouldAttemptRefresh(path: string): boolean {
  const p = path.split('?')[0];
  return (
    !p.includes('/auth/login') &&
    !p.includes('/auth/face/login') &&
    !p.includes('/auth/refresh')
  );
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  try {
    const url = joinApiUrl('/auth/refresh');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      signal: timeoutSignal(REQUEST_TIMEOUT_MS),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function refreshSessionDeduped(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = refreshSession().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

function buildHeaders(body: unknown): Headers {
  const headers = new Headers();
  if (!(body instanceof FormData)) {
    if (body !== undefined && body !== null) {
      headers.set('Content-Type', 'application/json');
    }
  }
  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  if (body instanceof FormData) return body;
  return JSON.stringify(body);
}

async function requestJson<T>(
  method: string,
  path: string,
  body?: unknown,
  hasRetriedAfterRefresh = false,
): Promise<T> {
  const url = joinApiUrl(path);
  const headers = buildHeaders(body);
  const fetchBody = serializeBody(body);

  const res = await fetch(url, {
    method,
    headers,
    body: fetchBody,
    credentials: 'include',
    signal: timeoutSignal(REQUEST_TIMEOUT_MS),
  });

  if (
    res.status === 401 &&
    !hasRetriedAfterRefresh &&
    shouldAttemptRefresh(path)
  ) {
    const refreshed = await refreshSessionDeduped();
    if (refreshed) {
      return requestJson<T>(method, path, body, true);
    }
    await handleSessionExpired();
    const errData = await parseJsonBody(res);
    throw new HttpError(res.status, errData);
  }

  if (!res.ok) {
    const errData = await parseJsonBody(res);
    throw new HttpError(res.status, errData);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const ct = res.headers.get('content-type');
  if (!ct?.includes('application/json')) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

/**
 * Fetch-based HTTP client (cookies + optional Bearer + refresh on 401).
 */
export const apiClient = {
  get: async <T>(url: string) => ({
    data: await requestJson<T>('GET', url),
  }),

  post: async <T>(url: string, body?: unknown) => ({
    data: await requestJson<T>('POST', url, body),
  }),

  patch: async <T>(url: string, body?: unknown) => ({
    data: await requestJson<T>('PATCH', url, body),
  }),

  delete: async <T>(url: string, config?: { data?: unknown }) => ({
    data: await requestJson<T>('DELETE', url, config?.data),
  }),
};

export { HttpError } from './http-error';
