/**
 * Text - Typography primitive with design tokens
 */
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils'

const textVariants = cva('', {
  variants: {
    // Typography styles
    variant: {
      'display-2xl': 'text-7xl font-extrabold leading-none tracking-tight font-display',
      'display-xl': 'text-6xl font-extrabold leading-none tracking-tight font-display',
      'display-lg': 'text-5xl font-bold leading-tight tracking-tight font-display',
      'heading-1': 'text-4xl font-bold leading-tight tracking-tight',
      'heading-2': 'text-3xl font-semibold leading-tight tracking-tight',
      'heading-3': 'text-2xl font-semibold leading-snug',
      'heading-4': 'text-xl font-semibold leading-snug',
      'heading-5': 'text-lg font-semibold leading-normal',
      'heading-6': 'text-base font-semibold leading-normal',
      'body-xl': 'text-xl font-normal leading-relaxed',
      'body-lg': 'text-lg font-normal leading-relaxed',
      'body': 'text-base font-normal leading-relaxed',
      'body-sm': 'text-sm font-normal leading-normal',
      'body-xs': 'text-xs font-normal leading-tight',
      'label-lg': 'text-sm font-semibold leading-tight',
      'label': 'text-sm font-medium leading-tight',
      'label-sm': 'text-xs font-medium leading-none',
      'caption': 'text-xs font-normal leading-tight text-neutral-600',
      'overline': 'text-xs font-semibold uppercase tracking-wider leading-none',
      'code': 'text-sm font-normal font-mono leading-normal',
    },
    
    // Colors
    color: {
      primary: 'text-neutral-900',
      secondary: 'text-neutral-600',
      tertiary: 'text-neutral-500',
      inverse: 'text-white',
      muted: 'text-neutral-400',
      brand: 'text-primary-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      error: 'text-error-600',
      info: 'text-info-600',
    },
    
    // Text alignment
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    
    // Text transform
    transform: {
      none: 'normal-case',
      uppercase: 'uppercase',
      lowercase: 'lowercase',
      capitalize: 'capitalize',
    },
    
    // Text decoration
    decoration: {
      none: 'no-underline',
      underline: 'underline',
      'line-through': 'line-through',
    },
    
    // Font weight override
    weight: {
      thin: 'font-thin',
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
    },
    
    // Truncation
    truncate: {
      true: 'truncate',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'body',
    color: 'primary',
    align: 'left',
  },
})

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'caption' | 'code'
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ 
    className, 
    as,
    variant,
    color,
    align,
    transform,
    decoration,
    weight,
    truncate,
    ...props 
  }, ref) => {
    // Auto-select semantic HTML element based on variant
    const getDefaultElement = (variant: string | null | undefined) => {
      if (!variant) return 'p'
      if (variant.startsWith('heading-1')) return 'h1'
      if (variant.startsWith('heading-2')) return 'h2'
      if (variant.startsWith('heading-3')) return 'h3'
      if (variant.startsWith('heading-4')) return 'h4'
      if (variant.startsWith('heading-5')) return 'h5'
      if (variant.startsWith('heading-6')) return 'h6'
      if (variant.startsWith('display')) return 'h1'
      if (variant.startsWith('label')) return 'label'
      if (variant === 'caption') return 'caption'
      if (variant === 'code') return 'code'
      return 'p'
    }
    
    const Component = as || getDefaultElement(variant)
    
    return (
      <Component
        className={cn(
          textVariants({
            variant,
            color,
            align,
            transform,
            decoration,
            weight,
            truncate,
            className,
          })
        )}
        ref={ref as any}
        {...props}
      />
    )
  }
)

Text.displayName = 'Text'

export { Text, textVariants }