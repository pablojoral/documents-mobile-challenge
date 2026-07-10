import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useDocumentInputTheme = (hasError: boolean) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      gap: theme.spacing['spacing-xs'],
    },
    fileName: {
      flexShrink: 1,
    },
  });

  const rowStyle = useMemo<ViewStyle>(
    () => ({
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing['spacing-sm'],
      padding: theme.spacing['spacing-sm'],
      borderWidth: theme.borderWidth['border-width-hairline'],
      borderColor: hasError
        ? theme.borderColor['border-danger']
        : theme.borderColor['border-primary'],
      borderRadius: theme.cornerRad['corner-rad-md'],
    }),
    [theme, hasError],
  );

  return { styles, rowStyle, theme };
};
