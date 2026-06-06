/**
 * MobileOperations - Mobile-first operational interface components
 */
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { 
  ChevronRight, 
  MoreVertical, 
  Check, 
  X, 
  Clock, 
  MapPin,
  Phone,
  User,
  AlertTriangle,
  Truck
} from 'lucide-react'
import { cn } from '../utils'
import { Button } from '../primitives/Button'
import { Badge } from '../primitives/Badge'
import { Stack, Inline } from '../layouts/MobileLayout'

// Action Sheet for mobile operations
export interface ActionSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  actions: Array<{
    label: string
    icon?: React.ReactNode
    variant?: 'default' | 'destructive' | 'success'
    onClick: () => void
  }>
  children?: React.ReactNode
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  title,
  actions,
  children,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Action Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="px-4 pb-2">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        </div>

        {/* Content */}
        <div className="overflow-y-auto">
          {children && (
            <div className="px-4 py-4 border-b border-slate-200">
              {children}
            </div>
          )}
          
          {/* Actions */}
          <div className="p-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick()
                  onClose()
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-4 text-left rounded-xl transition-colors',
                  action.variant === 'destructive' && 'text-red-600 hover:bg-red-50',
                  action.variant === 'success' && 'text-emerald-600 hover:bg-emerald-50',
                  (!action.variant || action.variant === 'default') && 'text-slate-900 hover:bg-slate-100'
                )}
              >
                {action.icon && (
                  <div className="flex-shrink-0 w-5 h-5">
                    {action.icon}
                  </div>
                )}
                <span className="font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Safe area spacing for iOS */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </>
  )
}

// Mobile Card for operational items
const mobileCardVariants = cva(
  'bg-white border border-slate-200 rounded-xl p-4 transition-all active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'hover:border-slate-300 hover:shadow-sm',
        interactive: 'cursor-pointer hover:border-primary-200 hover:shadow-md hover:-translate-y-0.5',
        urgent: 'border-amber-200 bg-amber-50/50',
        overdue: 'border-red-200 bg-red-50/50',
        completed: 'border-emerald-200 bg-emerald-50/50',
      },
      size: {
        compact: 'p-3',
        default: 'p-4',
        spacious: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface MobileCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mobileCardVariants> {
  title: string
  subtitle?: string
  status?: {
    label: string
    variant: 'default' | 'success' | 'warning' | 'error'
  }
  metadata?: Array<{
    icon: React.ReactNode
    label: string
    value: string
  }>
  actions?: Array<{
    label: string
    icon?: React.ReactNode
    onClick: () => void
  }>
  onTap?: () => void
}

export const MobileCard: React.FC<MobileCardProps> = ({
  className,
  variant,
  size,
  title,
  subtitle,
  status,
  metadata = [],
  actions = [],
  onTap,
  children,
  ...props
}) => {
  const [showActions, setShowActions] = React.useState(false)

  return (
    <>
      <div
        className={cn(mobileCardVariants({ variant, size, className }))}
        onClick={onTap}
        {...props}
      >
        <Stack gap="sm">
          {/* Header */}
          <Inline justify="between" align="start">
            <Stack gap="xs">
              <h3 className="font-semibold text-slate-900 leading-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-slate-600">{subtitle}</p>
              )}
            </Stack>
            
            <Inline gap="sm" align="center">
              {status && (
                <Badge variant={status.variant} size="sm">
                  {status.label}
                </Badge>
              )}
              
              {actions.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowActions(true)
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              )}
              
              {onTap && (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </Inline>
          </Inline>

          {/* Content */}
          {children}

          {/* Metadata */}
          {metadata.length > 0 && (
            <Stack gap="xs">
              {metadata.map((item, index) => (
                <Inline key={index} gap="xs" align="center">
                  <div className="text-slate-400 w-4 h-4">
                    {item.icon}
                  </div>
                  <span className="text-xs text-slate-600 font-medium">
                    {item.label}:
                  </span>
                  <span className="text-xs text-slate-900">
                    {item.value}
                  </span>
                </Inline>
              ))}
            </Stack>
          )}
        </Stack>
      </div>

      {/* Action Sheet */}
      <ActionSheet
        isOpen={showActions}
        onClose={() => setShowActions(false)}
        title={title}
        actions={actions}
      />
    </>
  )
}

