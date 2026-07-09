import React, { memo } from 'react';
import { View } from 'react-native';

import { Text } from 'components/Text/Text';
import type { StoredNotification } from 'store/Notifications/useNotificationsStore';

import { useNotificationCard } from './hooks/useNotificationCard';
import { useNotificationCardTheme } from './theme/useNotificationCardTheme';

interface NotificationCardProps {
  notification: StoredNotification;
}

const NotificationCardComponent = ({ notification }: NotificationCardProps) => {
  const { message, dateLabel } = useNotificationCard(notification);
  const { styles } = useNotificationCardTheme();

  return (
    <View style={styles.container}>
      <Text size="font-size-sm">{message}</Text>
      <Text size="font-size-xs" color="font-secondary">
        {dateLabel}
      </Text>
    </View>
  );
};

/** A single notification row: who created what document, and when. */
export const NotificationCard = memo(NotificationCardComponent);
