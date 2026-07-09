/**
 * Design tokens.
 *
 * These are the single source of truth for every design constant in the app.
 * Components never use raw numbers or colors — they read from the theme built
 * out of these tokens (see `theme/hooks/useTheme`). Token *names* are stable
 * across light/dark; only color *values* differ per scheme.
 */

export const spacing = {
  'spacing-none': 0,
  'spacing-xxs': 2,
  'spacing-xs': 4,
  'spacing-sm': 8,
  'spacing-md': 16,
  'spacing-lg': 24,
  'spacing-xl': 32,
  'spacing-xxl': 48,
} as const;

export const cornerRad = {
  'corner-rad-none': 0,
  'corner-rad-sm': 4,
  'corner-rad-md': 8,
  'corner-rad-lg': 16,
  'corner-rad-full': 9999,
} as const;

export const fontSize = {
  'font-size-xxs': 10,
  'font-size-xs': 12,
  'font-size-sm': 14,
  'font-size-md': 16,
  'font-size-lg': 18,
  'font-size-xl': 22,
  'font-size-xxl': 28,
  'font-size-xxxl': 34,
  'font-size-xxxxl': 44,
} as const;

export const lineHeight = {
  'line-height-xxs': 14,
  'line-height-xs': 16,
  'line-height-sm': 20,
  'line-height-md': 24,
  'line-height-lg': 26,
  'line-height-xl': 30,
  'line-height-xxl': 36,
  'line-height-xxxl': 42,
  'line-height-xxxxl': 52,
} as const;

export const fontWeight = {
  'font-weight-regular': '400',
  'font-weight-medium': '500',
  'font-weight-semibold': '600',
  'font-weight-bold': '700',
} as const;

export const iconSize = {
  'icon-size-xs': 16,
  'icon-size-sm': 20,
  'icon-size-md': 24,
  'icon-size-lg': 32,
  'icon-size-xl': 40,
  'icon-size-xxl': 48,
  'icon-size-xxxl': 64,
} as const;

export const borderWidth = {
  'border-width-none': 0,
  'border-width-hairline': 1,
  'border-width-thick': 2,
} as const;

/** Raw palette — never referenced directly by components, only by semantic maps below. */
const palette = {
  white: '#FFFFFF',
  black: '#0B0B0F',
  grey50: '#F7F7FA',
  grey100: '#F1F0F5',
  grey200: '#E3E1EA',
  grey300: '#CFCCD8',
  grey400: '#A5A0B3',
  grey500: '#7C7690',
  grey600: '#57516A',
  grey700: '#3A3548',
  grey800: '#242030',
  grey900: '#15121D',
  primary: '#4181F2',
  primaryDark: '#8A6FF5',
  primarySoft: '#ECF2FE',
  primarySoftDark: '#241E3D',
  danger: '#E5484D',
  success: '#30A46C',
  warning: '#F5A623',
} as const;

export interface ColorScheme {
  surfaceColor: {
    'surface-background': string;
    'surface-primary': string;
    'surface-secondary': string;
    'surface-brand': string;
    'surface-brand-soft': string;
    'surface-danger': string;
    /** Dimming scrim behind modals/sheets. */
    'surface-overlay': string;
  };
  fontColor: {
    'font-primary': string;
    'font-secondary': string;
    'font-disabled': string;
    'font-brand': string;
    'font-on-brand': string;
    'font-danger': string;
  };
  borderColor: {
    'border-primary': string;
    'border-secondary': string;
    'border-disabled': string;
    'border-brand': string;
    'border-danger': string;
  };
}

export const lightColors: ColorScheme = {
  surfaceColor: {
    'surface-background': palette.grey50,
    'surface-primary': palette.white,
    'surface-secondary': palette.grey100,
    'surface-brand': palette.primary,
    'surface-brand-soft': palette.primarySoft,
    'surface-danger': palette.danger,
    'surface-overlay': 'rgba(11, 11, 15, 0.4)',
  },
  fontColor: {
    'font-primary': palette.grey900,
    'font-secondary': palette.grey500,
    'font-disabled': palette.grey400,
    'font-brand': palette.primary,
    'font-on-brand': palette.white,
    'font-danger': palette.danger,
  },
  borderColor: {
    'border-primary': palette.grey200,
    'border-secondary': palette.grey100,
    'border-disabled': palette.grey200,
    'border-brand': palette.primary,
    'border-danger': palette.danger,
  },
};

export const darkColors: ColorScheme = {
  surfaceColor: {
    'surface-background': palette.black,
    'surface-primary': palette.grey900,
    'surface-secondary': palette.grey800,
    'surface-brand': palette.primaryDark,
    'surface-brand-soft': palette.primarySoftDark,
    'surface-danger': palette.danger,
    'surface-overlay': 'rgba(0, 0, 0, 0.6)',
  },
  fontColor: {
    'font-primary': palette.grey50,
    'font-secondary': palette.grey400,
    'font-disabled': palette.grey600,
    'font-brand': palette.primaryDark,
    'font-on-brand': palette.white,
    'font-danger': palette.danger,
  },
  borderColor: {
    'border-primary': palette.grey700,
    'border-secondary': palette.grey800,
    'border-disabled': palette.grey700,
    'border-brand': palette.primaryDark,
    'border-danger': palette.danger,
  },
};

export type SpacingToken = keyof typeof spacing;
export type CornerRadToken = keyof typeof cornerRad;
export type FontSizeToken = keyof typeof fontSize;
export type LineHeightToken = keyof typeof lineHeight;
export type FontWeightToken = keyof typeof fontWeight;
export type IconSizeToken = keyof typeof iconSize;
export type BorderWidthToken = keyof typeof borderWidth;
export type SurfaceColorToken = keyof ColorScheme['surfaceColor'];
export type FontColorToken = keyof ColorScheme['fontColor'];
export type BorderColorToken = keyof ColorScheme['borderColor'];
