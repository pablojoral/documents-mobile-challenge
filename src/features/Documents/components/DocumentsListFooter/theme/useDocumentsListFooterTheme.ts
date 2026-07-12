import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useDocumentsListFooterTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing['spacing-lg'],
    },
  });

  return { styles, theme };
};
