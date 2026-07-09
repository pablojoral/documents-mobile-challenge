import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useBadgeTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexShrink: 0,
      backgroundColor: theme.surfaceColor['surface-danger'],
      borderRadius: theme.cornerRad['corner-rad-full'],
      minWidth: theme.iconSize['icon-size-sm'],
      paddingHorizontal: theme.spacing['spacing-xs'],
      paddingVertical: theme.spacing['spacing-xxs'],
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return { styles, theme };
};
