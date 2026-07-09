import React from 'react';
import { View } from 'react-native';

import { Text } from 'components/Text/Text';

import { useBadgeTheme } from './theme/useBadgeTheme';

interface BadgeProps {
  count: number;
  max?: number;
}

/**
 * A small count pill, e.g. for an unread-notifications indicator. Renders
 * nothing when `count` is zero or negative.
 */
export const Badge = ({ count, max = 99 }: BadgeProps) => {
  const { styles } = useBadgeTheme();

  if (count <= 0) {
    return null;
  }

  const label = count > max ? `${max}+` : String(count);

  return (
    <View style={styles.container}>
      <Text size="font-size-xs" weight="font-weight-semibold" color="font-on-brand">
        {label}
      </Text>
    </View>
  );
};
