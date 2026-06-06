/**
 * Input - Form input primitive with states and variants
 */
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils'

const inputVariants = cva(
  'flex w-full rounded-xl border px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-slate-200 bg-white focus-visible:ring-primary-500',
        error: 'border-red-300 bg-red-50 focus-visible:ring-red-500',
        success: 'border-emerald-300 bg-emerald-50 focus-visible:ring-emerald-500',
      },
      inputSize: {
        sm: 'h-8 text-xs px-2.5',
        md: 'h-10',
        lg: 'h-12 px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  },
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  error?: boolean
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    variant, 
    inputSize, 
    icon, 
    iconPosition = 'left',
    error,
    success,
    ...props 
  }, ref) => {
    const inputVariant = error ? 'error' : success ? 'success' : variant
    
    if (icon) {
      return (
        <div className="relative">
          {iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant: inputVariant, inputSize, className }),
              iconPosition === 'left' && 'pl-10',
              iconPosition === 'right' && 'pr-10'
            )}
            ref={ref}
            {...props}
          />
          {iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(inputVariants({ variant: inputVariant, inputSize, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'

export { Input, inputVariants }