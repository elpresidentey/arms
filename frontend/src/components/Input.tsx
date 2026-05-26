import React, { forwardRef } from 'react'
import clsx from 'clsx'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
  onPasswordToggle?: () => void
  containerClassName?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-10 px-3 py-2 text-sm rounded-md',
  md: 'h-12 px-4 py-3 text-sm rounded-lg',
  lg: 'h-14 px-4 py-3.5 text-base rounded-lg',
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      loading,
      leftIcon,
      rightIcon,
      showPasswordToggle,
      onPasswordToggle,
      containerClassName,
      className,
      type = 'text',
      id,
      size = 'md',
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const hasError = !!error
    const hasHelper = !!helperText

    return (
      <div className={clsx('space-y-2', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700"
          >
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <div className="text-slate-400">{leftIcon}</div>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={clsx(
              'w-full border transition-all placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              sizeClasses[size],
              {
                'border-rose-300 bg-rose-50': hasError,
                'border-slate-300 bg-white': !hasError,
                'pl-10': leftIcon,
                'pr-10': rightIcon || showPasswordToggle || loading,
                'animate-pulse': loading,
              },
              className
            )}
            disabled={loading}
            aria-invalid={hasError}
            aria-describedby={hasError || hasHelper ? `${inputId}-description` : undefined}
            {...props}
          />
          
          {(rightIcon || showPasswordToggle || loading) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {loading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary-600" />
              )}
              {showPasswordToggle && !loading && (
                <button
                  type="button"
                  onClick={onPasswordToggle}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full p-1"
                  aria-label={type === 'password' ? 'Show password' : 'Hide password'}
                >
                  {type === 'password' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
              {rightIcon && !loading && !showPasswordToggle && (
                <div className="text-slate-400">{rightIcon}</div>
              )}
            </div>
          )}
        </div>
        
        {(hasError || hasHelper) && (
          <div
            id={`${inputId}-description`}
            className={clsx('text-xs flex items-start gap-1', {
              'text-rose-600': hasError,
              'text-slate-500': !hasError,
            })}
          >
            {hasError && <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />}
            <span>{error || helperText}</span>
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
