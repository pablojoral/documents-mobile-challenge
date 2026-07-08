import { useMemo } from 'react';
import type { TextStyle } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';
import type {
  FontColorToken,
  FontSizeToken,
  FontWeightToken,
} from 'theme/tokens';

export const useTextTheme = (
  color: FontColorToken,
  size: FontSizeToken,
  weight: FontWeightToken,
  align: TextStyle['textAlign'],
) => {
  const theme = useTheme();

  const textStyle = useMemo<TextStyle>(() => {
    // Line height shares the size token's suffix (font-size-md → line-height-md).
    const lineHeightKey = size.replace(
      'font-size',
      'line-height',
    ) as keyof typeof theme.lineHeight;

    return {
      color: theme.fontColor[color],
      fontSize: theme.fontSize[size],
      lineHeight: theme.lineHeight[lineHeightKey],
      fontWeight: theme.fontWeight[weight],
      textAlign: align,
    };
  }, [theme, color, size, weight, align]);

  return { textStyle, theme };
};
