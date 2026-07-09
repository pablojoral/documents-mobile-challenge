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

  it('marks the given notifications as read by id', () => {
    act(() => {
      useNotificationsStore.getState().addNotification(makeNotification({ DocumentTitle: 'Alpha' }));
      useNotificationsStore.getState().addNotification(makeNotification({ DocumentTitle: 'Beta' }));
    });
    const [beta, alpha] = useNotificationsStore.getState().notifications;

    act(() => {
      useNotificationsStore.getState().markAsRead([alpha.id]);
    });

    const notifications = useNotificationsStore.getState().notifications;
    expect(notifications.find(n => n.id === alpha.id)?.read).toBe(true);
    expect(notifications.find(n => n.id === beta.id)?.read).toBe(false);
  });

  it('preserves referential identity of untouched notifications', () => {
    act(() => {
      useNotificationsStore.getState().addNotification(makeNotification());
      useNotificationsStore.getState().addNotification(makeNotification());
    });
    const [target, untouched] = useNotificationsStore.getState().notifications;

    act(() => {
      useNotificationsStore.getState().markAsRead([target.id]);
    });

    expect(
      useNotificationsStore.getState().notifications.find(n => n.id === untouched.id),
    ).toBe(untouched);
  });

  it('is a no-op when the given ids are already read or unknown', () => {
    act(() => {
      useNotificationsStore.getState().addNotification(makeNotification());
      useNotificationsStore.getState().markAsRead(['unknown-id']);
    });
    const state = useNotificationsStore.getState().notifications;

    act(() => {
      useNotificationsStore.getState().markAsRead(['unknown-id']);
    });

    expect(useNotificationsStore.getState().notifications).toBe(state);
  });

  it('is a no-op for an empty id list', () => {
    act(() => {
      useNotificationsStore.getState().addNotification(makeNotification());
    });
    const state = useNotificationsStore.getState().notifications;

    act(() => {
      useNotificationsStore.getState().markAsRead([]);
    });

    expect(useNotificationsStore.getState().notifications).toBe(state);
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
      const ids = useNotificationsStore.getState().notifications.map(n => n.id);
      useNotificationsStore.getState().markAsRead(ids);
    });
    expect(result.current).toBe(0);
  });
});
