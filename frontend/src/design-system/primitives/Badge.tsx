/**
 * Badge - Status indicator primitive with variants
 */
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-100 text-primary-700',
        secondary: 'border-transparent bg-slate-100 text-slate-700',
        success: 'border-transparent bg-emerald-100 text-emerald-700',
        warning: 'border-transparent bg-amber-100 text-amber-700',
        error: 'border-transparent bg-red-100 text-red-700',
        info: 'border-transparent bg-blue-100 text-blue-700',
        outline: 'border-slate-200 text-slate-700',
        ghost: 'border-transparent text-slate-700',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    )
  },
)

Badge.displayName = 'Badge'

export { Badge, badgeVariants }