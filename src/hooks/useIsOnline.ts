import { useNetInfo } from '@react-native-community/netinfo';

export const useIsOnline = () => {
  const { isConnected, isInternetReachable } = useNetInfo();
  return isConnected !== false && isInternetReachable !== false;
};
