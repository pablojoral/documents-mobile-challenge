import { renderHook } from '@testing-library/react-native';

import { notificationsSocket } from 'services/ws/notificationsSocket';
import { makeNotification } from 'test/fixtures';
import { MockWebSocket, installMockWebSocket } from 'test/mockWebSocket';

import { useNotificationsStore } from './useNotificationsStore';
import { useNotificationsSocketSync } from './useNotificationsSocketSync';

const initialState = useNotificationsStore.getState();

describe('useNotificationsSocketSync', () => {
  let restore: () => void;

  beforeEach(() => {
    useNotificationsStore.setState(initialState, true);
    restore = installMockWebSocket();
  });

  afterEach(() => {
    notificationsSocket.close();
    restore();
  });

  it('connects the socket and forwards messages into the store', () => {
    renderHook(() => useNotificationsSocketSync());

    const socket = MockWebSocket.last();
    socket.emitOpen();

    const notification = makeNotification({ DocumentTitle: 'Alpha' });
    socket.emitMessage(JSON.stringify(notification));

    expect(useNotificationsStore.getState().notifications).toEqual([
      expect.objectContaining({ DocumentTitle: 'Alpha', read: false }),
    ]);
  });

  it('stops forwarding messages after unmount', () => {
    const { unmount } = renderHook(() => useNotificationsSocketSync());
    const socket = MockWebSocket.last();
    socket.emitOpen();
    unmount();

    socket.emitMessage(JSON.stringify(makeNotification()));

    expect(useNotificationsStore.getState().notifications).toHaveLength(0);
  });
});
