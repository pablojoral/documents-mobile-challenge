import { act, renderHook } from '@testing-library/react-native';

import { makeNotification } from 'test/fixtures';
import { useNotificationsStore } from 'store/Notifications/useNotificationsStore';

import { useNotificationsModal } from './useNotificationsModal';

const initialState = useNotificationsStore.getState();

describe('useNotificationsModal', () => {
  beforeEach(() => {
    useNotificationsStore.setState(initialState, true);
  });

  it('marks currently-viewable unread notifications as read', () => {
    act(() => {
      useNotificationsStore.getState().addNotification(makeNotification());
    });
    const notification = useNotificationsStore.getState().notifications[0];
    const { result } = renderHook(() => useNotificationsModal(true));

    act(() => {
      result.current.onViewableItemsChanged({
        viewableItems: [{ item: notification, key: notification.id, index: 0, isViewable: true }],
      });
    });

    expect(useNotificationsStore.getState().notifications[0].read).toBe(true);
  });

  it('ignores non-viewable entries', () => {
    act(() => {
      useNotificationsStore.getState().addNotification(makeNotification());
    });
    const notification = useNotificationsStore.getState().notifications[0];
    const { result } = renderHook(() => useNotificationsModal(true));

    act(() => {
      result.current.onViewableItemsChanged({
        viewableItems: [{ item: notification, key: notification.id, index: 0, isViewable: false }],
      });
    });

    expect(useNotificationsStore.getState().notifications[0].read).toBe(false);
  });

  it('does not mark as read while the modal is not visible', () => {
    act(() => {
      useNotificationsStore.getState().addNotification(makeNotification());
    });
    const notification = useNotificationsStore.getState().notifications[0];
    const { result } = renderHook(() => useNotificationsModal(false));

    act(() => {
      result.current.onViewableItemsChanged({
        viewableItems: [{ item: notification, key: notification.id, index: 0, isViewable: true }],
      });
    });

    expect(useNotificationsStore.getState().notifications[0].read).toBe(false);
  });

  it('keeps a referentially stable viewabilityConfig across renders', () => {
    const { result, rerender } = renderHook(
      ({ visible }: { visible: boolean }) => useNotificationsModal(visible),
      { initialProps: { visible: true } },
    );
    const first = result.current.viewabilityConfig;

    rerender({ visible: false });

    expect(result.current.viewabilityConfig).toBe(first);
  });
});
