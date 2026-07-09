import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { NotificationsNewIndicator } from './NotificationsNewIndicator';

describe('NotificationsNewIndicator', () => {
  it('renders the indicator copy when there are unread notifications', () => {
    const { getByText } = render(<NotificationsNewIndicator count={2} onPress={jest.fn()} />);
    expect(getByText('New notifications')).toBeTruthy();
  });

  it('renders nothing when count is zero', () => {
    const { toJSON } = render(<NotificationsNewIndicator count={0} onPress={jest.fn()} />);
    expect(toJSON()).toBeNull();
  });

  it('renders nothing when count is negative', () => {
    const { toJSON } = render(<NotificationsNewIndicator count={-1} onPress={jest.fn()} />);
    expect(toJSON()).toBeNull();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<NotificationsNewIndicator count={1} onPress={onPress} />);

    fireEvent.press(getByText('New notifications'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
