import { Download, Printer, Truck } from 'lucide-react'
import { Bill } from '../../types'
import { User } from '../../types'
import { formatBillingDate, formatBillingPeriod, propertyTypeLabel } from '../../utils/billingFormat'
import { formatCurrency } from '../../utils/format'
import { downloadReceiptHtml } from '../../utils/receiptDownload'

interface BillReceiptProps {
  bill: Bill
  customer: Pick<User, 'firstName' | 'lastName' | 'address' | 'street' | 'ward' | 'email' | 'phoneNumber'>
  showActions?: boolean
  onClose?: () => void
  className?: string
}

const BillReceipt = ({ bill, customer, showActions = true, onClose, className = '' }: BillReceiptProps) => {
  const handlePrint = () => window.print()

  const handleDownload = () => {
    downloadReceiptHtml(bill, customer)
  }

  return (
    <div className={`bill-receipt-root ${className}`}>
      <div className="bill-receipt-printable rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 print:border-0 print:shadow-none">
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/30">
            <Truck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">ARMS</h1>
          <p className="text-[10px] text-slate-600 font-medium uppercase tracking-[0.16em]">Automated Refuse Management</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-700 mt-2">
            Official Payment Receipt
          </p>
        </div>

        <div className="border-t border-b border-slate-200 py-6 mb-6">
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-slate-500">Receipt Number</p>
              <p className="font-semibold text-slate-900">{bill.billNumber}</p>
            </div>
            <div>
              <p className="text-slate-500">Payment Date</p>
              <p className="font-semibold text-slate-900">
                {bill.paidAt ? formatBillingDate(bill.paidAt) : 'Pending'}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Billing Period</p>
              <p className="font-semibold text-slate-900">{formatBillingPeriod(bill.billingPeriod)}</p>
            </div>
            <div>
              <p className="text-slate-500">Property Type</p>
              <p className="font-semibold text-slate-900">{propertyTypeLabel(bill.propertyType)}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-slate-900 mb-3">Customer Information</h3>
          <div className="rounded-xl bg-slate-50 p-4 text-sm space-y-1">
            <p className="font-medium text-slate-900">
              {customer.firstName} {customer.lastName}
            </p>
            {customer.address && <p className="text-slate-600">{customer.address}</p>}
            <p className="text-slate-600">
              {[customer.street, customer.ward].filter(Boolean).join(', ')}
            </p>
            {customer.email && <p className="text-slate-600">{customer.email}</p>}
            {customer.phoneNumber && <p className="text-slate-600">{customer.phoneNumber}</p>}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-slate-900 mb-3">Payment Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Waste collection service fee</span>
              <span className="font-semibold text-slate-900">{formatCurrency(bill.amount)}</span>
            </div>
            {bill.lateFee > 0 && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Late fee (10%)</span>
                <span className="font-semibold text-red-900">{formatCurrency(bill.lateFee)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3">
              <span className="font-semibold text-slate-900">Total paid</span>
              <span className="text-xl font-bold text-green-800">{formatCurrency(bill.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900 mb-2">Payment Information</h3>
          <div className="text-sm space-y-1">
            <p className="text-slate-600">
              Method:{' '}
              <span className="font-semibold text-slate-900 capitalize">
                {bill.paymentMethod || 'Paystack'}
              </span>
            </p>
            <p className="text-slate-600">
              Reference:{' '}
              <span className="font-mono text-xs text-slate-900 break-all">
                {bill.paymentReference || '—'}
              </span>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-6 border-t border-slate-200">
          <p className="font-medium text-slate-700">Thank you for using ARMS - Automated Refuse Management.</p>
          <p className="mt-1">This receipt confirms payment for refuse collection services.</p>
          <p className="mt-2">support@arms.ng</p>
        </div>

        {showActions && (
          <div className="flex flex-col gap-3 mt-6 print:hidden sm:flex-row">
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary flex-1 h-11 flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="btn btn-secondary flex-1 h-11 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </button>
            {onClose && (
              <button type="button" onClick={onClose} className="btn btn-secondary flex-1 h-11 sm:flex-none sm:px-8">
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BillReceipt
