'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MenuPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page where the map and zone-based menu are located
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      <div className="animate-pulse text-orange-600 font-bold">Loading menu...</div>
    </div>
  );
}
