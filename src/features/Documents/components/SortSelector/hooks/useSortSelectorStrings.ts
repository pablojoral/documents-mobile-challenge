import type { DocumentSort } from '../../../types';

/** Labels for the sort selector trigger and modal options. */
export const useSortSelectorStrings = () => {
  const options: Record<DocumentSort, string> = {
    'title-asc': 'Title (A–Z)',
    'created-desc': 'Newest first',
    'created-asc': 'Oldest first',
  };

  return {
    title: 'Sort by',
    options,
    checkMark: '✓',
    caret: '▾',
  };
};
