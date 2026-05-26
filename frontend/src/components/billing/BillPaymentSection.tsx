import { useEffect, useMemo, useState } from 'react'
import {
  Home,
  Building2,
  MapPin,
  Shield,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  Clock,
  Receipt,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Bill } from '../../types'
import { User } from '../../types'
import { formatCurrency } from '../../utils/format'
import {
  formatBillingDate,
  formatBillingPeriod,
  propertyTypeLabel,
  monthlyRateLabel,
  billServiceLabel,
  profilePropertyType,
} from '../../utils/billingFormat'
import { summarizeBills } from '../../utils/bills'
import { CARD_ICON_ACCENTS } from '../../utils/cardIconColors'
import PayBillButton from './PayBillButton'
import BillStatusBadge from './BillStatusBadge'

interface BillPaymentSectionProps {
  user: User
  bills: Bill[]
  onRefresh?: () => void
  isRefreshing?: boolean
}

const STEPS = [
  { id: 1, label: 'Residence' },
  { id: 2, label: 'Choose bill' },
  { id: 3, label: 'Pay' },
] as const

const BillPaymentSection = ({ user, bills, onRefresh, isRefreshing }: BillPaymentSectionProps) => {
  const { payableBills, paidBills } = useMemo(() => summarizeBills(bills), [bills])

  const [selectedBillId, setSelectedBillId] = useState('')

  useEffect(() => {
    if (payableBills.length === 0) {
      setSelectedBillId('')
      return
    }
    const stillValid = payableBills.some((b) => b.id === selectedBillId)
    if (!stillValid) {
      setSelectedBillId(payableBills[0].id)
    }
  }, [payableBills, selectedBillId])

  const selectedBill = payableBills.find((b) => b.id === selectedBillId) ?? payableBills[0]
  const residenceType = selectedBill
    ? selectedBill.propertyType
    : profilePropertyType(user.propertyType)

  const residenceLine = [user.houseNumber, user.street, user.ward].filter(Boolean).join(', ')
  const hasPayableBill = payableBills.length > 0 && !!selectedBill
  const activeStep = hasPayableBill ? 3 : 2
  const lastPaid = paidBills[0]
  const tealIcon = CARD_ICON_ACCENTS.teal

  return (
    <section className="panel-shell overflow-hidden rounded-2xl border border-slate-200/90">
      {/* Header + stepper */}
      <div className="border-b border-slate-200/80 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 px-5 py-5 text-white sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-200/90">
              Secure payment
            </p>
            <h2 className="font-display mt-1 text-xl font-bold tracking-tight sm:text-2xl">
              Pay your refuse bill
            </h2>
            <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-primary-100/90">
              Card or bank transfer via Paystack. Your receipt is saved automatically.
            </p>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm font-medium transition-all hover:bg-white/20 active:scale-[0.98] disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>

        <nav aria-label="Payment steps" className="mt-5 flex items-center gap-1 sm:gap-2">
          {STEPS.map((step, index) => {
            const isComplete = step.id < activeStep
            const isCurrent = step.id === activeStep
            return (
              <div key={step.id} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isComplete
                      ? 'bg-white text-primary-800'
                      : isCurrent
                        ? 'bg-primary-300 text-primary-950 ring-2 ring-white/40'
                        : 'bg-white/15 text-primary-100'
                  }`}
                >
                  {isComplete ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                </div>
                <span
                  className={`hidden truncate text-xs font-medium sm:inline ${
                    isCurrent ? 'text-white' : 'text-primary-200/80'
                  }`}
                >
                  {step.label}
                </span>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-0.5 h-px flex-1 sm:mx-1 ${
                      isComplete ? 'bg-white/50' : 'bg-white/20'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </nav>

        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-primary-100/85">
          <li className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" /> Encrypted checkout
          </li>
          <li className="flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5" /> Card &amp; transfer
          </li>
          <li className="flex items-center gap-1.5">
            <Receipt className="h-3.5 w-3.5" /> Instant receipt
          </li>
        </ul>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
        {/* Main flow */}
        <div className="space-y-4 border-b border-slate-200/80 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          {/* Step 1 — Residence */}
          <div className="group rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-100 text-[11px] font-bold text-primary-800">
                1
              </span>
              <h3 className="font-display text-sm font-semibold text-slate-900">Your residence</h3>
            </div>
            <div className="mt-3 flex gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-105 ${tealIcon.container}`}
              >
                {residenceType === 'commercial' ? (
                  <Building2 className="h-5 w-5" />
                ) : (
                  <Home className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{propertyTypeLabel(residenceType)}</p>
                <p className="text-xs text-slate-500">{billServiceLabel(residenceType)}</p>
                <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-slate-600">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span>
                    {residenceLine || user.address || 'Add your address in profile'}
                    {user.landmark ? ` · ${user.landmark}` : ''}
                  </span>
                </p>
                <p className="mt-1.5 text-xs font-medium text-primary-700">
                  {monthlyRateLabel(residenceType)}
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 — Bills */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-[11px] font-bold text-sky-800">
                2
              </span>
              <h3 className="font-display text-sm font-semibold text-slate-900">Choose a bill</h3>
            </div>

            {payableBills.length === 0 ? (
              <div className="rounded-xl border border-slate-200/90 bg-gradient-to-b from-slate-50 to-white p-5 text-center sm:p-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 border border-amber-200/80">
                  <Clock className="h-6 w-6" />
                </div>
                <p className="font-display mt-4 text-base font-semibold text-slate-900">
                  No bill ready to pay
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
                  ARMS admin will issue your monthly refuse bill. It will show up here when it is ready.
                </p>
                {onRefresh && (
                  <button
                    type="button"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="btn btn-secondary mt-4 h-9 px-4 text-xs inline-flex items-center gap-2"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Check for new bills
                  </button>
                )}
                {lastPaid ? (
                  <div className="mt-5 rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-4 py-3 text-left">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Latest payment on record
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {formatBillingPeriod(lastPaid.billingPeriod)} · {formatCurrency(lastPaid.totalAmount)}
                    </p>
                    <Link
                      to={`/app/bills/${lastPaid.id}/receipt`}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-800"
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      View receipt
                    </Link>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-slate-500">
                    {paidBills.length > 0
                      ? `${paidBills.length} paid bill(s) in your history below`
                      : 'Your payment history will appear once you pay your first bill'}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2" role="radiogroup" aria-label="Select bill to pay">
                {payableBills.map((bill) => {
                  const selected = bill.id === selectedBillId
                  const isOverdue = bill.status === 'overdue'
                  return (
                    <label
                      key={bill.id}
                      className={`group flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all duration-200 sm:p-4 ${
                        selected
                          ? 'border-primary-500/80 bg-primary-50/50 shadow-sm ring-1 ring-primary-500/25'
                          : 'border-slate-200/90 bg-white hover:border-primary-200 hover:shadow-sm'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bill-choice"
                        value={bill.id}
                        checked={selected}
                        onChange={() => setSelectedBillId(bill.id)}
                        className="h-4 w-4 shrink-0 border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-sm font-semibold text-slate-900">
                            {formatBillingPeriod(bill.billingPeriod)}
                          </span>
                          <BillStatusBadge status={bill.status} />
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Due {formatBillingDate(bill.dueDate)}
                          {bill.lateFee > 0 && ` · Late fee ${formatCurrency(bill.lateFee)}`}
                        </p>
                      </div>
                      <div
                        className={`shrink-0 rounded-lg px-2.5 py-1.5 text-right ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-800'
                            : selected
                              ? 'bg-primary-100 text-primary-800'
                              : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        <p className="font-display text-sm font-bold">{formatCurrency(bill.totalAmount)}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Payment summary — sidebar */}
        <aside className="flex flex-col bg-[linear-gradient(180deg,#f8faf8_0%,#f1f5f0_100%)] p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-700 text-[11px] font-bold text-white">
              3
            </span>
            <h3 className="font-display text-sm font-semibold text-slate-900">Payment</h3>
          </div>

          {hasPayableBill && selectedBill ? (
            <div className="mt-4 flex flex-1 flex-col">
              <div className="rounded-xl border border-primary-200/80 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-500">You will pay</p>
                <p className="font-display mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  {formatCurrency(selectedBill.totalAmount)}
                </p>
                <p className="mt-2 text-xs text-slate-600">
                  {formatBillingPeriod(selectedBill.billingPeriod)} ·{' '}
                  {propertyTypeLabel(selectedBill.propertyType)}
                </p>
                {selectedBill.status === 'overdue' && (
                  <p className="mt-2 rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
                    This bill is overdue — pay now to avoid further fees
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-lg bg-primary-50/80 px-3 py-2.5 text-xs text-primary-800">
                <Sparkles className="h-4 w-4 shrink-0 text-primary-600" />
                <span>Checkout opens in a secure window. Your dashboard updates as soon as payment confirms.</span>
              </div>

              <div className="mt-auto pt-5">
                <PayBillButton
                  bill={selectedBill}
                  size="lg"
                  showAmount
                  fullWidth
                  className="!h-11 shadow-md shadow-primary-900/15"
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-1 flex-col justify-between">
              <div className="rounded-xl border border-dashed border-slate-300/90 bg-white/60 px-4 py-8 text-center">
                <CreditCard className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-600">Payment unlocks when a bill is issued</p>
                <p className="mt-1 text-xs text-slate-500">Complete step 2 first</p>
              </div>
              <p className="mt-4 text-center text-[11px] text-slate-500">
                Questions? Contact your ward officer or ARMS support.
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

export default BillPaymentSection
