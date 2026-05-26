import { Link } from 'react-router-dom'
import { AlertCircle, ArrowRight, CheckCircle2, Clock, Receipt } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import MetricCard from '../components/MetricCard'
import PageHeader from '../components/PageHeader'
import StatePanel from '../components/StatePanel'
import Surface from '../components/Surface'
import { billingApi, walletApi } from '../services/api'
import { PATHS } from '../routes/paths'
import { formatCurrency, formatDayTime } from '../utils/format'

export const FinanceDashboard = () => {
  const {
    data: billingStats,
    isLoading: isBillingLoading,
    isError: isBillingError,
  } = useQuery({
    queryKey: ['billing-stats'],
    queryFn: billingApi.getStatistics,
  })

  const {
    data: withdrawals,
    isLoading: isWithdrawalsLoading,
    isError: isWithdrawalsError,
  } = useQuery({
    queryKey: ['finance-withdrawals'],
    queryFn: walletApi.getWithdrawals,
  })

  const pendingWithdrawals = withdrawals?.filter((item) => item.status === 'pending') ?? []
  const completedWithdrawals = withdrawals?.filter((item) => item.status === 'completed') ?? []
  const pendingAmount = pendingWithdrawals.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const recentWithdrawals = withdrawals?.slice(0, 6) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Finance control room"
        description="Review billing revenue, outstanding refuse bills, and resident wallet withdrawal approvals from one place."
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          accent="forest"
          label="Revenue collected"
          value={isBillingLoading ? 'Loading' : formatCurrency(billingStats?.totalRevenue ?? 0)}
          detail={`${billingStats?.paid ?? 0} paid bills`}
          icon={<Receipt className="h-5 w-5" />}
        />
        <MetricCard
          accent="amber"
          label="Outstanding bills"
          value={isBillingLoading ? 'Loading' : formatCurrency(billingStats?.pendingRevenue ?? 0)}
          detail={`${(billingStats?.pending ?? 0) + (billingStats?.overdue ?? 0)} bills unpaid`}
          icon={<AlertCircle className="h-5 w-5" />}
        />
        <MetricCard
          accent="violet"
          label="Pending withdrawals"
          value={formatCurrency(pendingAmount)}
          detail={`${pendingWithdrawals.length} requests awaiting review`}
          icon={<Clock className="h-5 w-5" />}
        />
        <MetricCard
          accent="emerald"
          label="Completed withdrawals"
          value={completedWithdrawals.length}
          detail="approved and processed"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Surface
          title="Billing actions"
          subtitle="Issue bills, apply late fees, and review resident bill payments."
          action={
            <Link to={PATHS.appBillingAdmin} className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700">
              Open billing
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          {isBillingError ? (
            <StatePanel tone="error" title="Billing unavailable" description="Could not load billing statistics." />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <FinanceStat label="Total bills" value={billingStats?.totalBills ?? 0} />
              <FinanceStat label="Overdue" value={billingStats?.overdue ?? 0} />
              <FinanceStat label="Pending" value={billingStats?.pending ?? 0} />
              <FinanceStat label="Paid" value={billingStats?.paid ?? 0} />
            </div>
          )}
        </Surface>

        <Surface
          title="Withdrawal approvals"
          subtitle="Wallet withdrawal requests that finance needs to review."
          action={
            <Link to={PATHS.appWithdrawals} className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700">
              Review withdrawals
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          {isWithdrawalsError ? (
            <StatePanel tone="error" title="Withdrawals unavailable" description="Could not load wallet withdrawal records." />
          ) : isWithdrawalsLoading ? (
            <StatePanel tone="loading" title="Loading withdrawals" description="Fetching withdrawal queue." />
          ) : recentWithdrawals.length === 0 ? (
            <StatePanel title="No withdrawal activity" description="Resident wallet withdrawals will appear here." />
          ) : (
            <div className="space-y-3">
              {recentWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {withdrawal.user
                        ? `${withdrawal.user.firstName} ${withdrawal.user.lastName}`
                        : 'Resident withdrawal'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{formatDayTime(withdrawal.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(withdrawal.amount)}</p>
                    <p className="mt-1 text-xs capitalize text-slate-500">{withdrawal.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Surface>
      </section>
    </div>
  )
}

const FinanceStat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
  </div>
)
