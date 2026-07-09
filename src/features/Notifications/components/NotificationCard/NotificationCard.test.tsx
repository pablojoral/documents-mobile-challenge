import React from 'react';
import { render } from '@testing-library/react-native';

import type { StoredNotification } from 'store/Notifications/useNotificationsStore';

import { NotificationCard } from './NotificationCard';

const notification: StoredNotification = {
  id: 'doc-1:2020-08-12T07:30:08.28093+02:00',
  Timestamp: '2020-08-12T07:30:08.28093+02:00',
  UserID: 'user-1',
  UserName: 'Alicia Wolf',
  DocumentID: 'doc-1',
  DocumentTitle: 'Edmund Fitzgerald Porter',
  read: false,
};

describe('NotificationCard', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2020-08-14T07:30:08.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders who created what document', () => {
    const { getByText } = render(<NotificationCard notification={notification} />);
    expect(getByText('Alicia Wolf created "Edmund Fitzgerald Porter"')).toBeTruthy();
  });

  it('renders a relative timestamp', () => {
    const { getByText } = render(<NotificationCard notification={notification} />);
    expect(getByText('2 days ago')).toBeTruthy();
  });
});
