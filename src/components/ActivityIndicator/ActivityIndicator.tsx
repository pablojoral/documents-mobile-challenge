import React from 'react';
import {
  ActivityIndicator as RNActivityIndicator,
  type ActivityIndicatorProps as RNActivityIndicatorProps,
} from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';
import type { FontColorToken } from 'theme/tokens';

interface ActivityIndicatorProps
  extends Omit<RNActivityIndicatorProps, 'color'> {
  color?: FontColorToken;
}

/**
 * The app's spinner. Always use this instead of `ActivityIndicator` from
 * `react-native` so the tint stays theme-driven.
 */
export const ActivityIndicator = ({
  color = 'font-brand',
  size = 'small',
  ...rest
}: ActivityIndicatorProps) => {
  const theme = useTheme();

  return (
    <RNActivityIndicator
      color={theme.fontColor[color]}
      size={size}
      {...rest}
    />
  );
};
