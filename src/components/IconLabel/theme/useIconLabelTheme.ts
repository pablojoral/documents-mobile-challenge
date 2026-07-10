import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useIconLabelTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing['spacing-xs'],
    },
    label: {
      flexShrink: 1,
    },
  });

  return { styles, theme };
};
