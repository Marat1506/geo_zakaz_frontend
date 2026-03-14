export function getImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  
  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative path starting with /uploads, prepend backend URL
  if (url.startsWith('/uploads')) {
    // In browser, use window.location to determine backend URL
    if (typeof window !== 'undefined') {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
      return `${backendUrl}${url}`;
    }
    // On server, use env variable or default
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    return `${backendUrl}${url}`;
  }
  
  return url;
}
