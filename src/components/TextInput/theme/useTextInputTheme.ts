import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useTextInputTheme = (hasError: boolean, isDisabled: boolean) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      gap: theme.spacing['spacing-xs'],
    },
  });

  const inputStyle = useMemo<TextStyle & ViewStyle>(
    () => ({
      borderWidth: theme.borderWidth['border-width-hairline'],
      borderColor: hasError
        ? theme.borderColor['border-danger']
        : theme.borderColor['border-primary'],
      borderRadius: theme.cornerRad['corner-rad-md'],
      paddingHorizontal: theme.spacing['spacing-md'],
      paddingVertical: theme.spacing['spacing-sm'],
      backgroundColor: isDisabled
        ? theme.surfaceColor['surface-secondary']
        : theme.surfaceColor['surface-primary'],
      color: isDisabled
        ? theme.fontColor['font-disabled']
        : theme.fontColor['font-primary'],
      fontSize: theme.fontSize['font-size-md'],
    }),
    [theme, hasError, isDisabled],
  );

  return { styles, inputStyle, theme };
};
