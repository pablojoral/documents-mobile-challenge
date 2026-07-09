import React, { useCallback, useRef } from 'react';
import type { FlatList, ListRenderItemInfo, ViewToken } from 'react-native';

import {
  useNotificationsStore,
  useUnreadNotificationsCount,
  type StoredNotification,
} from 'store/Notifications/useNotificationsStore';

import { NotificationCard } from '../../NotificationCard/NotificationCard';

/**
 * Must stay referentially/deep-equal stable across renders — FlatList throws
 * a dev invariant if viewabilityConfig changes identity between renders, so
 * it lives at module scope rather than being created inside the hook body.
 */
const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 75,
  minimumViewTime: 300,
} as const;

/**
 * Notifications list, plus visibility-driven read state: a notification is
 * marked read once it has actually been on screen, not merely because the
 * modal is open (new arrivals can sit off-screen above a scrolled reader).
 */
export const useNotificationsModal = (visible: boolean) => {
  const notifications = useNotificationsStore(state => state.notifications);
  const markAsRead = useNotificationsStore(state => state.markAsRead);
  const unreadCount = useUnreadNotificationsCount();
  const listRef = useRef<FlatList<StoredNotification>>(null);

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const keyExtractor = useCallback((item: StoredNotification) => item.id, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<StoredNotification>) => (
      <NotificationCard notification={item} />
    ),
    [],
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<StoredNotification>[] }) => {
      if (!visible) {
        return;
      }
      const ids = viewableItems.filter(token => token.isViewable).map(token => token.item.id);
      if (ids.length > 0) {
        markAsRead(ids);
      }
    },
    [visible, markAsRead],
  );

  return {
    notifications,
    unreadCount,
    listRef,
    scrollToTop,
    keyExtractor,
    renderItem,
    onViewableItemsChanged,
    viewabilityConfig: VIEWABILITY_CONFIG,
  };
};
