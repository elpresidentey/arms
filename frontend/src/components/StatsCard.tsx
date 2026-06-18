import React from 'react'
import clsx from 'clsx'

interface StatsCardProps {
  title: string
  value: string
  icon: React.ReactNode
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
  trend,
  subtitle,
}) => {
  return (
    <article className="group stagger-item rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2.5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 border border-slate-200">
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100">
            <span
              className={clsx(
                'inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded',
                trend.isPositive 
                  ? 'text-emerald-700 bg-emerald-50' 
                  : 'text-rose-700 bg-rose-50',
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-slate-500">vs last month</span>
          </div>
        )}
      </div>
    </article>
  )
}

export default StatsCard
