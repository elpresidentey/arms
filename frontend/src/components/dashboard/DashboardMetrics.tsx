/**
 * Dashboard Metrics Component
 * Modern glassmorphism metric cards with animations
 */
import React from 'react'
import { Truck, Calendar, Wallet, Recycle, Receipt, RouteIcon, TrendingUp, TrendingDown } from 'lucide-react'
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

const MetricCard: React.FC<{
  icon: React.ReactNode
  label: string
  value: string
  detail: string
  iconColor: string
  delay: string
}> = ({ icon, label, value, detail, iconColor, delay }) => {
  return (
    <div 
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Label */}
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
            {label}
          </p>

          {/* Value */}
          <p className="text-2xl font-bold text-slate-900 mb-2">
            {value}
          </p>

          {/* Detail */}
          <p className="text-sm text-slate-500 font-medium">
            {detail}
          </p>
        </div>

        {/* Icon */}
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconColor} transition-transform duration-200 group-hover:scale-105`}>
          {icon}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 h-1 w-full ${iconColor.replace('bg-', 'bg-opacity-30 bg-')}`}></div>
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
  const metricsConfig = isResident
    ? [
        {
          icon: <Truck className="h-5 w-5 text-primary-700" />,
          label: 'Last Pickup',
          value: isLoading.wasteStats ? 'Loading...' : formatShortDate(wasteStats?.lastPickup),
          detail: `${completedCollections} completed`,
          iconColor: 'bg-primary-50',
          delay: '0.05s',
        },
        {
          icon: <Calendar className="h-5 w-5 text-blue-700" />,
          label: 'This Month',
          value: isLoading.wasteStats ? 'Loading...' : `${wasteStats?.thisMonth || 0}`,
          detail: `${pendingCollections} pending`,
          iconColor: 'bg-blue-50',
          delay: '0.1s',
        },
        {
          icon: <Wallet className="h-5 w-5 text-amber-700" />,
          label: 'Balance',
          value: isLoading.balance ? 'Loading...' : formatCurrency(balance?.balance || 0),
          detail: `${walletSummary?.transactionCount ?? 0} transactions`,
          iconColor: 'bg-amber-50',
          delay: '0.15s',
        },
        {
          icon: <Recycle className="h-5 w-5 text-emerald-700" />,
          label: 'Recycling',
          value: isLoading.recyclables ? 'Loading...' : formatCurrency(valuationSummary?.totalEstimated || 0),
          detail: `${valuationSummary?.pendingItems ?? pendingRecyclables} pending`,
          iconColor: 'bg-emerald-50',
          delay: '0.2s',
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
          delay: '0.25s',
        },
      ]
    : [
        {
          icon: <Truck className="h-5 w-5 text-primary-700" />,
          label: 'Last Pickup',
          value: isLoading.wasteStats ? 'Loading...' : formatShortDate(wasteStats?.lastPickup),
          detail: `${completedCollections} completed`,
          iconColor: 'bg-primary-50',
          delay: '0.05s',
        },
        {
          icon: <Calendar className="h-5 w-5 text-blue-700" />,
          label: 'This Month',
          value: isLoading.wasteStats ? 'Loading...' : `${wasteStats?.thisMonth || 0}`,
          detail: `${pendingCollections} pending`,
          iconColor: 'bg-blue-50',
          delay: '0.1s',
        },
        {
          icon: <RouteIcon className="h-5 w-5 text-indigo-700" />,
          label: 'Routes Today',
          value: `${routeSummary?.dueToday ?? 0}`,
          detail: `${routeSummary?.disruptedRoutes ?? 0} disrupted`,
          iconColor: 'bg-indigo-50',
          delay: '0.15s',
        },
        {
          icon: <Recycle className="h-5 w-5 text-emerald-700" />,
          label: 'Recycling',
          value: isLoading.recyclables ? 'Loading...' : `${pendingRecyclables}`,
          detail: 'awaiting pickup',
          iconColor: 'bg-emerald-50',
          delay: '0.2s',
        },
      ]

  return (
    <section 
      className={`grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 ${
        isResident ? 'xl:grid-cols-5' : 'xl:grid-cols-4'
      }`}
    >
      {metricsConfig.map((metric, index) => (
        <MetricCard
          key={metric.label}
          icon={metric.icon}
          label={metric.label}
          value={metric.value}
          detail={metric.detail}
          iconColor={metric.iconColor}
          delay={metric.delay}
        />
      ))}
    </section>
  )
}

export default DashboardMetrics