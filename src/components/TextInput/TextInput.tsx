import React from 'react';
import {
  TextInput as RNTextInput,
  View,
  type TextInputProps as RNTextInputProps,
} from 'react-native';

import { Text } from 'components/Text/Text';

import { useTextInputTheme } from './theme/useTextInputTheme';

export interface TextInputProps extends RNTextInputProps {
  label: string;
  error?: string;
}

/**
 * The app's labelled text input. Always use this instead of a bare
 * `TextInput` from `react-native` — it renders a label above and, when
 * `error` is set, a validation message below.
 */
export const TextInput = ({
  label,
  error,
  style,
  editable = true,
  ...rest
}: TextInputProps) => {
  const hasError = !!error;
  const { styles, inputStyle, theme } = useTextInputTheme(
    hasError,
    !editable,
  );

  return (
    <View style={styles.container}>
      <Text size="font-size-sm" weight="font-weight-medium" color="font-secondary">
        {label}
      </Text>
      <RNTextInput
        style={[inputStyle, style]}
        editable={editable}
        placeholderTextColor={theme.fontColor['font-disabled']}
        accessibilityLabel={label}
        {...rest}
      />
      {error ? (
        <Text size="font-size-xs" color="font-danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
};
