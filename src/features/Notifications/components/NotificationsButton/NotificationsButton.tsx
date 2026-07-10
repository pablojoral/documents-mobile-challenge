import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Badge } from 'components/Badge/Badge';
import { Icon } from 'components/Icon/Icon';

import { NotificationsModal } from '../NotificationsModal/NotificationsModal';
import { useNotificationsButton } from './hooks/useNotificationsButton';
import { useNotificationsButtonStrings } from './hooks/useNotificationsButtonStrings';
import { useNotificationsButtonTheme } from './theme/useNotificationsButtonTheme';

/** Header trigger showing the unread-notifications badge; opens the notifications modal. */
export const NotificationsButton = () => {
  const { unreadCount, isOpen, open, close } = useNotificationsButton();
  const { accessibilityLabel } = useNotificationsButtonStrings();
  const { styles } = useNotificationsButtonTheme();

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}>
        <Icon name="bell" size="icon-size-md" color="font-primary" />
        <View style={styles.badge}>
          <Badge count={unreadCount} />
        </View>
      </TouchableOpacity>
      <NotificationsModal visible={isOpen} onClose={close} />
    </>
  );
};
