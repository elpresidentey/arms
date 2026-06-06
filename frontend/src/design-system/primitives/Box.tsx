/**
 * Box - Flexible layout primitive with design tokens
 */
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils'

const boxVariants = cva('', {
  variants: {
    // Display
    display: {
      block: 'block',
      'inline-block': 'inline-block',
      inline: 'inline',
      flex: 'flex',
      'inline-flex': 'inline-flex',
      grid: 'grid',
      'inline-grid': 'inline-grid',
      hidden: 'hidden',
    },
    
    // Flexbox
    direction: {
      row: 'flex-row',
      'row-reverse': 'flex-row-reverse',
      col: 'flex-col',
      'col-reverse': 'flex-col-reverse',
    },
    
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    
    wrap: {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
    },
    
    // Spacing
    p: {
      0: 'p-0',
      1: 'p-1',
      2: 'p-2',
      3: 'p-3',
      4: 'p-4',
      5: 'p-5',
      6: 'p-6',
      8: 'p-8',
      10: 'p-10',
      12: 'p-12',
      16: 'p-16',
      20: 'p-20',
    },
    
    px: {
      0: 'px-0',
      1: 'px-1',
      2: 'px-2',
      3: 'px-3',
      4: 'px-4',
      5: 'px-5',
      6: 'px-6',
      8: 'px-8',
      10: 'px-10',
      12: 'px-12',
      16: 'px-16',
      20: 'px-20',
    },
    
    py: {
      0: 'py-0',
      1: 'py-1',
      2: 'py-2',
      3: 'py-3',
      4: 'py-4',
      5: 'py-5',
      6: 'py-6',
      8: 'py-8',
      10: 'py-10',
      12: 'py-12',
      16: 'py-16',
      20: 'py-20',
    },
    
    m: {
      0: 'm-0',
      1: 'm-1',
      2: 'm-2',
      3: 'm-3',
      4: 'm-4',
      5: 'm-5',
      6: 'm-6',
      8: 'm-8',
      10: 'm-10',
      12: 'm-12',
      16: 'm-16',
      20: 'm-20',
      auto: 'm-auto',
    },
    
    // Gap
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
      10: 'gap-10',
      12: 'gap-12',
    },
    
    // Width
    w: {
      auto: 'w-auto',
      full: 'w-full',
      screen: 'w-screen',
      fit: 'w-fit',
      min: 'w-min',
      max: 'w-max',
    },
    
    // Height
    h: {
      auto: 'h-auto',
      full: 'h-full',
      screen: 'h-screen',
      fit: 'h-fit',
      min: 'h-min',
      max: 'h-max',
    },
    
    // Background
    bg: {
      transparent: 'bg-transparent',
      white: 'bg-white',
      primary: 'bg-primary-500',
      'primary-light': 'bg-primary-50',
      secondary: 'bg-secondary-500',
      'secondary-light': 'bg-secondary-50',
      neutral: 'bg-neutral-100',
      'neutral-dark': 'bg-neutral-800',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      error: 'bg-error-500',
      info: 'bg-info-500',
    },
    
    // Border
    border: {
      none: 'border-0',
      thin: 'border',
      thick: 'border-2',
    },
    
    borderColor: {
      transparent: 'border-transparent',
      primary: 'border-primary-200',
      neutral: 'border-neutral-200',
      success: 'border-success-200',
      warning: 'border-warning-200',
      error: 'border-error-200',
    },
    
    // Border radius
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      full: 'rounded-full',
    },
    
    // Shadow
    shadow: {
      none: 'shadow-none',
      xs: 'shadow-xs',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      '2xl': 'shadow-2xl',
    },
    
    // Overflow
    overflow: {
      auto: 'overflow-auto',
      hidden: 'overflow-hidden',
      visible: 'overflow-visible',
      scroll: 'overflow-scroll',
    },
    
    // Position
    position: {
      static: 'static',
      fixed: 'fixed',
      absolute: 'absolute',
      relative: 'relative',
      sticky: 'sticky',
    },
  },
  defaultVariants: {
    display: 'block',
  },
})

export interface BoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof boxVariants> {
  as?: React.ElementType
}

const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ 
    className, 
    as: Component = 'div',
    display,
    direction,
    align,
    justify,
    wrap,
    p,
    px,
    py,
    m,
    gap,
    w,
    h,
    bg,
    border,
    borderColor,
    rounded,
    shadow,
    overflow,
    position,
    ...props 
  }, ref) => {
    return (
      <Component
        className={cn(
          boxVariants({
            display,
            direction,
            align,
            justify,
            wrap,
            p,
            px,
            py,
            m,
            gap,
            w,
            h,
            bg,
            border,
            borderColor,
            rounded,
            shadow,
            overflow,
            position,
            className,
          })
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Box.displayName = 'Box'

export { Box, boxVariants }