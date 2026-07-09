import { act, renderHook } from '@testing-library/react-native';

import { makeNotification } from 'test/fixtures';
import { useNotificationsStore, useUnreadNotificationsCount } from './useNotificationsStore';

const initialState = useNotificationsStore.getState();

describe('useNotificationsStore', () => {
  beforeEach(() => {
    useNotificationsStore.setState(initialState, true);
  });

  it('adds a notification as unread, newest first', () => {
    const a = makeNotification({ DocumentTitle: 'Alpha' });
    const b = makeNotification({ DocumentTitle: 'Beta' });

    act(() => {
      useNotificationsStore.getState().addNotification(a);
      useNotificationsStore.getState().addNotification(b);
    });

    const { notifications } = useNotificationsStore.getState();
    expect(notifications.map(n => n.DocumentTitle)).toEqual(['Beta', 'Alpha']);
    expect(notifications.every(n => n.read === false)).toBe(true);
  });

  it('dedups by DocumentID + Timestamp', () => {
    const notification = makeNotification();

    act(() => {
      useNotificationsStore.getState().addNotification(notification);
      useNotificationsStore.getState().addNotification(notification);
    });

    expect(useNotificationsStore.getState().notifications).toHaveLength(1);
  });

  it('marks all notifications as read', () => {
    act(() => {
      useNotificationsStore.getState().addNotification(makeNotification());
      useNotificationsStore.getState().addNotification(makeNotification());
      useNotificationsStore.getState().markAllAsRead();
    });

    expect(
      useNotificationsStore.getState().notifications.every(n => n.read),
    ).toBe(true);
  });

  it('is a no-op to mark as read when nothing is unread', () => {
    act(() => {
      useNotificationsStore.getState().addNotification(makeNotification());
      useNotificationsStore.getState().markAllAsRead();
    });
    const readState = useNotificationsStore.getState().notifications;

    act(() => {
      useNotificationsStore.getState().markAllAsRead();
    });

    expect(useNotificationsStore.getState().notifications).toBe(readState);
  });

  it('clears all notifications', () => {
    act(() => {
      useNotificationsStore.getState().addNotification(makeNotification());
      useNotificationsStore.getState().clear();
    });

    expect(useNotificationsStore.getState().notifications).toEqual([]);
  });

  it('derives the unread count via the selector', () => {
    const { result } = renderHook(() => useUnreadNotificationsCount());
    expect(result.current).toBe(0);

    act(() => {
      useNotificationsStore.getState().addNotification(makeNotification());
      useNotificationsStore.getState().addNotification(makeNotification());
    });
    expect(result.current).toBe(2);

    act(() => {
      useNotificationsStore.getState().markAllAsRead();
    });
    expect(result.current).toBe(0);
  });
});
