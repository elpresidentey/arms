/**
 * ARMS Design System - Typography Tokens
 * Type scale and font definitions for waste management platform
 */

export const typography = {
  // Font Families
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['Fira Code', 'Monaco', 'Cascadia Code', 'Segoe UI Mono', 'Roboto Mono', 'monospace'],
    display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
  },

  // Font Sizes - Fluid Scale
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
    '5xl': ['3rem', { lineHeight: '1' }],           // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
    '7xl': ['4.5rem', { lineHeight: '1' }],         // 72px
  },

  // Font Weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Semantic Typography Styles
  styles: {
    // Headings
    'display-2xl': {
      fontSize: '4.5rem',
      lineHeight: '1.1',
      fontWeight: '800',
      letterSpacing: '-0.02em',
      fontFamily: 'display',
    },
    'display-xl': {
      fontSize: '3.75rem',
      lineHeight: '1.1',
      fontWeight: '800',
      letterSpacing: '-0.02em',
      fontFamily: 'display',
    },
    'display-lg': {
      fontSize: '3rem',
      lineHeight: '1.2',
      fontWeight: '700',
      letterSpacing: '-0.02em',
      fontFamily: 'display',
    },
    'heading-1': {
      fontSize: '2.25rem',
      lineHeight: '1.3',
      fontWeight: '700',
      letterSpacing: '-0.025em',
    },
    'heading-2': {
      fontSize: '1.875rem',
      lineHeight: '1.3',
      fontWeight: '600',
      letterSpacing: '-0.025em',
    },
    'heading-3': {
      fontSize: '1.5rem',
      lineHeight: '1.4',
      fontWeight: '600',
    },
    'heading-4': {
      fontSize: '1.25rem',
      lineHeight: '1.4',
      fontWeight: '600',
    },
    'heading-5': {
      fontSize: '1.125rem',
      lineHeight: '1.5',
      fontWeight: '600',
    },
    'heading-6': {
      fontSize: '1rem',
      lineHeight: '1.5',
      fontWeight: '600',
    },

    // Body Text
    'body-xl': {
      fontSize: '1.25rem',
      lineHeight: '1.6',
      fontWeight: '400',
    },
    'body-lg': {
      fontSize: '1.125rem',
      lineHeight: '1.6',
      fontWeight: '400',
    },
    'body': {
      fontSize: '1rem',
      lineHeight: '1.6',
      fontWeight: '400',
    },
    'body-sm': {
      fontSize: '0.875rem',
      lineHeight: '1.5',
      fontWeight: '400',
    },
    'body-xs': {
      fontSize: '0.75rem',
      lineHeight: '1.4',
      fontWeight: '400',
    },

    // Labels & UI Text
    'label-lg': {
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      fontWeight: '600',
    },
    'label': {
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      fontWeight: '500',
    },
    'label-sm': {
      fontSize: '0.75rem',
      lineHeight: '1rem',
      fontWeight: '500',
    },

    // Special Text
    'caption': {
      fontSize: '0.75rem',
      lineHeight: '1.2',
      fontWeight: '400',
      color: 'text.secondary',
    },
    'overline': {
      fontSize: '0.75rem',
      lineHeight: '1',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    'code': {
      fontSize: '0.875rem',
      lineHeight: '1.5',
      fontWeight: '400',
      fontFamily: 'mono',
    },
  },
} as const

export type TypographyToken = keyof typeof typography
export type TypographyStyle = keyof typeof typography.styles