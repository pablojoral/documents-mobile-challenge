import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useAddDocumentButtonTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing['spacing-md'],
      paddingTop: theme.spacing['spacing-sm'],
      paddingBottom: theme.bottomInset + theme.spacing['spacing-sm'],
      borderTopWidth: theme.borderWidth['border-width-hairline'],
      borderTopColor: theme.borderColor['border-secondary'],
      backgroundColor: theme.surfaceColor['surface-background'],
    },
  });

  return { styles, theme };
};
