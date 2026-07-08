import { renderHook } from '@testing-library/react-native';

import { useTheme } from './useTheme';

describe('useTheme', () => {
  it('exposes the token maps', () => {
    const { result } = renderHook(() => useTheme());
    const theme = result.current;

    expect(theme.spacing['spacing-md']).toBe(16);
    expect(theme.cornerRad['corner-rad-md']).toBe(8);
    expect(theme.fontColor['font-primary']).toBeDefined();
    expect(theme.surfaceColor['surface-background']).toBeDefined();
  });

  it('folds in safe-area insets as numbers', () => {
    const { result } = renderHook(() => useTheme());
    expect(typeof result.current.topInset).toBe('number');
    expect(typeof result.current.bottomInset).toBe('number');
  });
});
