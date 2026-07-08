import type { Document } from 'models/models';

import type { DocumentSort } from '../types';

/**
 * Returns a new array of documents ordered by `sort`. Pure — does not mutate the
 * input. Sorting happens client-side because the server returns unordered data.
 */
export const sortDocuments = (
  documents: Document[],
  sort: DocumentSort,
): Document[] => {
  const sorted = [...documents];

  switch (sort) {
    case 'title-asc':
      return sorted.sort((a, b) => a.Title.localeCompare(b.Title));
    case 'created-desc':
      return sorted.sort(
        (a, b) => Date.parse(b.CreatedAt) - Date.parse(a.CreatedAt),
      );
    case 'created-asc':
      return sorted.sort(
        (a, b) => Date.parse(a.CreatedAt) - Date.parse(b.CreatedAt),
      );
  }
};
