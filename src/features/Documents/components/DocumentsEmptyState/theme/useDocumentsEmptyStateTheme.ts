import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useDocumentsEmptyStateTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing['spacing-xxl'],
      gap: theme.spacing['spacing-xs'],
    },
  });

  return { styles, theme };
};
