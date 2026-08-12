import { handleCors, json } from '../_shared/cors.ts'
import { HttpError } from '../_shared/errors.ts'
import { requireStaff, requireUser, readBody } from '../_shared/auth.ts'
import { serviceClient } from '../_shared/db.ts'
import { initializeTransaction, verifyTransaction } from '../_shared/paystack.ts'

const GRACE_PERIOD_DAYS = 7

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const body = await readBody(req)
    const action = body.action as string

    switch (action) {
      case 'generate':
        return json(await generate(req, body))
      case 'applyLateFees':
        return json(await applyLateFees(req))
      case 'initiatePayment':
        return json(await initiatePayment(req, String(body.billId ?? '')))
      case 'verifyPayment':
        return json(await verifyPayment(req, String(body.reference ?? '')))
      case 'approvePayment':
        return json(await approvePayment(req, String(body.paymentId ?? '')))
      case 'rejectPayment':
        return json(await rejectPayment(req, String(body.paymentId ?? ''), String(body.reason ?? '')))
      case 'issue':
        return json(await issue(req, String(body.userId ?? ''), body.period ? String(body.period) : undefined))
      default:
        return json({ error: `Unknown action: ${action}` }, 400)
    }
  } catch (error) {
    if (error instanceof HttpError) {
      return json({ error: error.message }, error.status)
    }
    console.error('billing error:', error)
    return json({ error: 'An unexpected error occurred' }, 500)
  }
})

function currentBillingPeriod(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  return `${year}-${month}`
}

function calculateDueDate(period: string): string {
  const [year, month] = period.split('-').map(Number)
  const lastDayOfMonth = new Date(year, month, 0)
  const dueDate = new Date(lastDayOfMonth)
  dueDate.setDate(dueDate.getDate() + 7)
  return dueDate.toISOString()
}

async function monthlyRate(service: ReturnType<typeof serviceClient>, propertyType: string): Promise<number> {
  const { data, error } = await service
    .from('billing_config')
    .select('monthlyFee')
    .eq('propertyType', propertyType)
    .eq('isActive', true)
    .maybeSingle()
  if (error) throw new HttpError(500, error.message)
  if (data?.monthlyFee != null) return Number(data.monthlyFee)
  return propertyType === 'commercial' ? 3500 : 2000
}

async function generateBillForUser(
  service: ReturnType<typeof serviceClient>,
  user: { id: string; propertyType?: string | null },
  period: string,
) {
  const { data: existing } = await service
    .from('bills')
    .select('id')
    .eq('userId', user.id)
    .eq('billingPeriod', period)
    .maybeSingle()
  if (existing) return null

  const { count } = await service
    .from('bills')
    .select('id', { count: 'exact', head: true })
    .eq('billingPeriod', period)
  const sequence = (count ?? 0) + 1

  const propertyType = user.propertyType === 'commercial' ? 'commercial' : 'residential'
  const amount = await monthlyRate(service, propertyType)

  const { data, error } = await service
    .from('bills')
    .insert({
      billNumber: `BILL-${period}-${sequence.toString().padStart(4, '0')}`,
      userId: user.id,
      billingPeriod: period,
      propertyType,
      amount,
      lateFee: 0,
      totalAmount: amount,
      status: 'pending',
      dueDate: calculateDueDate(period),
    })
    .select('*')
    .single()
  if (error) throw new HttpError(500, error.message)
  return data
}

async function generate(req: Request, body: Record<string, unknown>): Promise<number> {
  await requireStaff(req)
  const service = serviceClient()
  const period = body.period ? String(body.period) : currentBillingPeriod()

  const { data: users, error } = await service
    .from('users')
    .select('id,propertyType')
    .eq('role', 'resident')
    .eq('isActive', true)
  if (error) throw new HttpError(500, error.message)

  let created = 0
  for (const user of (users ?? []) as { id: string; propertyType?: string | null }[]) {
    const bill = await generateBillForUser(service, user, period)
    if (bill) created += 1
  }
  return created
}

