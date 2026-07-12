import { QueryClient } from '@tanstack/react-query';

import { qk } from './keys';

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

// Documents queries back the persisted, offline-readable cache
// (`persister.ts`) — a query has to still be in memory to be included in the
// next persist write, so the default `gcTime` would silently evict an
// inactive sort variant (and, on the next unrelated persist write, its
// offline copy too) after 5 minutes unviewed. Pinning it to `Infinity`
// removes that timer instead of just extending it.
queryClient.setQueryDefaults(qk.documents.root, { gcTime: Infinity });
