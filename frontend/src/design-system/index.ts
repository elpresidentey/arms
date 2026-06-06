/**
 * Design System - Public API
 * Centralized exports for all design system components and utilities
 */

// Primitives
export { Text, type TextProps } from './primitives/Text'
export { Button, type ButtonProps } from './primitives/Button'
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, type CardProps } from './primitives/Card'
export { Input, type InputProps } from './primitives/Input'
export { Badge, type BadgeProps } from './primitives/Badge'

// Layouts
export { Stack, Inline, Grid, Container, Section, SidebarLayout, type StackProps, type InlineProps, type GridProps, type ContainerProps, type SectionProps, type SidebarLayoutProps } from './layouts/MobileLayout'

// Components
export { Table, type TableProps, type ColumnDef } from './components/Table'
export { Form, FormField, FormActions, PasswordInput, Textarea, Select, Checkbox, RadioGroup, type FormProps, type FormFieldProps, type PasswordInputProps, type TextareaProps, type SelectProps, type CheckboxProps, type RadioGroupProps } from './components/Form'
export { ActionSheet, MobileCard, MobileStatusBar, MobileQuickActions, MobileCollectionItem, type ActionSheetProps, type MobileCardProps, type MobileStatusBarProps, type MobileQuickActionsProps, type MobileCollectionItemProps } from './components/MobileOperations'

// Utilities
export { cn, spacing, radius, shadows, animations, focusRing, typography, colors, responsive, layout } from './utils'

// Design tokens (can be used in JavaScript)
export const tokens = {
  colors: {
    primary: {
      50: '#f4f7f2',
      100: '#e3ebde',
      200: '#c5d4be',
      300: '#9eb592',
      400: '#6d8f62',
      500: '#4a6b41',
      600: '#3d5a36',
      700: '#324830',
      800: '#2a3d28',
      900: '#1f2e1d',
    },
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      600: '#059669',
      700: '#047857',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      600: '#d97706',
      700: '#b45309',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      600: '#dc2626',
      700: '#b91c1c',
    },
  },
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '0.75rem',  // 12px
    lg: '1rem',     // 16px
    xl: '1.25rem',  // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
    '4xl': '2.5rem', // 40px
    '5xl': '3rem',   // 48px
  },
  typography: {
    fontFamily: {
      sans: ['Lato', 'system-ui', 'sans-serif'],
      display: ['Cabin', 'Lato', 'system-ui', 'sans-serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: '0.6875rem',   // 11px
      sm: '0.8125rem',   // 13px
      base: '0.9375rem', // 15px
      lg: '1.0625rem',   // 17px
      xl: '1.1875rem',   // 19px
      '2xl': '1.375rem', // 22px
      '3xl': '1.625rem', // 26px
      '4xl': '1.875rem', // 30px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.625',
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.08em',
    },
  },
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    none: '0 0 #0000',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const

// Component composition helpers
export const compose = {
  stack: (spacing: keyof typeof tokens.spacing = 'md') => `space-y-${spacing}`,
  cluster: (spacing: keyof typeof tokens.spacing = 'md') => `flex flex-wrap gap-${spacing}`,
  center: () => 'flex items-center justify-center',
  sidebar: () => 'grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6',
  autoGrid: (minWidth: string = '250px') => `grid grid-cols-[repeat(auto-fit,minmax(${minWidth},1fr))] gap-4`,
}