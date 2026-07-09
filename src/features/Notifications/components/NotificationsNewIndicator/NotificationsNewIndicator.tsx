import React from 'react';
import { TouchableOpacity } from 'react-native';

import { Text } from 'components/Text/Text';

import { useNotificationsNewIndicatorStrings } from './hooks/useNotificationsNewIndicatorStrings';
import { useNotificationsNewIndicatorTheme } from './theme/useNotificationsNewIndicatorTheme';

interface NotificationsNewIndicatorProps {
  count: number;
  onPress: () => void;
}

/**
 * Floating pill shown over the notifications list while unread notifications
 * remain; tapping it scrolls the list to the top. Renders nothing when
 * `count` is zero or negative.
 */
export const NotificationsNewIndicator = ({ count, onPress }: NotificationsNewIndicatorProps) => {
  const { title } = useNotificationsNewIndicatorStrings();
  const { styles } = useNotificationsNewIndicatorTheme();

  if (count <= 0) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} accessibilityRole="button">
      <Text size="font-size-xs" weight="font-weight-semibold" color="font-on-brand">
        {title}
      </Text>
    </TouchableOpacity>
  );
};
