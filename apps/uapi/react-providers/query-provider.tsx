"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

// Configure React Query client with optimal defaults
const queryClientOptions = {
  defaultOptions: {
    queries: {
      // Keep data fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry once on failure
      retry: 1,
      // Refetch on window focus
      refetchOnWindowFocus: true,
      // Use suspense for instant rendering with cached data
      suspense: false, // We'll enable per-query where needed
    },
  },
};

export function QueryProvider({ children }: { children: ReactNode }) {
  // Create a new QueryClient instance for each request in SSR
  const [queryClient] = useState(() => new QueryClient(queryClientOptions));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}