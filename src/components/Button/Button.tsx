import React from 'react';
import { TouchableOpacity, type TouchableOpacityProps } from 'react-native';

import { Text } from 'components/Text/Text';
import { ActivityIndicator } from 'components/ActivityIndicator/ActivityIndicator';

import { useButtonTheme, type ButtonVariant } from './theme/useButtonTheme';

interface ButtonProps
  extends Omit<TouchableOpacityProps, 'disabled' | 'style'> {
  label: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * The app's labelled action. Always use this instead of a bare
 * `TouchableOpacity` for anything with a label.
 */
export const Button = ({
  label,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  onPress,
  ...rest
}: ButtonProps) => {
  const { containerStyle, labelColor } = useButtonTheme(
    variant,
    disabled || loading,
    fullWidth,
  );

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <Text color={labelColor} weight="font-weight-semibold">
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};
