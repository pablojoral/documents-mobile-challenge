import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useDocumentsTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.surfaceColor['surface-background'],
      paddingTop: theme.topInset,
    },
    header: {
      paddingHorizontal: theme.spacing['spacing-md'],
      paddingTop: theme.spacing['spacing-md'],
      paddingBottom: theme.spacing['spacing-sm'],
      gap: theme.spacing['spacing-sm'],
    },
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing['spacing-sm'],
    },
    listContent: {
      padding: theme.spacing['spacing-md'],
      gap: theme.spacing['spacing-sm'],
      flexGrow: 1,
    },
    columnWrapper: {
      gap: theme.spacing['spacing-sm'],
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing['spacing-xl'],
    },
  });

  return { styles, theme };
};
