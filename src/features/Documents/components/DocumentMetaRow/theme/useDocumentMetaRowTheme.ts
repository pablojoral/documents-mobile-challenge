import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useDocumentMetaRowTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing['spacing-sm'],
    },
  });

  return { styles, theme };
};
