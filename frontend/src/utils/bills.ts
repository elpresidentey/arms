import { Bill } from '../types'

export const isPayableBill = (bill: Bill) =>
  bill.status === 'pending' || bill.status === 'overdue'

export const isPaidBill = (bill: Bill) => bill.status === 'paid'

export const isBillPastDue = (bill: Bill, now = Date.now()) =>
  new Date(bill.dueDate).getTime() < now

export const byDueDateAsc = (a: Bill, b: Bill) =>
  new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()

export const byPaidDateDesc = (a: Bill, b: Bill) =>
  new Date(b.paidAt ?? b.updatedAt).getTime() - new Date(a.paidAt ?? a.updatedAt).getTime()

export const getPayableBills = (bills: Bill[] = []) =>
  bills.filter(isPayableBill).sort(byDueDateAsc)

export const getPaidBills = (bills: Bill[] = []) =>
  bills.filter(isPaidBill).sort(byPaidDateDesc)

export const summarizeBills = (bills: Bill[] = []) => {
  const payableBills = getPayableBills(bills)
  const paidBills = getPaidBills(bills)
  const totalDue = payableBills.reduce((sum, bill) => sum + bill.totalAmount, 0)
  const overdueCount = payableBills.filter((bill) => bill.status === 'overdue' || isBillPastDue(bill)).length

  return {
    payableBills,
    paidBills,
    nextBill: payableBills[0],
    totalDue,
    overdueCount,
  }
}
