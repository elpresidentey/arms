import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Receipt, History } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import PageHeader from '../components/PageHeader'
import StatePanel from '../components/StatePanel'
import Surface from '../components/Surface'
import BillReceipt from '../components/billing/BillReceipt'
import BillPaymentSection from '../components/billing/BillPaymentSection'
import BillStatusBadge from '../components/billing/BillStatusBadge'
import PayBillButton from '../components/billing/PayBillButton'
import { usePayBill } from '../hooks/usePayBill'
import { billingApi } from '../services/api'
import { Bill } from '../types'
import { getErrorMessage } from '../utils/errors'
import { formatCurrency } from '../utils/format'
import { formatBillingDate, formatBillingPeriod, propertyTypeLabel } from '../utils/billingFormat'
import { summarizeBills } from '../utils/bills'

const Bills: React.FC = () => {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const { payBill, isPaying } = usePayBill()

  const { data: bills, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['my-bills', user?.id],
    queryFn: billingApi.getMyBills,
    retry: 1,
    enabled: Boolean(user?.id),
  })

  const {
    payableBills,
    paidBills,
    totalDue,
    nextBill,
  } = React.useMemo(() => summarizeBills(bills), [bills])

  useEffect(() => {
    if (searchParams.get('pay') !== '1' || !nextBill || isPaying) {
      return
    }
    payBill(nextBill)
    setSearchParams({}, { replace: true })
  }, [searchParams, nextBill, isPaying, payBill, setSearchParams])

  const loadErrorMessage = getErrorMessage(
    error,
    'Your billing history is temporarily unavailable.',
  )

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Pay bills"
          title="Pay your refuse bill"
          description="Confirm your residence, pick your bill, and pay in one simple flow"
        />
        <StatePanel
          tone="error"
          title="Couldn't load bills"
          description={loadErrorMessage}
          action={
            <button type="button" onClick={() => refetch()} className="btn btn-primary h-11 mt-4">
              Try again
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="page-container pb-20 lg:pb-6">
      {isLoading ? (
        <StatePanel tone="loading" title="Loading your bills" description="Getting your residence and billing details." />
      ) : user ? (
        <>
          <BillPaymentSection
            user={user}
            bills={bills ?? []}
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
          />
          
          {/* Next Billing Cycle Info */}
          <Surface
            title="Next billing cycle"
            subtitle="Your upcoming monthly bill"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4">
                <p className="text-sm font-medium text-blue-900 mb-1">Billing Period</p>
                <p className="text-xl font-bold text-blue-900">
                  {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-NG', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </p>
              </div>
              <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-4">
                <p className="text-sm font-medium text-purple-900 mb-1">Expected Amount</p>
                <p className="text-xl font-bold text-purple-900">
                  {formatCurrency(user.propertyType === 'commercial' ? 3500 : 2000)}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  {user.propertyType === 'commercial' ? 'Commercial rate' : 'Residential rate'}
                </p>
              </div>
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-4">
                <p className="text-sm font-medium text-indigo-900 mb-1">Due Date</p>
                <p className="text-xl font-bold text-indigo-900">
                  {(() => {
                    const nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                    const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0)
                    const dueDate = new Date(lastDay)
                    dueDate.setDate(dueDate.getDate() + 7)
                    return dueDate.toLocaleDateString('en-NG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  })()}
                </p>
                <p className="text-xs text-indigo-700 mt-1">7 days after month end</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-700">
                <strong>Note:</strong> Bills are generated at the beginning of each month. Pay before the due date to avoid a 10% late fee.
              </p>
            </div>
          </Surface>
        </>
      ) : null}

      {paidBills.length > 0 && (
        <Surface
          title="Payment history"
          subtitle="Paid bills and receipts"
          action={
            <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
              <History className="h-4 w-4" />
              {paidBills.length} paid
            </span>
          }
        >
          <div className="space-y-3">
            {paidBills.map((bill) => (
              <div
                key={bill.id}
                className="data-row flex flex-col gap-3 rounded-xl border border-slate-200/90 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">{bill.billNumber}</span>
                    <BillStatusBadge status={bill.status} />
                  </div>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatBillingPeriod(bill.billingPeriod)} — {propertyTypeLabel(bill.propertyType)}
                  </p>
                  <p className="text-sm text-slate-600">
                    Paid {bill.paidAt ? formatBillingDate(bill.paidAt) : '—'} · {formatCurrency(bill.totalAmount)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBill(bill)
                      setShowReceipt(true)
                    }}
                    className="btn btn-secondary h-10 px-4 inline-flex items-center gap-2"
                  >
                    <Receipt className="h-4 w-4" />
                    Receipt
                  </button>
                  <Link
                    to={`/app/bills/${bill.id}/receipt`}
                    className="btn btn-secondary h-10 px-4 inline-flex items-center gap-2"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Surface>
      )}

      {!isLoading && payableBills.length === 0 && paidBills.length === 0 && bills?.length === 0 && (
        <StatePanel
          tone="empty"
          title="No bills yet"
          description="When your monthly refuse bill is ready, you'll pay it here — residence, bill type, then one tap to pay."
        />
      )}

      {showReceipt && selectedBill && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <BillReceipt bill={selectedBill} customer={user} onClose={() => setShowReceipt(false)} />
          </div>
        </div>
      )}

      {nextBill && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 p-3 shadow-[0_-6px_24px_rgba(31,46,29,0.1)] backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500">Ready to pay</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(totalDue)}</p>
            </div>
            <PayBillButton bill={nextBill} size="lg" showAmount className="shrink-0" />
          </div>
        </div>
      )}
    </div>
  )
}

export default Bills
