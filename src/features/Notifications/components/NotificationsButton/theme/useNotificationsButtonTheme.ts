import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useNotificationsButtonTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    trigger: {
      paddingVertical: theme.spacing['spacing-xs'],
      paddingHorizontal: theme.spacing['spacing-sm'],
      borderRadius: theme.cornerRad['corner-rad-md'],
      borderWidth: theme.borderWidth['border-width-hairline'],
      borderColor: theme.borderColor['border-primary'],
      backgroundColor: theme.surfaceColor['surface-primary'],
    },
    badge: {
      position: 'absolute',
      top: -theme.spacing['spacing-xs'],
      right: -theme.spacing['spacing-xs'],
    },
  });

  return { styles, theme };
};
