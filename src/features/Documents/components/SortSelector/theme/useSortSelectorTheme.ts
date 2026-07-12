import { StyleSheet } from 'react-native';
import { useMemo } from 'react';

import { useTheme } from 'theme/hooks/useTheme';

export const useSortSelectorTheme = (disabled: boolean) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing['spacing-xxs'],
      paddingVertical: theme.spacing['spacing-xs'],
      paddingHorizontal: theme.spacing['spacing-sm'],
      borderRadius: theme.cornerRad['corner-rad-md'],
      borderWidth: theme.borderWidth['border-width-hairline'],
      borderColor: theme.borderColor['border-primary'],
      backgroundColor: theme.surfaceColor['surface-primary'],
    },
    modalRoot: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.surfaceColor['surface-overlay'],
    },
    sheet: {
      backgroundColor: theme.surfaceColor['surface-primary'],
      borderTopLeftRadius: theme.cornerRad['corner-rad-lg'],
      borderTopRightRadius: theme.cornerRad['corner-rad-lg'],
      paddingHorizontal: theme.spacing['spacing-md'],
      paddingTop: theme.spacing['spacing-md'],
      paddingBottom: theme.bottomInset + theme.spacing['spacing-md'],
      gap: theme.spacing['spacing-xs'],
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing['spacing-sm'],
    },
  });

  const triggerStyle = useMemo(
    () => [styles.trigger, { opacity: disabled ? 0.5 : 1 }],
    [styles.trigger, disabled],
  );

  return { styles, triggerStyle, theme };
};
