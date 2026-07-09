import React from 'react';
import { render } from '@testing-library/react-native';

import { NotificationsEmptyState } from './NotificationsEmptyState';

describe('NotificationsEmptyState', () => {
  it('renders the empty-state copy', () => {
    const { getByText } = render(<NotificationsEmptyState />);
    expect(getByText('No notifications yet')).toBeTruthy();
  });
});
