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
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing['spacing-sm'],
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing['spacing-sm'],
    },
    footerColumn: {
      flex: 1,
      gap: theme.spacing['spacing-xxs'],
    },
    footerColumnHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing['spacing-xxs'],
    },
    footerItemLabel: {
      flexShrink: 1,
    },
  });

  return { styles, theme };
};
