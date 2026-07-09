import type { StoredNotification } from 'store/Notifications/useNotificationsStore';
import { formatRelativeDate } from 'utils/formatRelativeDate';

import { useNotificationCardStrings } from './useNotificationCardStrings';

/** Derives the display fields shown by a notification row. */
export const useNotificationCard = (notification: StoredNotification) => {
  const strings = useNotificationCardStrings();

  return {
    message: strings.created(notification.UserName, notification.DocumentTitle),
    dateLabel: formatRelativeDate(notification.Timestamp),
  };
};
