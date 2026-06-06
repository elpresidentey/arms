/**
 * Form - Comprehensive form system with validation and mobile support
 */
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { cn } from '../utils'
import { Input } from '../primitives/Input'
import { Stack } from '../layouts/MobileLayout'

// Form Field Wrapper
export interface FormFieldProps {
  label?: string
  description?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  description,
  error,
  required,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {children}
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      
      {description && !error && (
        <p className="text-sm text-slate-500">{description}</p>
      )}
    </div>
  )
}

// Password Input
export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: boolean
  success?: boolean
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  className,
  error,
  success,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        className={cn('pr-10', className)}
        error={error}
        success={success}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        {showPassword ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}

// Textarea
const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-xl border px-3 py-2 text-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y',
  {
    variants: {
      variant: {
        default: 'border-slate-200 bg-white focus-visible:ring-primary-500',
        error: 'border-red-300 bg-red-50 focus-visible:ring-red-500',
        success: 'border-emerald-300 bg-emerald-50 focus-visible:ring-emerald-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: boolean
  success?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, error, success, ...props }, ref) => {
    const textareaVariant = error ? 'error' : success ? 'success' : variant
    
    return (
      <textarea
        className={cn(textareaVariants({ variant: textareaVariant, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'

// Select Component
export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[]
  placeholder?: string
  error?: boolean
  success?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, error, success, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 text-xs px-2.5',
      md: 'h-10',
      lg: 'h-12 px-4',
    }

    return (
      <select
        className={cn(
          'flex w-full rounded-xl border px-3 py-2 text-sm bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          sizeClasses[size],
          error && 'border-red-300 bg-red-50 focus-visible:ring-red-500',
          success && 'border-emerald-300 bg-emerald-50 focus-visible:ring-emerald-500',
          !error && !success && 'border-slate-200 focus-visible:ring-primary-500',
          className
        )}
        ref={ref}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    )
  },
)

Select.displayName = 'Select'

// Checkbox
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  error?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const inputId = id || `checkbox-${React.useId()}`

    return (
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id={inputId}
            ref={ref}
            className={cn(
              'mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0',
              error && 'border-red-300',
              className
            )}
            {...props}
          />
          {label && (
            <div className="flex-1">
              <label
                htmlFor={inputId}
                className="text-sm font-medium text-slate-700 cursor-pointer"
              >
                {label}
              </label>
              {description && (
                <p className="text-sm text-slate-500 mt-1">{description}</p>
              )}
            </div>
          )}
        </div>
        
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 ml-7">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    )
  },
)

Checkbox.displayName = 'Checkbox'

// Radio Group
export interface RadioOption {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value?: string | number
  onChange?: (value: string | number) => void
  error?: string
  className?: string
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  error,
  className,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {options.map((option) => {
        const inputId = `${name}-${option.value}`
        
        return (
          <div key={option.value} className="flex items-start gap-3">
            <input
              type="radio"
              id={inputId}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange?.(option.value)}
              disabled={option.disabled}
              className={cn(
                'mt-1 h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0',
                error && 'border-red-300'
              )}
            />
            <div className="flex-1">
              <label
                htmlFor={inputId}
                className="text-sm font-medium text-slate-700 cursor-pointer"
              >
                {option.label}
              </label>
              {option.description && (
                <p className="text-sm text-slate-500 mt-1">{option.description}</p>
              )}
            </div>
          </div>
        )
      })}
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

// Form Actions
export interface FormActionsProps {
  children: React.ReactNode
  variant?: 'horizontal' | 'vertical'
  align?: 'start' | 'center' | 'end'
  className?: string
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  variant = 'horizontal',
  align = 'start',
  className,
}) => {
  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  }

  return (
    <div className={cn(
      'pt-4',
      variant === 'horizontal' ? `flex gap-3 ${alignClasses[align]}` : 'space-y-3',
      className
    )}>
      {children}
    </div>
  )
}

// Complete Form wrapper with validation
export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  onSubmit: (data: FormData) => void | Promise<void>
  isSubmitting?: boolean
  title?: string
  description?: string
  children: React.ReactNode
}

export const Form: React.FC<FormProps> = ({
  onSubmit,
  isSubmitting = false,
  title,
  description,
  children,
  className,
  ...props
}) => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await onSubmit(formData)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
      {...props}
    >
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          )}
          {description && (
            <p className="text-slate-600">{description}</p>
          )}
        </div>
      )}
      
      <Stack gap="lg">
        {children}
      </Stack>
    </form>
  )
}