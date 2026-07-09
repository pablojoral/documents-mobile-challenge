import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useNotificationsNewIndicatorTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: theme.spacing['spacing-sm'],
      alignSelf: 'center',
      paddingHorizontal: theme.spacing['spacing-md'],
      paddingVertical: theme.spacing['spacing-xs'],
      borderRadius: theme.cornerRad['corner-rad-full'],
      backgroundColor: theme.surfaceColor['surface-brand'],
    },
  });

  return { styles, theme };
};
