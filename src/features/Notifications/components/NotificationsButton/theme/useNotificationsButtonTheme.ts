import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useNotificationsButtonTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: theme.spacing['spacing-sm'],
      paddingHorizontal: theme.spacing['spacing-sm'],
      borderRadius: theme.cornerRad['corner-rad-md'],
      borderWidth: theme.borderWidth['border-width-hairline'],
      borderColor: theme.borderColor['border-primary'],
      backgroundColor: theme.surfaceColor['surface-primary'],
    },
    badge: {
      flexShrink: 0,
      position: 'absolute',
      right: theme.spacing['spacing-xs'],
      top: theme.spacing['spacing-xs'],
    },
  });

  return { styles, theme };
};
