import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useDocumentsErrorTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing['spacing-xl'],
      gap: theme.spacing['spacing-sm'],
    },
    text: {
      gap: theme.spacing['spacing-xs'],
      alignItems: 'center',
    },
  });

  return { styles, theme };
};
