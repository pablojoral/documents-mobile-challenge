import React from 'react';
import {
  Text as RNText,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';

import type {
  FontColorToken,
  FontSizeToken,
  FontWeightToken,
} from 'theme/tokens';

import { useTextTheme } from './theme/useTextTheme';

interface TextProps extends RNTextProps {
  color?: FontColorToken;
  size?: FontSizeToken;
  weight?: FontWeightToken;
  align?: TextStyle['textAlign'];
  children: React.ReactNode;
}

/**
 * The app's Text primitive. Always use this instead of `Text` from
 * `react-native` so typography stays token-driven. Color, size, and weight are
 * theme tokens, not raw values.
 */
export const Text = ({
  color = 'font-primary',
  size = 'font-size-md',
  weight = 'font-weight-regular',
  align = 'left',
  style,
  children,
  ...rest
}: TextProps) => {
  const { textStyle } = useTextTheme(color, size, weight, align);

  return (
    <RNText style={[textStyle, style]} {...rest}>
      {children}
    </RNText>
  );
};
