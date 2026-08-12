/**
 * Dashboard Metrics Component
 * Modern glassmorphism metric cards with animations
 */
import React from 'react'
import { Truck, Calendar, Wallet, Recycle, Receipt, RouteIcon } from 'lucide-react'
import { formatCurrency, formatShortDate } from '../../utils/format'

interface DashboardMetricsProps {
  isResident: boolean
  wasteStats?: {
    lastPickup?: string
    thisMonth?: number
  }
  balance?: {
    balance: number
  }
  walletSummary?: {
    transactionCount: number
  }
  valuationSummary?: {
    totalEstimated: number
    pendingItems: number
  }
  routeSummary?: {
    dueToday: number
    disruptedRoutes: number
  }
  billsSummary?: {
    totalDue: number
    payableBillsCount: number
    paidBillsCount: number
  }
  completedCollections: number
  pendingCollections: number
  pendingRecyclables: number
  isLoading?: {
    wasteStats?: boolean
    balance?: boolean
    recyclables?: boolean
  }
}

interface MetricConfig {
  icon: React.ReactNode
  label: string
  value: string
  detail: string
  iconColor: string
  accent: string
  delay: string
  loading?: boolean
}

const MetricCard: React.FC<MetricConfig> = ({
  icon,
  label,
  value,
  detail,
  iconColor,
  accent,
  delay,
  loading = false,
}) => {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Label */}
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
            {label}
          </p>

          {loading ? (
            /* Skeleton loading state */
            <div className="space-y-2.5">
              <div className="h-7 w-28 rounded-md bg-slate-100 animate-pulse" />
              <div className="h-3.5 w-20 rounded-md bg-slate-100 animate-pulse" />
            </div>
          ) : (
            <>
              {/* Value */}
              <p className="text-2xl font-bold text-slate-900 tabular-nums mb-2">
                {value}
              </p>

              {/* Detail */}
              <p className="text-sm text-slate-500 font-medium">
                {detail}
              </p>
            </>
          )}
        </div>

        {/* Icon */}
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconColor} transition-transform duration-200 group-hover:scale-105`}>
          {icon}
        </div>
      </div>

      {/* Bottom accent line - expands on hover */}
      <div className="absolute bottom-0 left-0 h-[3px] w-full bg-slate-100"></div>
      <div className={`absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r ${accent} transition-all duration-500 ease-smooth-out group-hover:w-full`}></div>
    </div>
  )
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  isResident,
  wasteStats,
  balance,
  walletSummary,
  valuationSummary,
  routeSummary,
  billsSummary,
  completedCollections,
  pendingCollections,
  pendingRecyclables,
  isLoading = {},
}) => {
  const metricsConfig: MetricConfig[] = isResident
    ? [
        {
          icon: <Truck className="h-5 w-5 text-primary-700" />,
          label: 'Last Pickup',
          value: formatShortDate(wasteStats?.lastPickup),
          detail: `${completedCollections} completed`,
          iconColor: 'bg-primary-50',
          accent: 'from-primary-500 to-primary-300',
          delay: '0.05s',
          loading: isLoading.wasteStats,
        },
        {
          icon: <Calendar className="h-5 w-5 text-blue-700" />,
          label: 'This Month',
          value: `${wasteStats?.thisMonth || 0}`,
          detail: `${pendingCollections} pending`,
          iconColor: 'bg-blue-50',
          accent: 'from-blue-500 to-blue-300',
          delay: '0.1s',
          loading: isLoading.wasteStats,
        },
        {
          icon: <Wallet className="h-5 w-5 text-amber-700" />,
          label: 'Balance',
          value: formatCurrency(balance?.balance || 0),
          detail: `${walletSummary?.transactionCount ?? 0} transactions`,
          iconColor: 'bg-amber-50',
          accent: 'from-amber-500 to-amber-300',
          delay: '0.15s',
          loading: isLoading.balance,
        },
        {
          icon: <Recycle className="h-5 w-5 text-emerald-700" />,
          label: 'Recycling',
          value: formatCurrency(valuationSummary?.totalEstimated || 0),
          detail: `${valuationSummary?.pendingItems ?? pendingRecyclables} pending`,
          iconColor: 'bg-emerald-50',
          accent: 'from-emerald-500 to-emerald-300',
          delay: '0.2s',
          loading: isLoading.recyclables,
        },
        {
          icon: <Receipt className="h-5 w-5 text-rose-700" />,
          label: 'Bills',
          value: (billsSummary?.payableBillsCount || 0) > 0
            ? formatCurrency(billsSummary?.totalDue || 0)
            : 'Paid Up',
          detail: (billsSummary?.payableBillsCount || 0) > 0
            ? `${billsSummary?.payableBillsCount} outstanding`
            : `${billsSummary?.paidBillsCount || 0} paid`,
          iconColor: 'bg-rose-50',
          accent: 'from-rose-500 to-rose-300',
          delay: '0.25s',
        },
      ]
    : [
        {
          icon: <Truck className="h-5 w-5 text-primary-700" />,
          label: 'Last Pickup',
          value: formatShortDate(wasteStats?.lastPickup),
          detail: `${completedCollections} completed`,
          iconColor: 'bg-primary-50',
          accent: 'from-primary-500 to-primary-300',
          delay: '0.05s',
          loading: isLoading.wasteStats,
        },
        {
          icon: <Calendar className="h-5 w-5 text-blue-700" />,
          label: 'This Month',
          value: `${wasteStats?.thisMonth || 0}`,
          detail: `${pendingCollections} pending`,
          iconColor: 'bg-blue-50',
          accent: 'from-blue-500 to-blue-300',
          delay: '0.1s',
          loading: isLoading.wasteStats,
        },
        {
          icon: <RouteIcon className="h-5 w-5 text-indigo-700" />,
          label: 'Routes Today',
          value: `${routeSummary?.dueToday ?? 0}`,
          detail: `${routeSummary?.disruptedRoutes ?? 0} disrupted`,
          iconColor: 'bg-indigo-50',
          accent: 'from-indigo-500 to-indigo-300',
          delay: '0.15s',
        },
        {
          icon: <Recycle className="h-5 w-5 text-emerald-700" />,
          label: 'Recycling',
          value: `${pendingRecyclables}`,
          detail: 'awaiting pickup',
          iconColor: 'bg-emerald-50',
          accent: 'from-emerald-500 to-emerald-300',
          delay: '0.2s',
          loading: isLoading.recyclables,
        },
      ]

  return (
    <section
      className={`grid grid-cols-1 gap-4 sm:gap-5 @sm:grid-cols-2 ${
        isResident ? '@3xl:grid-cols-3 @7xl:grid-cols-5' : '@5xl:grid-cols-4'
      }`}
    >
      {metricsConfig.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </section>
  )
}

export default DashboardMetrics