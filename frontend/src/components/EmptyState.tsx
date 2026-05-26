import React from 'react'
import { Link } from 'react-router-dom'
import { LucideIcon, ArrowRight } from 'lucide-react'
import Button from './Button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionLink?: string
  secondaryActionLabel?: string
  secondaryActionLink?: string
  illustration?: 'collection' | 'recyclables' | 'wallet' | 'reports' | 'generic'
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionLink,
  secondaryActionLabel,
  secondaryActionLink,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Icon */}
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-6">
        <Icon className="h-10 w-10" />
      </div>

      {/* Content */}
      <div className="max-w-md space-y-3">
        <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && actionLink && (
            <Link to={actionLink}>
              <Button size="lg" className="inline-flex items-center gap-2">
                {actionLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
          {secondaryActionLabel && secondaryActionLink && (
            <Link to={secondaryActionLink}>
              <Button size="lg" variant="outline" className="inline-flex items-center gap-2">
                {secondaryActionLabel}
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default EmptyState
