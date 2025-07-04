'use client'

import { QueryClient } from '@tanstack/react-query'

const queryClientConfig = {
  defaultOptions: {
    queries: {
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests
      retry: (failureCount: number, error: unknown) => {
        // Don't retry for 4xx errors
        const errorObj = error as { status?: number }
        if (
          errorObj?.status &&
          errorObj.status >= 400 &&
          errorObj.status < 500
        ) {
          return false
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      retryDelay: (attemptIndex: number) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus in production
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      // Don't refetch on reconnect to avoid unnecessary requests
      refetchOnReconnect: false,
      // Network mode
      networkMode: 'online' as const,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      retryDelay: 1000,
      networkMode: 'online' as const,
    },
  },
}

export const queryClient = new QueryClient(queryClientConfig)

// Query keys factory
export const queryKeys = {
  all: ['visualization'] as const,
  hotspots: () => [...queryKeys.all, 'hotspots'] as const,
  imageConfig: () => [...queryKeys.all, 'image-config'] as const,
  infrastructureDetails: () =>
    [...queryKeys.all, 'infrastructure-details'] as const,
  performance: () => [...queryKeys.all, 'performance'] as const,
}

// Prefetch utilities
export const prefetchQueries = async () => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.hotspots(),
    queryFn: () => fetch('/data/hotspots.json').then((res) => res.json()),
  })

  await queryClient.prefetchQuery({
    queryKey: queryKeys.imageConfig(),
    queryFn: () => fetch('/data/image-config.json').then((res) => res.json()),
  })

  await queryClient.prefetchQuery({
    queryKey: queryKeys.infrastructureDetails(),
    queryFn: () =>
      fetch('/data/infrastructure-details.json').then((res) => res.json()),
  })
}

// Clear all cached data
export const clearAllCache = () => {
  queryClient.clear()
}

// Invalidate specific data
export const invalidateData = {
  hotspots: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.hotspots() }),
  imageConfig: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.imageConfig() }),
  infrastructureDetails: () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.infrastructureDetails(),
    }),
  all: () => queryClient.invalidateQueries({ queryKey: queryKeys.all }),
}
