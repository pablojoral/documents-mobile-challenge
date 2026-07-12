import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FlatList, ListRenderItemInfo, ViewToken } from 'react-native';

import {
  useNotificationsStore,
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
  const listRef = useRef<FlatList<StoredNotification>>(null);

  /**
   * Snapshot of ids present the moment the modal opens. The "new
   * notifications" pill must only count arrivals from this point forward,
   * not unread notifications that were already sitting in the store before
   * the user opened the modal. Reset to null on close so the next open
   * captures a fresh baseline. Kept in state (not a ref) so capturing it
   * triggers the recompute below — a ref mutation wouldn't.
   */
  const [baselineIds, setBaselineIds] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!visible) {
      setBaselineIds(null);
      return;
    }
    setBaselineIds(
      prev => prev ?? new Set(useNotificationsStore.getState().notifications.map(n => n.id)),
    );
  }, [visible]);

  const newNotificationsCount = useMemo(() => {
    if (!baselineIds) {
      return 0;
    }
    return notifications.filter(n => !n.read && !baselineIds.has(n.id)).length;
  }, [notifications, baselineIds]);

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
    newNotificationsCount,
    listRef,
    scrollToTop,
    keyExtractor,
    renderItem,
    onViewableItemsChanged,
    viewabilityConfig: VIEWABILITY_CONFIG,
  };
};
