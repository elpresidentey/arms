/**
 * ARMS Design System - Color Tokens
 * Semantic color system for waste management platform
 */

export const colors = {
  // Primary - Waste Management Green
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main brand color
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Secondary - Earth Tones  
  secondary: {
    50: '#fefdf8',
    100: '#fefbeb',
    200: '#fef3c7',
    300: '#fde68a',
    400: '#fcd34d',
    500: '#fbbf24',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Neutral - Clean UI
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },

  // Semantic Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },

  // Functional Colors
  background: {
    primary: '#ffffff',
    secondary: '#fafafa',
    tertiary: '#f4f4f5',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  text: {
    primary: '#18181b',
    secondary: '#52525b',
    tertiary: '#a1a1aa',
    inverse: '#ffffff',
    muted: '#71717a',
  },

  border: {
    primary: '#e4e4e7',
    secondary: '#d4d4d8',
    focus: '#22c55e',
    error: '#ef4444',
  },

  // Waste Management Specific
  waste: {
    recycling: '#22c55e',
    organic: '#84cc16',
    plastic: '#3b82f6',
    metal: '#64748b',
    paper: '#f59e0b',
    glass: '#06b6d4',
    hazardous: '#ef4444',
  },
} as const

export type ColorToken = keyof typeof colors
export type ColorShade = keyof typeof colors.primary