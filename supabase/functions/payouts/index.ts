import { handleCors, json } from '../_shared/cors.ts'
import { HttpError } from '../_shared/errors.ts'
import { requireStaff, readBody } from '../_shared/auth.ts'
import { serviceClient } from '../_shared/db.ts'
import {
  createTransferRecipient,
  initiateTransfer,
  isTestMode,
  verifyTransfer,
} from '../_shared/paystack.ts'

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const body = await readBody(req)
    const action = body.action as string
    const id = String(body.id ?? '')
    if (!id) {
      return json({ error: 'id is required' }, 400)
    }

    switch (action) {
      case 'status':
        return json(await withdrawalStatus(id))
      case 'approve':
        return json(await approve(req, id))
      case 'reject':
        return json(await reject(req, id, String(body.reason ?? '')))
      case 'process':
        return json(await process(req, id))
      case 'updateStatus':
        return json(await updateStatus(id))
      default:
        return json({ error: `Unknown action: ${action}` }, 400)
    }
  } catch (error) {
    if (error instanceof HttpError) {
      return json({ error: error.message }, error.status)
    }
    console.error('payouts error:', error)
    return json({ error: 'An unexpected error occurred' }, 500)
  }
})

async function isPayoutRequest(id: string): Promise<boolean> {
  const service = serviceClient()
  const { data } = await service.from('payout_requests').select('id').eq('id', id).maybeSingle()
  return Boolean(data)
}

async function withdrawalStatus(id: string) {
  const service = serviceClient()
  const { data: transaction, error } = await service
    .from('wallet_transactions')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) {
    throw new HttpError(500, error.message)
  }
  if (!transaction || transaction.source !== 'withdrawal') {
    throw new HttpError(404, 'Withdrawal not found')
  }
  if (!transaction.externalTransactionId) {
    throw new HttpError(400, 'Withdrawal does not have a Paystack transfer reference')
  }
  const transfer = await verifyTransfer(transaction.externalTransactionId)
  return {
    transaction,
    paystack: {
      id: transfer.id,
      transferCode: transfer.transfer_code,
      reference: transfer.reference,
      status: transfer.status || 'unknown',
    },
  }
}

