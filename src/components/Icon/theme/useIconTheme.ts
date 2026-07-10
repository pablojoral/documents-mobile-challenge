import { useTheme } from 'theme/hooks/useTheme';
import type { FontColorToken, IconSizeToken } from 'theme/tokens';

export const useIconTheme = (size: IconSizeToken, color: FontColorToken) => {
  const theme = useTheme();

  return {
    pixelSize: theme.iconSize[size],
    colorValue: theme.fontColor[color],
    theme,
  };
};
