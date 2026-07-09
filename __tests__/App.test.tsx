/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { notificationsSocket } from 'services/ws/notificationsSocket';
import { installMockWebSocket } from 'test/mockWebSocket';

test('renders correctly', async () => {
  const restore = installMockWebSocket();
  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  renderer!.unmount();

  notificationsSocket.close();
  restore();
});
