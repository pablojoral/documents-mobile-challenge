import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  borderWidth,
  cornerRad,
  darkColors,
  fontSize,
  fontWeight,
  iconSize,
  lightColors,
  lineHeight,
  spacing,
} from '../tokens';

/**
 * The single hook every `use<Name>Theme` hook calls to read design constants.
 *
 * It resolves the active color scheme (light/dark) and folds in the current
 * safe-area insets as `topInset` / `bottomInset`, which are the only raw
 * layout numbers allowed by the styling rules.
 */
export const useTheme = () => {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const colors = scheme === 'dark' ? darkColors : lightColors;

    return {
      isDark: scheme === 'dark',
      spacing,
      cornerRad,
      fontSize,
      lineHeight,
      fontWeight,
      iconSize,
      borderWidth,
      ...colors,
      topInset: insets.top,
      bottomInset: insets.bottom,
      leftInset: insets.left,
      rightInset: insets.right,
    };
  }, [scheme, insets.top, insets.bottom, insets.left, insets.right]);
};

export type Theme = ReturnType<typeof useTheme>;
