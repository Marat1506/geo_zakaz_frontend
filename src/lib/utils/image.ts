export function getImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Normalize all relative file paths to backend absolute URL.
  // Some records are saved as `/uploads/...`, others as `uploads/...`.
  if (url.startsWith('/') || url.startsWith('uploads/')) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${backendUrl}${normalizedPath}`;
  }

  return url;
}
