import React from 'react'
import clsx from 'clsx'
import {
  CardIconAccent,
  CARD_ICON_ACCENTS,
  legacyStatsCardColorMap,
  resolveCardAccent,
} from '../utils/cardIconColors'

export type StatsCardColor = CardIconAccent | keyof typeof legacyStatsCardColorMap

interface StatsCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color?: StatsCardColor
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = 'forest',
  trend,
  subtitle,
}) => {
  const resolved = resolveCardAccent(color)
  const styles = CARD_ICON_ACCENTS[resolved]

  return (
    <article className="group metric-panel stagger-item p-4 sm:p-5">
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="card-label">{title}</p>
            <p className="card-value">
              {value}
            </p>
            {subtitle && (
              <p className="card-detail">
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={clsx(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-colors duration-200',
              styles.container,
              styles.hover,
            )}
          >
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-1.5 pt-2 border-t border-slate-200/60">
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
    </article>
  )
}

export default StatsCard