async function applyLateFees(req: Request): Promise<unknown[]> {
  await requireStaff(req)
  const service = serviceClient()
  const now = new Date()

  const { data: bills, error } = await service
    .from('bills')
    .select('*')
    .eq('status', 'pending')
    .lt('dueDate', now.toISOString())
  if (error) throw new HttpError(500, error.message)

  const updated: unknown[] = []
  for (const bill of (bills ?? []) as Record<string, unknown>[]) {
    const daysPastDue = Math.floor(
      (now.getTime() - new Date(String(bill.dueDate)).getTime()) / (1000 * 60 * 60 * 24),
    )
    if (daysPastDue <= GRACE_PERIOD_DAYS) continue

    const updates: Record<string, unknown> = { status: 'overdue' }
    if (Number(bill.lateFee) === 0) {
      const fee = Number(bill.amount) * 0.1
      updates.lateFee = fee
      updates.totalAmount = Number(bill.amount) + fee
    }

    const { data: saved } = await service.from('bills').update(updates).eq('id', bill.id).select('*').single()
    if (saved) updated.push(saved)
  }
  return updated
}

async function initiatePayment(req: Request, billId: string): Promise<Record<string, unknown>> {
  const caller = await requireUser(req)
  const service = serviceClient()

  const { data: bill, error } = await service.from('bills').select('*').eq('id', billId).maybeSingle()
  if (error) throw new HttpError(500, error.message)
  if (!bill) throw new HttpError(404, 'Bill not found')
  if (bill.userId !== caller.uid) throw new HttpError(403, 'This bill does not belong to you')
  if (bill.status === 'paid') throw new HttpError(400, 'This bill has already been paid')
  if (bill.status === 'cancelled') throw new HttpError(400, 'This bill has been cancelled')

  const totalAmount = Number(bill.totalAmount)
  const { data: payment, error: payError } = await service
    .from('bill_payments')
    .insert({
      billId: bill.id,
      userId: caller.uid,
      amount: totalAmount,
      paymentReference: `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
      paymentMethod: 'paystack',
      status: 'pending',
    })
    .select('*')
    .single()
  if (payError) throw new HttpError(500, payError.message)

  const frontendUrl = (Deno.env.get('FRONTEND_URL') ?? 'http://localhost:3000').replace(/\/$/, '')
  const paystack = await initializeTransaction({
    email: caller.email ?? '',
    amount: Math.round(totalAmount * 100),
    reference: payment.paymentReference,
    callback_url: `${frontendUrl}/app/payment/verify`,
    metadata: {
      billId: bill.id,
      billNumber: bill.billNumber,
      billingPeriod: bill.billingPeriod,
      paymentId: payment.id,
    },
  })

  const { error: updateError } = await service
    .from('bill_payments')
    .update({
      paystackReference: paystack.reference,
      paystackAccessCode: paystack.access_code,
    })
    .eq('id', payment.id)
  if (updateError) throw new HttpError(500, updateError.message)

  return {
    payment,
    authorizationUrl: paystack.authorization_url,
    accessCode: paystack.access_code,
    reference: paystack.reference,
  }
}

async function verifyPayment(req: Request, reference: string): Promise<unknown> {
  const caller = await requireUser(req)
  const service = serviceClient()

  const { data: payment, error } = await service
    .from('bill_payments')
    .select('*')
    .eq('paymentReference', reference)
    .maybeSingle()
  if (error) throw new HttpError(500, error.message)
  if (!payment) throw new HttpError(404, 'Payment not found')
  if (payment.userId !== caller.uid) throw new HttpError(403, 'Payment not found')

  const verification = await verifyTransaction(reference)

  if (verification.status === 'success') {
    const { data: paid, error: pErr } = await service
      .from('bill_payments')
      .update({ status: 'success', metadata: verification })
      .eq('id', payment.id)
      .select('*')
      .single()
    if (pErr) throw new HttpError(500, pErr.message)

    const { data: bill, error: bErr } = await service
      .from('bills')
      .update({
        status: 'paid',
        paidAt: new Date().toISOString(),
        paymentReference: reference,
        paymentMethod: 'paystack',
      })
      .eq('id', payment.billId)
      .select('*')
      .single()
    if (bErr) throw new HttpError(500, bErr.message)

    return { ...(paid ?? payment), bill }
  }

  const { data: failed, error: fErr } = await service
    .from('bill_payments')
    .update({ status: 'failed', metadata: verification })
    .eq('id', payment.id)
    .select('*')
    .single()
  if (fErr) throw new HttpError(500, fErr.message)
  return failed ?? payment
}

async function approvePayment(req: Request, paymentId: string): Promise<unknown> {
  const caller = await requireStaff(req)
  const service = serviceClient()

  const { data: payment, error } = await service
    .from('bill_payments')
    .select('*')
    .eq('id', paymentId)
    .maybeSingle()
  if (error) throw new HttpError(500, error.message)
  if (!payment) throw new HttpError(404, 'Payment not found')
  if (payment.status !== 'pending') throw new HttpError(400, 'Only pending payments can be approved')

  const { data: approved, error: aErr } = await service
    .from('bill_payments')
    .update({
      status: 'success',
      metadata: {
        ...((payment.metadata as Record<string, unknown>) ?? {}),
        approvedBy: caller.uid,
        approvedAt: new Date().toISOString(),
        approvalType: 'admin',
      },
    })
    .eq('id', paymentId)
    .select('*')
    .single()
  if (aErr) throw new HttpError(500, aErr.message)

  const { data: bill, error: bErr } = await service
    .from('bills')
    .update({
      status: 'paid',
      paidAt: new Date().toISOString(),
      paymentReference: payment.paymentReference,
      paymentMethod: payment.paymentMethod || 'admin_approved',
    })
    .eq('id', payment.billId)
    .select('*')
    .single()
  if (bErr) throw new HttpError(500, bErr.message)

  return { ...approved, bill }
}

async function rejectPayment(req: Request, paymentId: string, reason: string): Promise<unknown> {
  const caller = await requireStaff(req)
  const service = serviceClient()

  const { data: payment, error } = await service
    .from('bill_payments')
    .select('*')
    .eq('id', paymentId)
    .maybeSingle()
  if (error) throw new HttpError(500, error.message)
  if (!payment) throw new HttpError(404, 'Payment not found')
  if (payment.status !== 'pending') throw new HttpError(400, 'Only pending payments can be rejected')

  const { data: rejected, error: rErr } = await service
    .from('bill_payments')
    .update({
      status: 'failed',
      metadata: {
        ...((payment.metadata as Record<string, unknown>) ?? {}),
        rejectedBy: caller.uid,
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason || 'Rejected by administrator',
      },
    })
    .eq('id', paymentId)
    .select('*')
    .single()
  if (rErr) throw new HttpError(500, rErr.message)
  return rejected
}

async function issue(req: Request, userId: string, period?: string): Promise<unknown> {
  await requireStaff(req)
  const service = serviceClient()

  const { data: user, error } = await service.from('users').select('id,role,propertyType').eq('id', userId).maybeSingle()
  if (error) throw new HttpError(500, error.message)
  if (!user) throw new HttpError(404, 'Resident not found')
  if (user.role !== 'resident') throw new HttpError(400, 'Bills can only be issued to resident accounts')

  const billingPeriod = period || currentBillingPeriod()
  const { data: existing } = await service
    .from('bills')
    .select('id')
    .eq('userId', userId)
    .eq('billingPeriod', billingPeriod)
    .maybeSingle()
  if (existing) throw new HttpError(400, `A bill already exists for this resident for ${billingPeriod}`)

  return generateBillForUser(service, { id: userId, propertyType: user.propertyType }, billingPeriod)
}