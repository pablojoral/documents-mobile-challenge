import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Icon } from 'components/Icon/Icon';

import type { DocumentViewMode } from '../../types';
import { useViewModeToggle } from './hooks/useViewModeToggle';
import { useViewModeToggleTheme } from './theme/useViewModeToggleTheme';

interface ViewModeToggleProps {
  value: DocumentViewMode;
  onChange: (mode: DocumentViewMode) => void;
}

/** A two-segment control switching the documents list between list and grid. */
export const ViewModeToggle = ({ value, onChange }: ViewModeToggleProps) => {
  const { options, handleSelect } = useViewModeToggle(onChange);
  const { styles } = useViewModeToggleTheme();

  return (
    <View style={styles.container}>
      {options.map(option => {
        const active = option.mode === value;
        return (
          <TouchableOpacity
            key={option.mode}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => handleSelect(option.mode)}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: active }}>
            <Icon
              name={option.icon}
              size="icon-size-sm"
              color={active ? 'font-on-brand' : 'font-secondary'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
