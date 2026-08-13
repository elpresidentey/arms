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
        compact ? 'p-3.5 sm:p-4' : 'p-4 sm:p-5',
        className,
      )}
    >
      <span
        className={clsx(
          'pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r opacity-70 transition-opacity duration-200 group-hover:opacity-100',
          styles.bar,
        )}
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-3.5">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="card-label">{label}</p>
          <p className={clsx(compact ? 'card-value-compact' : 'card-value', 'tabular-nums')}>
            {value}
          </p>
          {detail && <p className="card-detail line-clamp-2">{detail}</p>}
          {trend && (
            <div className="flex items-center gap-1.5 pt-1">
              <span
                className={clsx(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  trend.isPositive
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                    : 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
                )}
              >
                <span className="font-bold">{trend.isPositive ? '+' : '−'}</span>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-[11px] text-slate-400">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={clsx(
            'flex shrink-0 items-center justify-center rounded-xl border transition-all duration-200 group-hover:scale-[1.03]',
            compact ? 'h-10 w-10' : 'h-11 w-11 sm:h-12 sm:w-12',
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
