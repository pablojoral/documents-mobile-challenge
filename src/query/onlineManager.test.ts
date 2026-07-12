import { onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

import { setupOnlineManager } from './onlineManager';

const mockAddEventListener = NetInfo.addEventListener as jest.Mock;

describe('setupOnlineManager', () => {
  it('forwards NetInfo connectivity changes to the query online manager', () => {
    let netInfoListener: (state: { isConnected: boolean | null }) => void =
      () => {};
    mockAddEventListener.mockImplementation(listener => {
      netInfoListener = listener;
      return jest.fn();
    });
    const setEventListenerSpy = jest.spyOn(onlineManager, 'setEventListener');

    setupOnlineManager();

    const registeredHandler = setEventListenerSpy.mock.calls[0][0];
    const setOnline = jest.fn();
    registeredHandler(setOnline);

    netInfoListener({ isConnected: true });
    expect(setOnline).toHaveBeenCalledWith(true);

    netInfoListener({ isConnected: false });
    expect(setOnline).toHaveBeenCalledWith(false);

    netInfoListener({ isConnected: null });
    expect(setOnline).toHaveBeenLastCalledWith(false);
  });
});
