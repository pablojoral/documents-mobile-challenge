import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useDocumentGridCardTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.surfaceColor['surface-primary'],
      borderRadius: theme.cornerRad['corner-rad-md'],
      borderWidth: theme.borderWidth['border-width-hairline'],
      borderColor: theme.borderColor['border-secondary'],
      padding: theme.spacing['spacing-sm'],
      gap: theme.spacing['spacing-xs'],
    },
    footer: {
      gap: theme.spacing['spacing-xxs'],
    },
  });

  return { styles, theme };
};
