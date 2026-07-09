import React from 'react';
import { View } from 'react-native';

import { Text } from 'components/Text/Text';

import { useNotificationsEmptyStateStrings } from './hooks/useNotificationsEmptyStateStrings';
import { useNotificationsEmptyStateTheme } from './theme/useNotificationsEmptyStateTheme';

/** Shown when the notifications list has loaded but is empty. */
export const NotificationsEmptyState = () => {
  const { title, subtitle } = useNotificationsEmptyStateStrings();
  const { styles } = useNotificationsEmptyStateTheme();

  return (
    <View style={styles.container}>
      <Text size="font-size-lg" weight="font-weight-semibold">
        {title}
      </Text>
      <Text color="font-secondary" align="center">
        {subtitle}
      </Text>
    </View>
  );
};
