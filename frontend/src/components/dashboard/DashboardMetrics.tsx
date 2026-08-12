/**
 * Dashboard Metrics — refined metric cards with consistent accents
 */
import React from 'react'
import { Truck, Calendar, Wallet, Recycle, Receipt, RouteIcon } from 'lucide-react'
import MetricCard from '../MetricCard'
import { formatCurrency, formatShortDate } from '../../utils/format'
import type { CardIconAccent } from '../../utils/cardIconColors'

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
  key: string
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  detail: string
  accent: CardIconAccent
  loading?: boolean
}

const LoadingMetric: React.FC<{ label: string; accent: CardIconAccent; icon: React.ReactNode }> = ({
  label,
  accent,
  icon,
}) => (
  <MetricCard
    label={label}
    value={
      <span className="inline-block h-8 w-24 animate-pulse rounded-md bg-slate-100" aria-hidden="true" />
    }
    detail="Loading…"
    icon={icon}
    accent={accent}
  />
)

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
          key: 'last-pickup',
          icon: <Truck className="h-5 w-5" />,
          label: 'Last pickup',
          value: formatShortDate(wasteStats?.lastPickup),
          detail: `${completedCollections} completed records`,
          accent: 'forest',
          loading: isLoading.wasteStats,
        },
        {
          key: 'this-month',
          icon: <Calendar className="h-5 w-5" />,
          label: 'This month',
          value: `${wasteStats?.thisMonth || 0}`,
          detail: `${pendingCollections} scheduled or active`,
          accent: 'sky',
          loading: isLoading.wasteStats,
        },
        {
          key: 'wallet',
          icon: <Wallet className="h-5 w-5" />,
          label: 'Wallet balance',
          value: formatCurrency(balance?.balance || 0),
          detail: `${walletSummary?.transactionCount ?? 0} wallet transactions`,
          accent: 'amber',
          loading: isLoading.balance,
        },
        {
          key: 'recycling',
          icon: <Recycle className="h-5 w-5" />,
          label: 'Recycling value',
          value: formatCurrency(valuationSummary?.totalEstimated || 0),
          detail: `${valuationSummary?.pendingItems ?? pendingRecyclables} pending items`,
          accent: 'emerald',
          loading: isLoading.recyclables,
        },
        {
          key: 'bills',
          icon: <Receipt className="h-5 w-5" />,
          label: 'Bills',
          value:
            (billsSummary?.payableBillsCount || 0) > 0
              ? formatCurrency(billsSummary?.totalDue || 0)
              : 'Paid up',
          detail:
            (billsSummary?.payableBillsCount || 0) > 0
              ? `${billsSummary?.payableBillsCount} outstanding`
              : `${billsSummary?.paidBillsCount || 0} paid`,
          accent: 'rose',
        },
      ]
    : [
        {
          key: 'last-pickup',
          icon: <Truck className="h-5 w-5" />,
          label: 'Last pickup',
          value: formatShortDate(wasteStats?.lastPickup),
          detail: `${completedCollections} completed records`,
          accent: 'forest',
          loading: isLoading.wasteStats,
        },
        {
          key: 'this-month',
          icon: <Calendar className="h-5 w-5" />,
          label: 'This month',
          value: `${wasteStats?.thisMonth || 0}`,
          detail: `${pendingCollections} scheduled or active`,
          accent: 'sky',
          loading: isLoading.wasteStats,
        },
        {
          key: 'routes',
          icon: <RouteIcon className="h-5 w-5" />,
          label: 'Routes today',
          value: `${routeSummary?.dueToday ?? 0}`,
          detail: `${routeSummary?.disruptedRoutes ?? 0} disrupted`,
          accent: 'indigo',
        },
        {
          key: 'recycling',
          icon: <Recycle className="h-5 w-5" />,
          label: 'Recycling queue',
          value: `${pendingRecyclables}`,
          detail: 'Awaiting pickup',
          accent: 'emerald',
          loading: isLoading.recyclables,
        },
      ]

  return (
    <section
      className={`grid grid-cols-1 gap-3.5 sm:gap-4 @sm:grid-cols-2 ${
        isResident ? '@3xl:grid-cols-3 @7xl:grid-cols-5' : '@5xl:grid-cols-4'
      }`}
    >
      {metricsConfig.map((metric) =>
        metric.loading ? (
          <LoadingMetric
            key={metric.key}
            label={metric.label}
            accent={metric.accent}
            icon={metric.icon}
          />
        ) : (
          <MetricCard
            key={metric.key}
            label={metric.label}
            value={metric.value}
            detail={metric.detail}
            icon={metric.icon}
            accent={metric.accent}
          />
        ),
      )}
    </section>
  )
}

export default DashboardMetrics