// Mobile Status Bar for operational status
export interface MobileStatusBarProps {
  items: Array<{
    label: string
    value: string | number
    icon: React.ReactNode
    variant?: 'default' | 'success' | 'warning' | 'error'
  }>
}

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({ items }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, index) => (
          <div key={index} className="text-center">
            <Inline gap="xs" justify="center" align="center">
              <div className={cn(
                'w-4 h-4',
                item.variant === 'success' && 'text-emerald-600',
                item.variant === 'warning' && 'text-amber-600',
                item.variant === 'error' && 'text-red-600',
                (!item.variant || item.variant === 'default') && 'text-slate-600'
              )}>
                {item.icon}
              </div>
              <span className="text-xs text-slate-600 font-medium">
                {item.label}
              </span>
            </Inline>
            <div className={cn(
              'text-lg font-bold mt-1',
              item.variant === 'success' && 'text-emerald-900',
              item.variant === 'warning' && 'text-amber-900',
              item.variant === 'error' && 'text-red-900',
              (!item.variant || item.variant === 'default') && 'text-slate-900'
            )}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Mobile Quick Actions
export interface MobileQuickActionsProps {
  actions: Array<{
    label: string
    icon: React.ReactNode
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
    disabled?: boolean
  }>
  layout?: 'horizontal' | 'grid'
}

export const MobileQuickActions: React.FC<MobileQuickActionsProps> = ({
  actions,
  layout = 'horizontal',
}) => {
  const containerClass = layout === 'grid' && actions.length > 2
    ? 'grid grid-cols-2 gap-3'
    : 'flex gap-3 overflow-x-auto pb-2'

  return (
    <div className={containerClass}>
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'primary'}
          size="lg"
          onClick={action.onClick}
          disabled={action.disabled}
          className={cn(
            'flex-shrink-0 min-w-0',
            layout === 'horizontal' && 'min-w-[120px]'
          )}
          icon={action.icon}
        >
          {action.label}
        </Button>
      ))}
    </div>
  )
}

// Mobile Collection Item (specific to waste management)
export interface MobileCollectionItemProps {
  id: string
  address: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  scheduledTime: string
  customerInfo?: {
    name: string
    phone: string
  }
  specialInstructions?: string
  onUpdateStatus: (id: string, status: string) => void
  onCall?: (phone: string) => void
  onNavigate?: (address: string) => void
}

export const MobileCollectionItem: React.FC<MobileCollectionItemProps> = ({
  id,
  address,
  status,
  scheduledTime,
  customerInfo,
  specialInstructions,
  onUpdateStatus,
  onCall,
  onNavigate,
}) => {
  const statusConfig = {
    pending: { label: 'Pending', variant: 'secondary' as const },
    in_progress: { label: 'In Progress', variant: 'warning' as const },
    completed: { label: 'Completed', variant: 'success' as const },
    failed: { label: 'Failed', variant: 'error' as const },
  }

  const actions = [
    ...(status === 'pending' ? [
      {
        label: 'Mark In Progress',
        icon: <Clock className="w-4 h-4" />,
        onClick: () => onUpdateStatus(id, 'in_progress'),
      }
    ] : []),
    ...(status === 'in_progress' ? [
      {
        label: 'Mark Completed',
        icon: <Check className="w-4 h-4" />,
        variant: 'success' as const,
        onClick: () => onUpdateStatus(id, 'completed'),
      },
      {
        label: 'Mark Failed',
        icon: <X className="w-4 h-4" />,
        variant: 'destructive' as const,
        onClick: () => onUpdateStatus(id, 'failed'),
      }
    ] : []),
    ...(onCall && customerInfo?.phone ? [
      {
        label: 'Call Customer',
        icon: <Phone className="w-4 h-4" />,
        onClick: () => onCall(customerInfo.phone),
      }
    ] : []),
    ...(onNavigate ? [
      {
        label: 'Navigate',
        icon: <MapPin className="w-4 h-4" />,
        onClick: () => onNavigate(address),
      }
    ] : []),
  ]

  return (
    <MobileCard
      title={address}
      subtitle={`Scheduled: ${scheduledTime}`}
      status={statusConfig[status]}
      variant={status === 'failed' ? 'overdue' : status === 'completed' ? 'completed' : 'default'}
      metadata={[
        ...(customerInfo ? [
          {
            icon: <User className="w-4 h-4" />,
            label: 'Customer',
            value: customerInfo.name,
          }
        ] : []),
        {
          icon: <Truck className="w-4 h-4" />,
          label: 'ID',
          value: id,
        },
      ]}
      actions={actions}
    >
      {specialInstructions && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-800">Special Instructions</p>
            <p className="text-xs text-amber-700 mt-1">{specialInstructions}</p>
          </div>
        </div>
      )}
    </MobileCard>
  )
}