import { HttpError } from '@/lib/api/http-error';

/**
 * Human-readable message from API / network errors (no stack traces in UI).
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpError) {
    const data = error.response.data as { message?: string | string[] } | string | undefined;
    if (typeof data === 'string' && data.trim()) return data;
    if (data && typeof data === 'object') {
      const m = data.message;
      if (typeof m === 'string') return m;
      if (Array.isArray(m)) return m.join(' ');
    }
    return fallback;
  }

  if (typeof error !== 'object' || error === null) {
    return fallback;
  }

  const err = error as { response?: { data?: unknown }; message?: string; code?: string };

  if (!err.response && err.message) {
    const msg = err.message;
    if (msg === 'Network Error' || msg === 'Failed to fetch') {
      return 'Cannot reach the server. Check your connection and API URL (NEXT_PUBLIC_API_URL).';
    }
    if (err.code === 'ECONNABORTED' || msg.includes('aborted')) {
      return 'Request timed out. Try again.';
    }
    return msg || fallback;
  }

  const data = err.response?.data as { message?: string | string[] } | string | undefined;
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    const m = data.message;
    if (typeof m === 'string') return m;
    if (Array.isArray(m)) return m.join(' ');
  }
  return fallback;
}
