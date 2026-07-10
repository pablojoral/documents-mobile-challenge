import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useDocumentListCardTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.surfaceColor['surface-primary'],
      borderRadius: theme.cornerRad['corner-rad-md'],
      borderWidth: theme.borderWidth['border-width-hairline'],
      borderColor: theme.borderColor['border-secondary'],
      padding: theme.spacing['spacing-md'],
      gap: theme.spacing['spacing-sm'],
    },
    header: {
      gap: theme.spacing['spacing-xs'],
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing['spacing-sm'],
    },
  });

  return { styles, theme };
};
