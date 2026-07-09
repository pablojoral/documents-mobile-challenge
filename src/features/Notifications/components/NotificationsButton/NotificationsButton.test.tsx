import React from 'react';
import { FlatList } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import { makeNotification } from 'test/fixtures';
import { useNotificationsStore } from 'store/Notifications/useNotificationsStore';

import { NotificationsButton } from './NotificationsButton';

const initialState = useNotificationsStore.getState();

describe('NotificationsButton', () => {
  beforeEach(() => {
    useNotificationsStore.setState(initialState, true);
  });

  it('hides the badge when there are no unread notifications', () => {
    const { queryByText } = render(<NotificationsButton />);
    expect(queryByText('1')).toBeNull();
  });

  it('shows the unread count on the badge', () => {
    act(() => {
      useNotificationsStore.getState().addNotification(makeNotification());
    });

    const { getByText } = render(<NotificationsButton />);
    expect(getByText('1')).toBeTruthy();
  });

  it('opens the notifications modal on press; clears the badge once the notification is seen', () => {
    act(() => {
      useNotificationsStore.getState().addNotification(makeNotification());
    });

    const { getByLabelText, getByText, queryByText, UNSAFE_getByType } = render(
      <NotificationsButton />,
    );
    expect(getByText('1')).toBeTruthy();

    fireEvent.press(getByLabelText('Notifications'));

    expect(getByText('Notifications')).toBeTruthy(); // modal title

    const notification = useNotificationsStore.getState().notifications[0];
    const list = UNSAFE_getByType(FlatList);
    act(() => {
      list.props.onViewableItemsChanged({
        viewableItems: [{ item: notification, key: notification.id, index: 0, isViewable: true }],
      });
    });

    expect(queryByText('1')).toBeNull(); // badge cleared, notification read
  });
});
