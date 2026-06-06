/**
 * Design System Utilities
 * Common utility functions for the design system
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Spacing scale utilities
 */
export const spacing = {
  xs: 'space-y-1',
  sm: 'space-y-2',
  md: 'space-y-3',
  lg: 'space-y-4',
  xl: 'space-y-6',
  '2xl': 'space-y-8',
} as const

/**
 * Border radius utilities
 */
export const radius = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
} as const

/**
 * Shadow utilities
 */
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  none: 'shadow-none',
} as const

/**
 * Animation utilities
 */
export const animations = {
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
  fade: 'transition-opacity duration-200',
  slide: 'transition-transform duration-200',
  scale: 'transition-transform duration-200 hover:scale-105',
} as const

/**
 * Focus ring utilities
 */
export const focusRing = {
  default: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  error: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
  success: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
  warning: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
} as const

/**
 * Typography utilities
 */
export const typography = {
  display: 'font-display font-bold tracking-tight',
  heading: 'font-semibold tracking-tight',
  body: 'text-sm leading-relaxed',
  caption: 'text-xs text-slate-500',
  label: 'text-sm font-medium',
} as const

/**
 * Color palette utilities
 */
export const colors = {
  primary: {
    50: 'rgb(244 247 242)',
    100: 'rgb(227 235 222)',
    200: 'rgb(197 212 190)',
    300: 'rgb(158 181 146)',
    400: 'rgb(109 143 98)',
    500: 'rgb(74 107 65)',
    600: 'rgb(61 90 54)',
    700: 'rgb(50 72 48)',
    800: 'rgb(42 61 40)',
    900: 'rgb(31 46 29)',
  },
  slate: {
    50: 'rgb(248 250 252)',
    100: 'rgb(241 245 249)',
    200: 'rgb(226 232 240)',
    300: 'rgb(203 213 225)',
    400: 'rgb(148 163 184)',
    500: 'rgb(100 116 139)',
    600: 'rgb(71 85 105)',
    700: 'rgb(51 65 85)',
    800: 'rgb(30 41 59)',
    900: 'rgb(15 23 42)',
  },
  success: {
    50: 'rgb(236 253 245)',
    100: 'rgb(209 250 229)',
    600: 'rgb(5 150 105)',
    700: 'rgb(4 120 87)',
  },
  warning: {
    50: 'rgb(255 251 235)',
    100: 'rgb(254 243 199)',
    600: 'rgb(217 119 6)',
    700: 'rgb(180 83 9)',
  },
  error: {
    50: 'rgb(254 242 242)',
    100: 'rgb(254 226 226)',
    600: 'rgb(220 38 38)',
    700: 'rgb(185 28 28)',
  },
} as const

/**
 * Responsive utilities
 */
export const responsive = {
  mobile: 'block sm:hidden',
  tablet: 'hidden sm:block lg:hidden',
  desktop: 'hidden lg:block',
  'mobile-tablet': 'block lg:hidden',
  'tablet-desktop': 'hidden sm:block',
} as const

/**
 * Layout utilities
 */
export const layout = {
  container: 'mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8',
  section: 'space-y-6 sm:space-y-8',
  grid: {
    '1': 'grid grid-cols-1',
    '2': 'grid grid-cols-1 md:grid-cols-2',
    '3': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    auto: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  },
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
    col: 'flex flex-col',
    'col-center': 'flex flex-col items-center',
  },
} as const