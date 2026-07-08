import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useViewModeToggleTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.surfaceColor['surface-secondary'],
      borderRadius: theme.cornerRad['corner-rad-md'],
      padding: theme.spacing['spacing-xxs'],
      gap: theme.spacing['spacing-xxs'],
    },
    segment: {
      paddingVertical: theme.spacing['spacing-xs'],
      paddingHorizontal: theme.spacing['spacing-sm'],
      borderRadius: theme.cornerRad['corner-rad-sm'],
    },
    segmentActive: {
      backgroundColor: theme.surfaceColor['surface-brand'],
    },
  });

  return { styles, theme };
};
