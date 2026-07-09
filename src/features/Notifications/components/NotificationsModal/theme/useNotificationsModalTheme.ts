import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useNotificationsModalTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    listContent: {
      paddingHorizontal: theme.spacing['spacing-md'],
      gap: theme.spacing['spacing-sm'],
      flexGrow: 1,
    },
  });

  return { styles, theme };
};
