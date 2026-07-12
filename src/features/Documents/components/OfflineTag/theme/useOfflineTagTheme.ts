import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useOfflineTagTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing['spacing-sm'],
      paddingVertical: theme.spacing['spacing-xxs'],
      borderRadius: theme.cornerRad['corner-rad-full'],
      backgroundColor: theme.surfaceColor['surface-secondary'],
    },
  });

  return { styles, theme };
};
