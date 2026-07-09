import { StyleSheet } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';

export const useModalTheme = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
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
      maxHeight: '80%',
      backgroundColor: theme.surfaceColor['surface-primary'],
      borderTopLeftRadius: theme.cornerRad['corner-rad-lg'],
      borderTopRightRadius: theme.cornerRad['corner-rad-lg'],
      paddingTop: theme.spacing['spacing-md'],
      paddingBottom: theme.bottomInset + theme.spacing['spacing-md'],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing['spacing-md'],
      paddingBottom: theme.spacing['spacing-sm'],
    },
  });

  return { styles, theme };
};
