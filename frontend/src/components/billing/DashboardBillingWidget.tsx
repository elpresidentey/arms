import { Link } from 'react-router-dom'
import { AlertCircle, ArrowRight, Receipt } from 'lucide-react'
import { Bill } from '../../types'
import { formatCurrency } from '../../utils/format'
import { formatBillingDate, formatBillingPeriod } from '../../utils/billingFormat'
import { isBillPastDue, summarizeBills } from '../../utils/bills'
import PayBillButton from './PayBillButton'
import BillStatusBadge from './BillStatusBadge'
import Button from '../Button'

interface DashboardBillingWidgetProps {
  bills: Bill[]
}

const DashboardBillingWidget = ({ bills }: DashboardBillingWidgetProps) => {
  const { payableBills, totalDue, overdueCount } = summarizeBills(bills)

  if (payableBills.length === 0) {
    const hasAnyBills = bills.length > 0

    return (
      <div className="panel-shell flex flex-col gap-3 rounded-2xl px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/70 text-emerald-600 shadow-sm">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">
              {hasAnyBills ? 'Refuse bills - all paid' : 'Pay bills - waiting for your bill'}
            </p>
            <p className="mt-0.5 text-sm text-slate-600">
              {hasAnyBills
                ? 'No outstanding bills. View receipts on the Pay bills page.'
                : 'Your monthly bill will show here once ARMS admin issues it. Then you can pay in one tap.'}
            </p>
          </div>
        </div>
        <Link to="/app/bills">
          <Button variant="primary" size="sm" className="shrink-0">
            Open Pay bills
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <section className="panel-shell overflow-hidden rounded-2xl">
      <div className="flex flex-col gap-3 border-b border-slate-200/70 bg-gradient-to-br from-slate-50/80 to-white/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${
              overdueCount > 0
                ? 'bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-600/25'
                : 'bg-gradient-to-br from-primary-500 to-primary-800 shadow-primary-600/25'
            }`}
          >
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Pay from your dashboard
            </p>
            <p className="font-display text-2xl font-bold tracking-tight text-slate-950">
              {formatCurrency(totalDue)} due
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {payableBills.length} bill{payableBills.length > 1 ? 's' : ''} to pay
              {overdueCount > 0 && (
                <span className="font-medium text-rose-600"> · {overdueCount} past due</span>
              )}
            </p>
          </div>
        </div>
        <Link
          to="/app/bills"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800"
        >
          All bills & receipts
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <ul className="divide-y divide-slate-200/60 px-4 py-1 sm:px-6">
        {payableBills.map((bill) => {
          const expired = bill.status === 'overdue' || isBillPastDue(bill)

          return (
            <li
              key={bill.id}
              className={`group flex flex-col gap-3 py-4 transition-colors duration-200 sm:flex-row sm:items-center sm:justify-between ${
                bill.status === 'overdue'
                  ? 'rounded-lg bg-rose-50/40 px-2 sm:px-3 -mx-2 sm:-mx-3 hover:bg-rose-50/70'
                  : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-500">{bill.billNumber}</span>
                  <BillStatusBadge status={bill.status} />
                  {expired && bill.status !== 'overdue' && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      Past due
                    </span>
                  )}
                </div>
                <p className="mt-1 font-semibold text-slate-900">{formatBillingPeriod(bill.billingPeriod)}</p>
                <p className="text-sm text-slate-600">
                  {bill.status === 'overdue' ? 'Overdue' : 'Due'} {formatBillingDate(bill.dueDate)}
                  {bill.lateFee > 0 && (
                    <span className="text-rose-600"> · includes {formatCurrency(bill.lateFee)} late fee</span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <p className="text-lg font-bold text-slate-950 tabular-nums">{formatCurrency(bill.totalAmount)}</p>
                <PayBillButton bill={bill} showAmount size="md" />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default DashboardBillingWidget