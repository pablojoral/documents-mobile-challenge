import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useCreateDocumentModalTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    content: {
      gap: theme.spacing['spacing-md'],
      paddingHorizontal: theme.spacing['spacing-md'],
      paddingTop: theme.spacing['spacing-sm'],
      paddingBottom: theme.spacing['spacing-lg'],
    },
  });

  return { styles, theme };
};
