import React from 'react';
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

  it('marks all notifications as read when opened, clearing the unread count', () => {
    act(() => {
      useNotificationsStore.getState().addNotification(makeNotification());
    });
    expect(useNotificationsStore.getState().notifications[0].read).toBe(false);

    render(<NotificationsModal visible onClose={jest.fn()} />);

    expect(useNotificationsStore.getState().notifications[0].read).toBe(true);
  });

  it('marks a notification as read if it arrives while already open', () => {
    render(<NotificationsModal visible onClose={jest.fn()} />);

    act(() => {
      useNotificationsStore.getState().addNotification(makeNotification());
    });

    expect(useNotificationsStore.getState().notifications[0].read).toBe(true);
  });

  it('calls onClose when the backdrop is pressed', () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(<NotificationsModal visible onClose={onClose} />);

    fireEvent.press(getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
