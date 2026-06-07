/**
 * Dashboard Metrics Component
 * Displays key performance indicators in a clean grid layout
 */
import React from 'react'
import { Truck, Calendar, Wallet, Recycle, Receipt, RouteIcon } from 'lucide-react'
import MetricCard from '../MetricCard'
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
          accent: 'teal' as const,
          icon: <Truck className="h-5 w-5" />,
          label: 'Last Pickup',
          value: isLoading.wasteStats ? 'Loading' : formatShortDate(wasteStats?.lastPickup),
          detail: `${completedCollections} completed`,
        },
        {
          accent: 'sky' as const,
          icon: <Calendar className="h-5 w-5" />,
          label: 'This Month',
          value: isLoading.wasteStats ? 'Loading' : `${wasteStats?.thisMonth || 0}`,
          detail: `${pendingCollections} pending`,
        },
        {
          accent: 'amber' as const,
          icon: <Wallet className="h-5 w-5" />,
          label: 'Balance',
          value: isLoading.balance ? 'Loading' : formatCurrency(balance?.balance || 0),
          detail: `${walletSummary?.transactionCount ?? 0} transactions`,
        },
        {
          accent: 'emerald' as const,
          icon: <Recycle className="h-5 w-5" />,
          label: 'Recycling',
          value: isLoading.recyclables ? 'Loading' : formatCurrency(valuationSummary?.totalEstimated || 0),
          detail: `${valuationSummary?.pendingItems ?? pendingRecyclables} pending`,
        },
        {
          accent: 'rose' as const,
          icon: <Receipt className="h-5 w-5" />,
          label: 'Bills',
          value: (billsSummary?.payableBillsCount || 0) > 0 
            ? formatCurrency(billsSummary?.totalDue || 0) 
            : 'Paid Up',
          detail: (billsSummary?.payableBillsCount || 0) > 0
            ? `${billsSummary?.payableBillsCount} outstanding`
            : `${billsSummary?.paidBillsCount || 0} paid`,
        },
      ]
    : [
        {
          accent: 'teal' as const,
          icon: <Truck className="h-5 w-5" />,
          label: 'Last Pickup',
          value: isLoading.wasteStats ? 'Loading' : formatShortDate(wasteStats?.lastPickup),
          detail: `${completedCollections} completed`,
        },
        {
          accent: 'sky' as const,
          icon: <Calendar className="h-5 w-5" />,
          label: 'This Month',
          value: isLoading.wasteStats ? 'Loading' : `${wasteStats?.thisMonth || 0}`,
          detail: `${pendingCollections} pending`,
        },
        {
          accent: 'indigo' as const,
          icon: <RouteIcon className="h-5 w-5" />,
          label: 'Routes Today',
          value: `${routeSummary?.dueToday ?? 0}`,
          detail: `${routeSummary?.disruptedRoutes ?? 0} disrupted`,
        },
        {
          accent: 'violet' as const,
          icon: <Recycle className="h-5 w-5" />,
          label: 'Recycling',
          value: isLoading.recyclables ? 'Loading' : `${pendingRecyclables}`,
          detail: 'awaiting pickup',
        },
      ]

  return (
    <section 
      className={`grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 ${
        isResident ? 'xl:grid-cols-5' : 'xl:grid-cols-4'
      }`}
    >
      {metricsConfig.map((metric) => (
        <MetricCard
          key={metric.label}
          accent={metric.accent}
          icon={metric.icon}
          label={metric.label}
          value={metric.value}
          detail={metric.detail}
        />
      ))}
    </section>
  )
}

export default DashboardMetrics