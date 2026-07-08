import { QueryClient } from '@tanstack/react-query';

/**
 * The single shared QueryClient.
 *
 * Defines global defaults. Per-query `staleTime` overrides belong in the
 * individual query hooks, not here (see api rules §8).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