async function approve(req: Request, id: string) {
  const caller = await requireStaff(req)
  const service = serviceClient()

  if (await isPayoutRequest(id)) {
    const { data: payout, error } = await service
      .from('payout_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw new HttpError(500, error.message)
    if (!payout) throw new HttpError(404, 'Payout request not found')
    if (payout.status !== 'pending') throw new HttpError(400, 'Payout request is not pending')

    const { data: updated, error: updateError } = await service
      .from('payout_requests')
      .update({ status: 'approved', processedBy: caller.uid, processedAt: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()
    if (updateError) throw new HttpError(500, updateError.message)
    return updated
  }

  const { data: withdrawal, error } = await service
    .from('wallet_transactions')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new HttpError(500, error.message)
  if (!withdrawal) throw new HttpError(404, 'Withdrawal request not found')
  if (withdrawal.status !== 'pending') throw new HttpError(400, 'Withdrawal request is not pending')
  if (withdrawal.source !== 'withdrawal') throw new HttpError(400, 'Transaction is not a withdrawal request')

  const metadata = (withdrawal.metadata as Record<string, unknown>) ?? {}
  if (!metadata.accountNumber || !metadata.bankCode || !metadata.accountName) {
    throw new HttpError(400, 'Withdrawal request missing account details')
  }

  try {
    if (isTestMode()) {
      const reference = `TEST-WD-${Date.now()}-${withdrawal.userId.slice(0, 8)}`
      const { data: updated, error: updateError } = await service
        .from('wallet_transactions')
        .update({
          status: 'completed',
          externalTransactionId: reference,
          metadata: {
            ...metadata,
            approvedBy: caller.uid,
            approvedAt: new Date().toISOString(),
            transferCode: `TEST_${reference}`,
            transferReference: reference,
            testMode: true,
            note: 'Test mode - no actual transfer initiated',
          },
        })
        .eq('id', id)
        .select('*')
        .single()
      if (updateError) throw new HttpError(500, updateError.message)
      return updated
    }

    const recipient = await createTransferRecipient({
      accountNumber: String(metadata.accountNumber),
      bankCode: String(metadata.bankCode),
      accountName: String(metadata.accountName),
    })
    const reference = `ARMS-WD-${Date.now()}-${withdrawal.userId.slice(0, 8)}`
    const transfer = await initiateTransfer({
      amount: Number(withdrawal.amount),
      recipientCode: recipient.recipient_code,
      reason: 'ARMS wallet withdrawal',
      reference,
    })

    const { data: updated, error: updateError } = await service
      .from('wallet_transactions')
      .update({
        status: 'completed',
        externalTransactionId: transfer.transfer_code || transfer.reference || String(transfer.id || reference),
        metadata: {
          ...metadata,
          approvedBy: caller.uid,
          approvedAt: new Date().toISOString(),
          transferCode: transfer.transfer_code,
          transferReference: transfer.reference,
        },
      })
      .eq('id', id)
      .select('*')
      .single()
    if (updateError) throw new HttpError(500, updateError.message)
    return updated
  } catch (error) {
    await service
      .from('wallet_transactions')
      .update({
        status: 'failed',
        metadata: {
          ...(withdrawal.metadata as Record<string, unknown>),
          failureReason: error instanceof Error ? error.message : String(error),
          failedAt: new Date().toISOString(),
        },
      })
      .eq('id', id)
    throw error
  }
}

async function reject(req: Request, id: string, reason: string) {
  const caller = await requireStaff(req)
  const service = serviceClient()

  if (await isPayoutRequest(id)) {
    const { data: payout, error } = await service
      .from('payout_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw new HttpError(500, error.message)
    if (!payout) throw new HttpError(404, 'Payout request not found')
    if (payout.status !== 'pending') throw new HttpError(400, 'Payout request is not pending')

    const { data: updated, error: updateError } = await service
      .from('payout_requests')
      .update({
        status: 'rejected',
        failureReason: reason || 'Rejected by administrator',
        processedBy: caller.uid,
        processedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (updateError) throw new HttpError(500, updateError.message)
    return updated
  }

  const { data: withdrawal, error } = await service
    .from('wallet_transactions')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new HttpError(500, error.message)
  if (!withdrawal) throw new HttpError(404, 'Withdrawal request not found')
  if (withdrawal.status !== 'pending') throw new HttpError(400, 'Withdrawal request is not pending')
  if (withdrawal.source !== 'withdrawal') throw new HttpError(400, 'Transaction is not a withdrawal request')

  const metadata = (withdrawal.metadata as Record<string, unknown>) ?? {}
  const { data: updated, error: updateError } = await service
    .from('wallet_transactions')
    .update({
      status: 'rejected',
      metadata: {
        ...metadata,
        rejectedBy: caller.uid,
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason,
      },
    })
    .eq('id', id)
    .select('*')
    .single()
  if (updateError) throw new HttpError(500, updateError.message)
  return updated
}

async function process(req: Request, id: string) {
  const caller = await requireStaff(req)
  const service = serviceClient()

  const { data: payout, error } = await service
    .from('payout_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new HttpError(500, error.message)
  if (!payout) throw new HttpError(404, 'Payout request not found')
  if (payout.status !== 'approved') throw new HttpError(400, 'Payout request must be approved first')

  const { data: user, error: userError } = await service
    .from('users')
    .select('paystackRecipientCode')
    .eq('id', payout.userId)
    .maybeSingle()
  if (userError) throw new HttpError(500, userError.message)
  if (!user?.paystackRecipientCode) {
    throw new HttpError(400, 'Recipient bank details must be verified before processing')
  }

  try {
    const transfer = await initiateTransfer({
      amount: Number(payout.amount),
      recipientCode: user.paystackRecipientCode,
      reason: `ARMS Payout - ${String(payout.type).replace(/_/g, ' ').toUpperCase()}`,
      reference: `ARMS-PO-${Date.now()}-${payout.userId.slice(0, 8)}`,
    })

    const { data: updated, error: updateError } = await service
      .from('payout_requests')
      .update({
        status: 'processing',
        transferReference: transfer.reference,
        transferCode: transfer.transfer_code,
        paystackReference: transfer.reference,
        processedBy: caller.uid,
        processedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (updateError) throw new HttpError(500, updateError.message)
    return updated
  } catch (error) {
    await service
      .from('payout_requests')
      .update({
        status: 'failed',
        failureReason: error instanceof Error ? error.message : String(error),
      })
      .eq('id', id)
    throw error
  }
}

async function updateStatus(id: string) {
  const service = serviceClient()
  const { data: payout, error } = await service
    .from('payout_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new HttpError(500, error.message)
  if (!payout) throw new HttpError(404, 'Payout request not found')
  if (!payout.transferReference) throw new HttpError(400, 'No transfer reference found')

  const transfer = await verifyTransfer(payout.transferReference)
  const updates: Record<string, unknown> = {}
  if (transfer.status === 'success') {
    updates.status = 'completed'
    updates.completedAt = new Date().toISOString()
  } else if (transfer.status === 'failed') {
    updates.status = 'failed'
    updates.failureReason = 'Transfer failed'
  }

  const { data: updated, error: updateError } = await service
    .from('payout_requests')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()
  if (updateError) throw new HttpError(500, updateError.message)
  return updated
}