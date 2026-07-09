import { useCallback, useState } from 'react';

import { useUnreadNotificationsCount } from 'store/Notifications/useNotificationsStore';

/** Owns the button's unread count and the modal's open/close state. */
export const useNotificationsButton = () => {
  const unreadCount = useUnreadNotificationsCount();
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { unreadCount, isOpen, open, close };
};
