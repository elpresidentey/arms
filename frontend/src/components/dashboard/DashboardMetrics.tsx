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
  gradient: string
  delay: string
}> = ({ icon, label, value, detail, gradient, delay }) => {
  return (
    <div 
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-105 animate-fade-in-up`}
      style={{ animationDelay: delay }}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      
      {/* Animated gradient orb */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-transform duration-700 group-hover:scale-150"></div>
      
      <div className="relative z-10">
        {/* Icon */}
        <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-white/20 p-3 backdrop-blur-sm shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
          <div className="text-white">
            {icon}
          </div>
        </div>

        {/* Label */}
        <h3 className="text-sm font-semibold text-white/90 mb-2 tracking-wide">
          {label}
        </h3>

        {/* Value */}
        <p className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
          {value}
        </p>

        {/* Detail */}
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-white/60"></div>
          <p className="text-xs text-white/80 font-medium">
            {detail}
          </p>
        </div>

        {/* Hover effect line */}
        <div className="absolute bottom-0 left-0 h-1 w-0 bg-white/40 transition-all duration-500 group-hover:w-full"></div>
      </div>
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
          icon: <Truck className="h-6 w-6" />,
          label: 'Last Pickup',
          value: isLoading.wasteStats ? 'Loading...' : formatShortDate(wasteStats?.lastPickup),
          detail: `${completedCollections} completed`,
          gradient: 'from-teal-500 to-cyan-600',
          delay: '0.1s',
        },
        {
          icon: <Calendar className="h-6 w-6" />,
          label: 'This Month',
          value: isLoading.wasteStats ? 'Loading...' : `${wasteStats?.thisMonth || 0}`,
          detail: `${pendingCollections} pending`,
          gradient: 'from-sky-500 to-blue-600',
          delay: '0.2s',
        },
        {
          icon: <Wallet className="h-6 w-6" />,
          label: 'Balance',
          value: isLoading.balance ? 'Loading...' : formatCurrency(balance?.balance || 0),
          detail: `${walletSummary?.transactionCount ?? 0} transactions`,
          gradient: 'from-amber-500 to-orange-600',
          delay: '0.3s',
        },
        {
          icon: <Recycle className="h-6 w-6" />,
          label: 'Recycling',
          value: isLoading.recyclables ? 'Loading...' : formatCurrency(valuationSummary?.totalEstimated || 0),
          detail: `${valuationSummary?.pendingItems ?? pendingRecyclables} pending`,
          gradient: 'from-emerald-500 to-green-600',
          delay: '0.4s',
        },
        {
          icon: <Receipt className="h-6 w-6" />,
          label: 'Bills',
          value: (billsSummary?.payableBillsCount || 0) > 0 
            ? formatCurrency(billsSummary?.totalDue || 0) 
            : 'Paid Up',
          detail: (billsSummary?.payableBillsCount || 0) > 0
            ? `${billsSummary?.payableBillsCount} outstanding`
            : `${billsSummary?.paidBillsCount || 0} paid`,
          gradient: 'from-rose-500 to-pink-600',
          delay: '0.5s',
        },
      ]
    : [
        {
          icon: <Truck className="h-6 w-6" />,
          label: 'Last Pickup',
          value: isLoading.wasteStats ? 'Loading...' : formatShortDate(wasteStats?.lastPickup),
          detail: `${completedCollections} completed`,
          gradient: 'from-teal-500 to-cyan-600',
          delay: '0.1s',
        },
        {
          icon: <Calendar className="h-6 w-6" />,
          label: 'This Month',
          value: isLoading.wasteStats ? 'Loading...' : `${wasteStats?.thisMonth || 0}`,
          detail: `${pendingCollections} pending`,
          gradient: 'from-sky-500 to-blue-600',
          delay: '0.2s',
        },
        {
          icon: <RouteIcon className="h-6 w-6" />,
          label: 'Routes Today',
          value: `${routeSummary?.dueToday ?? 0}`,
          detail: `${routeSummary?.disruptedRoutes ?? 0} disrupted`,
          gradient: 'from-indigo-500 to-purple-600',
          delay: '0.3s',
        },
        {
          icon: <Recycle className="h-6 w-6" />,
          label: 'Recycling',
          value: isLoading.recyclables ? 'Loading...' : `${pendingRecyclables}`,
          detail: 'awaiting pickup',
          gradient: 'from-violet-500 to-purple-600',
          delay: '0.4s',
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
          gradient={metric.gradient}
          delay={metric.delay}
        />
      ))}
    </section>
  )
}

export default DashboardMetrics