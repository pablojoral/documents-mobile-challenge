import { useCallback, useMemo } from 'react';

import type { IconName } from 'components/Icon/icons';

import type { DocumentViewMode } from '../../../types';
import { useViewModeToggleStrings } from './useViewModeToggleStrings';

interface ViewModeOption {
  mode: DocumentViewMode;
  label: string;
  icon: IconName;
}

export const useViewModeToggle = (
  onChange: (mode: DocumentViewMode) => void,
) => {
  const strings = useViewModeToggleStrings();

  const options = useMemo<ViewModeOption[]>(
    () => [
      { mode: 'list', label: strings.list, icon: 'list' },
      { mode: 'grid', label: strings.grid, icon: 'grid' },
    ],
    [strings],
  );

  const handleSelect = useCallback(
    (mode: DocumentViewMode) => onChange(mode),
    [onChange],
  );

  return { options, handleSelect };
};
