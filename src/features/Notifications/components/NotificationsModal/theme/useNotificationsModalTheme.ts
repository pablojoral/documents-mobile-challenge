import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useNotificationsModalTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    /**
     * No `flex: 1` here: the modal's sheet sizes itself to content (up to
     * `maxHeight: '80%'`), not via a flex-grow chain — a flex-grow child
     * inside it has no available space to grow into and collapses to zero
     * height. This wrapper exists only as a relative-position anchor for the
     * absolute-positioned new-notifications indicator; it must stay
     * content-sized like the FlatList it wraps used to be on its own.
     */
    listContainer: {},
    listContent: {
      paddingHorizontal: theme.spacing['spacing-md'],
      gap: theme.spacing['spacing-sm'],
      flexGrow: 1,
    },
  });

  return { styles, theme };
};
