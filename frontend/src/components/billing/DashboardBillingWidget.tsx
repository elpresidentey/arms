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
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="h-6 w-6 text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold text-slate-900">
              {hasAnyBills ? 'Refuse bills - all paid' : 'Pay bills - waiting for your bill'}
            </p>
            <p className="text-sm text-slate-600">
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
    <section className="rounded-[1.25rem] border border-amber-300/80 bg-gradient-to-br from-amber-50 via-white to-primary-50/40 shadow-soft overflow-hidden interactive-lift">
      <div className="border-b border-amber-200/80 bg-white/60 px-5 py-4 sm:px-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              overdueCount > 0 ? 'bg-red-600 text-white' : 'bg-primary-600 text-white'
            }`}
          >
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Pay from your dashboard
            </p>
            <h2 className="text-2xl font-bold text-slate-900">{formatCurrency(totalDue)} due</h2>
            <p className="mt-1 text-sm text-slate-600">
              {payableBills.length} bill{payableBills.length > 1 ? 's' : ''} to pay
              {overdueCount > 0 && ` - ${overdueCount} past due or overdue`}
            </p>
          </div>
        </div>
        <Link to="/app/bills" className="text-sm font-semibold text-primary-700 hover:text-primary-800 inline-flex items-center gap-1 shrink-0">
          All bills & receipts
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <ul className="divide-y divide-amber-100/80 px-4 py-2 sm:px-5">
        {payableBills.map((bill) => {
          const expired = bill.status === 'overdue' || isBillPastDue(bill)

          return (
            <li
              key={bill.id}
              className={`flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between ${
                bill.status === 'overdue' ? 'bg-red-50/50 -mx-4 px-4 sm:-mx-5 sm:px-5 rounded-lg' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-600">{bill.billNumber}</span>
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
                    <span className="text-red-700"> - includes {formatCurrency(bill.lateFee)} late fee</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className="text-lg font-bold text-slate-900">{formatCurrency(bill.totalAmount)}</p>
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
