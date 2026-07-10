import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useDocumentCardFooterColumnTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      gap: theme.spacing['spacing-xxs'],
    },
    itemLabel: {
      flexShrink: 1,
    },
  });

  return { styles, theme };
};
