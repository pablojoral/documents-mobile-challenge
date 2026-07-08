import { useCallback, useMemo } from 'react';

import type { DocumentViewMode } from '../../../types';
import { useViewModeToggleStrings } from './useViewModeToggleStrings';

interface ViewModeOption {
  mode: DocumentViewMode;
  label: string;
}

export const useViewModeToggle = (
  onChange: (mode: DocumentViewMode) => void,
) => {
  const strings = useViewModeToggleStrings();

  const options = useMemo<ViewModeOption[]>(
    () => [
      { mode: 'list', label: strings.list },
      { mode: 'grid', label: strings.grid },
    ],
    [strings],
  );

  const handleSelect = useCallback(
    (mode: DocumentViewMode) => onChange(mode),
    [onChange],
  );

  return { options, handleSelect };
};
