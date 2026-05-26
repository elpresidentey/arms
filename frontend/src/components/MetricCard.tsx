import React from 'react'
import clsx from 'clsx'
import {
  CardIconAccent,
  CARD_ICON_ACCENTS,
  resolveCardAccent,
} from '../utils/cardIconColors'

interface MetricCardProps {
  label: string
  value: React.ReactNode
  detail?: string
  icon: React.ReactNode
  accent?: CardIconAccent | string
  className?: string
  compact?: boolean
  trend?: {
    value: number
    isPositive: boolean
  }
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  detail,
  icon,
  accent = 'forest',
  className,
  compact = false,
  trend,
}) => {
  const resolved = resolveCardAccent(accent)
  const styles = CARD_ICON_ACCENTS[resolved]

  return (
    <article
      className={clsx(
        'metric-panel group stagger-enter',
        compact ? 'p-4' : 'p-4 sm:p-5',
        className,
      )}
    >
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="card-label">{label}</p>
          <p className={compact ? 'card-value-compact' : 'card-value'}>
            {value}
          </p>
          {detail && (
            <p className="card-detail">
              {detail}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 pt-1">
              <span
                className={clsx(
                  'inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-full badge-text shadow-sm',
                  trend.isPositive 
                    ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/50' 
                    : 'bg-rose-100 text-rose-700 ring-1 ring-rose-200/50',
                )}
              >
                <span className="text-sm font-bold">{trend.isPositive ? '+' : '-'}</span>
                {Math.abs(trend.value)}%
              </span>
              <span className="caption">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={clsx(
            'flex shrink-0 items-center justify-center rounded-xl border shadow-sm transition-colors duration-200',
            compact ? 'h-11 w-11' : 'h-12 w-12',
            styles.container,
            styles.hover,
          )}
        >
          {icon}
        </div>
      </div>
    </article>
  )
}

export default MetricCard
