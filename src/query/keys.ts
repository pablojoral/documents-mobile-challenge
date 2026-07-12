import type { DocumentSort } from 'services/api/services/DocumentsService';

/**
 * Query key registry.
 *
 * Every query and mutation key comes from `qk` — never hardcode key arrays
 * inline. Each resource has a `root` (plain array, used for broad invalidation)
 * and named factory functions for each operation. Parameterized keys put their
 * params last, and every array is `as const`.
 *
 * Add a block per resource as it is introduced, e.g.:
 *
 *   history: {
 *     root:  ['history'] as const,
 *     list:  () => ['history', 'list'] as const,
 *     stats: () => ['history', 'stats'] as const,
 *   },
 */
export const qk = {
  documents: {
    root: ['documents'] as const,
    list: (sort: DocumentSort) => ['documents', 'list', sort] as const,
  },
} as const;

export type QueryKeys = typeof qk;
