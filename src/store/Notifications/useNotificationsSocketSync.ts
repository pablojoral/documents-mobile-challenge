import { useEffect } from 'react';

import { notificationsSocket } from 'services/ws/notificationsSocket';

import { useNotificationsStore } from './useNotificationsStore';

/**
 * Connects the notifications WebSocket and forwards every message into the
 * notifications store. Mount once, near the app root.
 */
export const useNotificationsSocketSync = (): void => {
  const addNotification = useNotificationsStore(state => state.addNotification);

  useEffect(() => {
    notificationsSocket.connect();
    const unsubscribe = notificationsSocket.onMessage(addNotification);
    return () => {
      unsubscribe();
    };
  }, [addNotification]);
};
