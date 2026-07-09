import React, { useCallback, useEffect } from 'react';
import type { ListRenderItemInfo } from 'react-native';

import {
  useNotificationsStore,
  type StoredNotification,
} from 'store/Notifications/useNotificationsStore';

import { NotificationCard } from '../../NotificationCard/NotificationCard';

/**
 * Notifications list, plus the mark-all-as-read-on-open effect: viewing the
 * modal clears the unread badge.
 */
export const useNotificationsModal = (visible: boolean) => {
  const notifications = useNotificationsStore(state => state.notifications);
  const markAllAsRead = useNotificationsStore(state => state.markAllAsRead);

  useEffect(() => {
    if (visible) {
      markAllAsRead();
    }
  }, [visible, notifications, markAllAsRead]);

  const keyExtractor = useCallback((item: StoredNotification) => item.id, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<StoredNotification>) => (
      <NotificationCard notification={item} />
    ),
    [],
  );

  return { notifications, keyExtractor, renderItem };
};
