import { renderHook } from '@testing-library/react-native';
import { useNetInfo } from '@react-native-community/netinfo';

import { useIsOnline } from './useIsOnline';

const mockUseNetInfo = useNetInfo as jest.Mock;

describe('useIsOnline', () => {
  it('is true when connected with internet reachable', () => {
    mockUseNetInfo.mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
    });
    const { result } = renderHook(() => useIsOnline());
    expect(result.current).toBe(true);
  });

  it('is false when the device has no network interface', () => {
    mockUseNetInfo.mockReturnValue({
      isConnected: false,
      isInternetReachable: null,
    });
    const { result } = renderHook(() => useIsOnline());
    expect(result.current).toBe(false);
  });

  it('is false when connected to an interface with no internet access (e.g. Airplane Mode with Wi-Fi left on)', () => {
    mockUseNetInfo.mockReturnValue({
      isConnected: true,
      isInternetReachable: false,
    });
    const { result } = renderHook(() => useIsOnline());
    expect(result.current).toBe(false);
  });

  it('treats an unresolved connectivity state as online', () => {
    mockUseNetInfo.mockReturnValue({
      isConnected: null,
      isInternetReachable: null,
    });
    const { result } = renderHook(() => useIsOnline());
    expect(result.current).toBe(true);
  });
});
