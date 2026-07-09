import React from 'react';
import { FlatList } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import { makeNotification } from 'test/fixtures';
import { useNotificationsStore } from 'store/Notifications/useNotificationsStore';

import { NotificationsModal } from './NotificationsModal';

const initialState = useNotificationsStore.getState();

describe('NotificationsModal', () => {
  beforeEach(() => {
    useNotificationsStore.setState(initialState, true);
  });

  it('shows the empty state when there are no notifications', () => {
    const { getByText } = render(<NotificationsModal visible onClose={jest.fn()} />);
    expect(getByText('No notifications yet')).toBeTruthy();
  });

  it('renders a row per notification', () => {
    act(() => {
      useNotificationsStore
        .getState()
        .addNotification(makeNotification({ DocumentTitle: 'Alpha' }));
    });

    const { getByText } = render(<NotificationsModal visible onClose={jest.fn()} />);
    expect(getByText(/Alpha/)).toBeTruthy();
  });

  it('marks a notification as read once it is reported viewable', () => {
    act(() => {
      useNotificationsStore.getState().addNotification(makeNotification());
    });
    expect(useNotificationsStore.getState().notifications[0].read).toBe(false);

    const { UNSAFE_getByType } = render(<NotificationsModal visible onClose={jest.fn()} />);
    const notification = useNotificationsStore.getState().notifications[0];
    const list = UNSAFE_getByType(FlatList);

    act(() => {
      list.props.onViewableItemsChanged({
        viewableItems: [{ item: notification, key: notification.id, index: 0, isViewable: true }],
      });
    });

    expect(useNotificationsStore.getState().notifications[0].read).toBe(true);
  });

  it('shows the new-notifications indicator while unread notifications remain, and hides it once read', () => {
    act(() => {
      useNotificationsStore.getState().addNotification(makeNotification());
    });
    const notification = useNotificationsStore.getState().notifications[0];
    const { getByText, queryByText, UNSAFE_getByType } = render(
      <NotificationsModal visible onClose={jest.fn()} />,
    );

    expect(getByText('New notifications')).toBeTruthy();

    const list = UNSAFE_getByType(FlatList);
    act(() => {
      list.props.onViewableItemsChanged({
        viewableItems: [{ item: notification, key: notification.id, index: 0, isViewable: true }],
      });
    });

    expect(queryByText('New notifications')).toBeNull();
  });

  it('scrolls to the top when the new-notifications indicator is pressed', () => {
    act(() => {
      useNotificationsStore.getState().addNotification(makeNotification());
    });

    const { getByText, UNSAFE_getByType } = render(<NotificationsModal visible onClose={jest.fn()} />);
    const list = UNSAFE_getByType(FlatList);
    list.instance.scrollToOffset = jest.fn();

    fireEvent.press(getByText('New notifications'));

    expect(list.instance.scrollToOffset).toHaveBeenCalledWith({ offset: 0, animated: true });
  });

  it('calls onClose when the backdrop is pressed', () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(<NotificationsModal visible onClose={onClose} />);

    fireEvent.press(getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
