import { Bill } from '../types'
import { formatBillingDate, formatBillingPeriod, propertyTypeLabel } from './billingFormat'
import { formatCurrency } from './format'

interface ReceiptCustomer {
  firstName?: string
  lastName?: string
  address?: string
  street?: string
  ward?: string
  email?: string
  phoneNumber?: string
}

export const buildReceiptHtml = (bill: Bill, customer: ReceiptCustomer) => {
  const customerName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Customer'
  const lateFeeRow =
    bill.lateFee > 0
      ? `<tr><td>Late Fee (10%)</td><td style="text-align:right">${formatCurrency(bill.lateFee)}</td></tr>`
      : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt ${bill.billNumber}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; color: #0f172a; margin: 40px; }
    h1 { margin: 0; font-size: 28px; }
    .muted { color: #64748b; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    td, th { padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    .total td { font-size: 18px; font-weight: bold; border-top: 2px solid #0f172a; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div style="text-align:center">
    <h1>ARMS</h1>
    <p class="muted">Automated Refuse Management System — Payment Receipt</p>
  </div>
  <table>
    <tr><td>Receipt Number</td><td style="text-align:right"><strong>${bill.billNumber}</strong></td></tr>
    <tr><td>Payment Date</td><td style="text-align:right">${bill.paidAt ? formatBillingDate(bill.paidAt) : 'N/A'}</td></tr>
    <tr><td>Billing Period</td><td style="text-align:right">${formatBillingPeriod(bill.billingPeriod)}</td></tr>
    <tr><td>Property Type</td><td style="text-align:right">${propertyTypeLabel(bill.propertyType)}</td></tr>
  </table>
  <h3 style="margin-top:32px">Customer</h3>
  <p>${customerName}<br/>
  ${customer.address || ''}<br/>
  ${[customer.street, customer.ward].filter(Boolean).join(', ')}<br/>
  ${customer.email || ''}<br/>
  ${customer.phoneNumber || ''}</p>
  <h3>Payment Breakdown</h3>
  <table>
    <tr><td>Service Fee</td><td style="text-align:right">${formatCurrency(bill.amount)}</td></tr>
    ${lateFeeRow}
    <tr class="total"><td>Total Paid</td><td style="text-align:right">${formatCurrency(bill.totalAmount)}</td></tr>
  </table>
  <p><strong>Method:</strong> ${bill.paymentMethod || 'Paystack'}<br/>
  <strong>Reference:</strong> ${bill.paymentReference || 'N/A'}</p>
  <div class="footer">
    <p>Thank you for your payment.</p>
    <p>For inquiries: support@arms.ng</p>
  </div>
</body>
</html>`
}

export const downloadReceiptHtml = (bill: Bill, customer: ReceiptCustomer) => {
  const html = buildReceiptHtml(bill, customer)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `ARMS-Receipt-${bill.billNumber}.html`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
