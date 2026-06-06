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
          label: 'Last pickup',
          value: isLoading.wasteStats ? 'Loading' : formatShortDate(wasteStats?.lastPickup),
          detail: `${completedCollections} completed records`,
        },
        {
          accent: 'sky' as const,
          icon: <Calendar className="h-5 w-5" />,
          label: 'This month',
          value: isLoading.wasteStats ? 'Loading' : `${wasteStats?.thisMonth || 0}`,
          detail: `${pendingCollections} scheduled or active`,
        },
        {
          accent: 'amber' as const,
          icon: <Wallet className="h-5 w-5" />,
          label: 'Wallet balance',
          value: isLoading.balance ? 'Loading' : formatCurrency(balance?.balance || 0),
          detail: `${walletSummary?.transactionCount ?? 0} wallet transactions`,
        },
        {
          accent: 'emerald' as const,
          icon: <Recycle className="h-5 w-5" />,
          label: 'Recycling value',
          value: isLoading.recyclables ? 'Loading' : formatCurrency(valuationSummary?.totalEstimated || 0),
          detail: `${valuationSummary?.pendingItems ?? pendingRecyclables} pending items`,
        },
        {
          accent: 'rose' as const,
          icon: <Receipt className="h-5 w-5" />,
          label: 'Refuse bills',
          value: (billsSummary?.payableBillsCount || 0) > 0 
            ? formatCurrency(billsSummary?.totalDue || 0) 
            : 'Paid up',
          detail: (billsSummary?.payableBillsCount || 0) > 0
            ? `${billsSummary?.payableBillsCount} bill${(billsSummary?.payableBillsCount || 0) > 1 ? 's' : ''} outstanding`
            : `${billsSummary?.paidBillsCount || 0} paid on record`,
        },
      ]
    : [
        {
          accent: 'teal' as const,
          icon: <Truck className="h-5 w-5" />,
          label: 'Last pickup',
          value: isLoading.wasteStats ? 'Loading' : formatShortDate(wasteStats?.lastPickup),
          detail: `${completedCollections} completed records`,
        },
        {
          accent: 'sky' as const,
          icon: <Calendar className="h-5 w-5" />,
          label: 'This month',
          value: isLoading.wasteStats ? 'Loading' : `${wasteStats?.thisMonth || 0}`,
          detail: `${pendingCollections} scheduled or active`,
        },
        {
          accent: 'indigo' as const,
          icon: <RouteIcon className="h-5 w-5" />,
          label: 'Routes due today',
          value: `${routeSummary?.dueToday ?? 0}`,
          detail: `${routeSummary?.disruptedRoutes ?? 0} disrupted routes`,
        },
        {
          accent: 'violet' as const,
          icon: <Recycle className="h-5 w-5" />,
          label: 'Recycling queue',
          value: isLoading.recyclables ? 'Loading' : `${pendingRecyclables}`,
          detail: 'resident items awaiting pickup or processing',
        },
      ]

  return (
    <section 
      className={`grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 ${
        isResident ? 'xl:grid-cols-5' : 'xl:grid-cols-4'
      }`}
    >
      {metricsConfig.map((metric, index) => (
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