'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, useEffect } from 'react';
import { ToastProvider } from '@/components/ui/toast';
import { useAuthStore } from '@/lib/store/auth-store';
import { useCartStore } from '@/lib/store/cart-store';
import { useGeoStore } from '@/lib/store/geo-store';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            refetchOnMount: false,
          },
          mutations: {
            retry: 1,
            retryDelay: 1000,
          },
        },
      }),
  );

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
    useGeoStore.persist.rehydrate();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}
