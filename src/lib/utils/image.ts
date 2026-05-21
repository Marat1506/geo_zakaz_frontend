import { getBackendOrigin } from '@/lib/api/get-backend-origin';

export function getImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('/') || url.startsWith('uploads/')) {
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    if (normalizedPath.includes('/seller-docs/')) {
      return undefined;
    }
    const backendUrl =
      typeof window !== 'undefined'
        ? getBackendOrigin()
        : process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
          'http://localhost:3000';
    return `${backendUrl}${normalizedPath}`;
  }

  return url;
}
