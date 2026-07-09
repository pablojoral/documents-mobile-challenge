import { create } from 'zustand';

import type { NewDocumentNotification } from 'models/models';

export interface StoredNotification extends NewDocumentNotification {
  /** Composite `DocumentID:Timestamp` id — stable React key and dedup key. */
  id: string;
  read: boolean;
}

interface NotificationsState {
  /** Newest first. */
  notifications: StoredNotification[];
  addNotification: (notification: NewDocumentNotification) => void;
  markAsRead: (ids: string[]) => void;
  clear: () => void;
}

const toId = (notification: NewDocumentNotification) =>
  `${notification.DocumentID}:${notification.Timestamp}`;

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],

  addNotification: notification => {
    const id = toId(notification);
    if (get().notifications.some(n => n.id === id)) {
      return;
    }
    set(state => ({
      notifications: [{ ...notification, id, read: false }, ...state.notifications],
    }));
  },

  markAsRead: ids => {
    if (ids.length === 0) {
      return;
    }
    const idSet = new Set(ids);
    let changed = false;
    const notifications = get().notifications.map(n => {
      if (n.read || !idSet.has(n.id)) {
        return n;
      }
      changed = true;
      return { ...n, read: true };
    });
    if (!changed) {
      return;
    }
    set({ notifications });
  },

  clear: () => set({ notifications: [] }),
}));

/** Count of unread notifications, derived from the notifications list. */
export const useUnreadNotificationsCount = () =>
  useNotificationsStore(state => state.notifications.filter(n => !n.read).length);
