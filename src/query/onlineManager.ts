import { onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

/**
 * TanStack Query's default online detection listens for browser
 * `navigator`/`window` events, which don't exist in React Native — without
 * this, the client always assumes it's online and every offline query runs
 * straight into a network error instead of pausing until reconnect.
 */
export const setupOnlineManager = () => {
  onlineManager.setEventListener(setOnline =>
    NetInfo.addEventListener(state => setOnline(!!state.isConnected)),
  );
};
