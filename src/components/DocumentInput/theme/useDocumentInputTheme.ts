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
    fileList: {
      gap: theme.spacing['spacing-xs'],
    },
    fileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing['spacing-sm'],
    },
    fileRowInvalid: {
      borderWidth: theme.borderWidth['border-width-hairline'],
      borderColor: theme.borderColor['border-danger'],
      borderRadius: theme.cornerRad['corner-rad-sm'],
      paddingHorizontal: theme.spacing['spacing-xs'],
      paddingVertical: theme.spacing['spacing-xxs'],
    },
    fileInfo: {
      flexShrink: 1,
      gap: theme.spacing['spacing-xxs'],
    },
    fileName: {
      flexShrink: 1,
    },
  });

  const boxStyle = useMemo<ViewStyle>(
    () => ({
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

  return { styles, boxStyle, theme };
};
