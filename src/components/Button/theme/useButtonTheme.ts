import { useMemo } from 'react';
import type { ViewStyle } from 'react-native';

import { useTheme } from 'theme/hooks/useTheme';
import type { FontColorToken } from 'theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export const useButtonTheme = (
  variant: ButtonVariant,
  disabled: boolean,
  fullWidth: boolean,
) => {
  const theme = useTheme();

  const containerStyle = useMemo<ViewStyle>(() => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing['spacing-sm'],
      paddingVertical: theme.spacing['spacing-sm'],
      paddingHorizontal: theme.spacing['spacing-md'],
      borderRadius: theme.cornerRad['corner-rad-md'],
      borderWidth: theme.borderWidth['border-width-hairline'],
      opacity: disabled ? 0.5 : 1,
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
    };

    switch (variant) {
      case 'primary':
        return {
          ...base,
          backgroundColor: theme.surfaceColor['surface-brand'],
          borderColor: theme.surfaceColor['surface-brand'],
        };
      case 'secondary':
        return {
          ...base,
          backgroundColor: theme.surfaceColor['surface-primary'],
          borderColor: theme.borderColor['border-brand'],
        };
      case 'ghost':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
    }
  }, [theme, variant, disabled, fullWidth]);

  const labelColor: FontColorToken =
    variant === 'primary' ? 'font-on-brand' : 'font-brand';

  return { containerStyle, labelColor, theme };
};
