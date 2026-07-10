import { useCallback, useMemo, useState } from 'react';

import type { DocumentSort } from '../../../types';
import { useSortSelectorStrings } from './useSortSelectorStrings';

interface SortOption {
  sort: DocumentSort;
  label: string;
}

const SORT_ORDER: DocumentSort[] = ['title-asc', 'created-desc', 'created-asc'];

export const useSortSelector = (
  value: DocumentSort,
  onChange: (sort: DocumentSort) => void,
) => {
  const strings = useSortSelectorStrings();
  const [isOpen, setIsOpen] = useState(false);

  const options = useMemo<SortOption[]>(
    () => SORT_ORDER.map(sort => ({ sort, label: strings.options[sort] })),
    [strings],
  );

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleSelect = useCallback(
    (sort: DocumentSort) => {
      onChange(sort);
      setIsOpen(false);
    },
    [onChange],
  );

  return {
    isOpen,
    options,
    currentLabel: strings.options[value],
    title: strings.title,
    open,
    close,
    handleSelect,
  };
};
