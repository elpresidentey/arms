import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import StatePanel from '../components/StatePanel'
import Surface from '../components/Surface'
import MetricCard from '../components/MetricCard'
import AdminBillIssuePanel from '../components/billing/AdminBillIssuePanel'
import { billingApi } from '../services/api'
import { Bill, BillPayment } from '../types'
import { getErrorMessage } from '../utils/errors'
import { formatCurrency } from '../utils/format'
import {
  formatBillingDate,
  formatBillingPeriod,
  propertyTypeLabel,
} from '../utils/billingFormat'

const paymentStatusStyles: Record<BillPayment['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  success: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-slate-100 text-slate-600',
}

const AdminBilling = () => {
  const queryClient = useQueryClient()
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [billFilter, setBillFilter] = useState('all')
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  const { data: stats } = useQuery({
    queryKey: ['billing-stats'],
    queryFn: billingApi.getStatistics,
  })

  const { data: bills, isLoading: billsLoading } = useQuery({
    queryKey: ['all-bills', billFilter],
    queryFn: () => billingApi.getAllBills(billFilter === 'all' ? undefined : billFilter),
  })

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['all-bill-payments', paymentFilter],
    queryFn: () => billingApi.getAllPayments(paymentFilter === 'all' ? undefined : paymentFilter),
  })

  const lateFeesMutation = useMutation({
    mutationFn: () => billingApi.applyLateFees(),
    onSuccess: (data: Bill[]) => {
      toast.success(`Updated ${data.length} overdue bill(s)`)
      queryClient.invalidateQueries({ queryKey: ['all-bills'] })
      queryClient.invalidateQueries({ queryKey: ['my-bills'] })
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] })
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not apply late fees')),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => billingApi.approvePayment(id),
    onSuccess: () => {
      toast.success('Payment approved')
      queryClient.invalidateQueries({ queryKey: ['all-bill-payments'] })
      queryClient.invalidateQueries({ queryKey: ['all-bills'] })
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] })
      queryClient.invalidateQueries({ queryKey: ['my-bills'] })
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not approve payment')),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => billingApi.rejectPayment(id, reason),
    onSuccess: () => {
      toast.success('Payment rejected')
      setRejectingId(null)
      setRejectReason('')
      queryClient.invalidateQueries({ queryKey: ['all-bill-payments'] })
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not reject payment')),
  })

  const pendingPayments = payments?.filter((payment) => payment.status === 'pending') ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Bill payments oversight"
        description="Issue refuse bills to residents, review every payment, and approve or reject pending transactions"
        action={
          <button
            type="button"
            onClick={() => lateFeesMutation.mutate()}
            disabled={lateFeesMutation.isPending}
            className="btn btn-secondary h-11"
          >
            Apply late fees
          </button>
        }
      />

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard
            compact
            accent="indigo"
            label="Total bills"
            value={stats.totalBills}
            icon={<FileText className="h-5 w-5" />}
          />
          <MetricCard
            compact
            accent="amber"
            label="Outstanding"
            value={stats.pending + stats.overdue}
            icon={<AlertCircle className="h-5 w-5" />}
          />
          <MetricCard
            compact
            accent="emerald"
            label="Paid"
            value={stats.paid}
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          <MetricCard
            compact
            accent="forest"
            label="Revenue collected"
            value={formatCurrency(stats.totalRevenue)}
            icon={<CircleDollarSign className="h-5 w-5" />}
          />
        </div>
      )}

      <AdminBillIssuePanel />

      <Surface
        title="Payment approvals"
        subtitle={`${pendingPayments.length} pending - approve or reject before closing`}
        action={
          <select
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">All payments</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        }
      >
        {paymentsLoading ? (
          <StatePanel tone="loading" title="Loading payments" description="Fetching payment records." />
        ) : !payments?.length ? (
          <StatePanel tone="empty" title="No payments yet" description="Payments appear when residents pay bills." />
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${paymentStatusStyles[payment.status]}`}>
                        {payment.status}
                      </span>
                      <span className="font-mono text-xs text-slate-500">{payment.paymentReference}</span>
                    </div>
                    <p className="mt-2 font-semibold text-slate-900">
                      {payment.user
                        ? `${payment.user.firstName} ${payment.user.lastName}`
                        : 'Resident'}{' '}
                      - {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-sm text-slate-600">
                      {payment.bill
                        ? `${payment.bill.billNumber} - ${formatBillingPeriod(payment.bill.billingPeriod)}`
                        : 'Bill linked'}
                      {' - '}
                      {formatBillingDate(payment.createdAt)}
                    </p>
                  </div>
                  {payment.status === 'pending' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => approveMutation.mutate(payment.id)}
                        disabled={approveMutation.isPending}
                        className="btn btn-primary h-10 px-4 inline-flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectingId(payment.id)}
                        className="btn btn-secondary h-10 px-4 inline-flex items-center gap-1.5 text-red-700"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
                {rejectingId === payment.id && (
                  <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(event) => setRejectReason(event.target.value)}
                      placeholder="Rejection reason (optional)"
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        rejectMutation.mutate({ id: payment.id, reason: rejectReason || undefined })
                      }
                      className="btn btn-secondary h-10"
                    >
                      Confirm reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Surface>

      <Surface
        title="All resident bills"
        subtitle="Every issued refuse bill and its status"
        action={
          <select
            value={billFilter}
            onChange={(event) => setBillFilter(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="paid">Paid</option>
          </select>
        }
      >
        {billsLoading ? (
          <StatePanel tone="loading" title="Loading bills" description="Fetching bills." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-2">Bill</th>
                  <th className="pb-2">Resident</th>
                  <th className="pb-2">Period</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bills?.map((bill) => (
                  <tr key={bill.id}>
                    <td className="py-2 font-mono text-xs">{bill.billNumber}</td>
                    <td className="py-2">
                      {bill.user ? `${bill.user.firstName} ${bill.user.lastName}` : bill.userId.slice(0, 8)}
                    </td>
                    <td className="py-2">{formatBillingPeriod(bill.billingPeriod)}</td>
                    <td className="py-2">{propertyTypeLabel(bill.propertyType)}</td>
                    <td className="py-2 font-semibold">{formatCurrency(bill.totalAmount)}</td>
                    <td className="py-2 capitalize">{bill.status}</td>
                    <td className="py-2">{formatBillingDate(bill.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Surface>
    </div>
  )
}

export default AdminBilling
