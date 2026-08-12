import { handleCors, json } from '../_shared/cors.ts'
import { HttpError } from '../_shared/errors.ts'
import { requireUser, readBody } from '../_shared/auth.ts'
import { serviceClient } from '../_shared/db.ts'
import { isTestMode, listBanks, resolveAccount } from '../_shared/paystack.ts'
import { fetchBalance, fetchDailyWithdrawn } from '../_shared/wallet.ts'

const MIN_WITHDRAWAL = 100
const MAX_WITHDRAWAL = 50000
const DAILY_WITHDRAWAL_LIMIT = 100000

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const body = await readBody(req)
    const action = body.action as string

    switch (action) {
      case 'getBanks':
        return json(await listBanks())
      case 'resolveAccount':
        return json(
          await resolveAccount(
            String(body.accountNumber ?? ''),
            String(body.bankCode ?? ''),
          ),
        )
      case 'withdraw':
        return json(await withdraw(req, body))
      default:
        return json({ error: `Unknown action: ${action}` }, 400)
    }
  } catch (error) {
    if (error instanceof HttpError) {
      return json({ error: error.message }, error.status)
    }
    console.error('wallet error:', error)
    return json({ error: 'An unexpected error occurred' }, 500)
  }
})

async function withdraw(req: Request, body: Record<string, unknown>) {
  const caller = await requireUser(req)
  const service = serviceClient()

  const amount = Number(body.amount)
  if (!amount || amount <= 0) {
    throw new HttpError(400, 'Amount must be greater than zero')
  }
  if (amount < MIN_WITHDRAWAL) {
    throw new HttpError(400, `Minimum withdrawal amount is NGN ${MIN_WITHDRAWAL}`)
  }
  if (amount > MAX_WITHDRAWAL) {
    throw new HttpError(400, `Maximum withdrawal amount is NGN ${MAX_WITHDRAWAL}`)
  }

  const accountNumber = String(body.accountNumber ?? '')
  const bankCode = String(body.bankCode ?? '')
  if (!accountNumber || !bankCode) {
    throw new HttpError(400, 'Bank and account number are required')
  }

  const balance = await fetchBalance(service, caller.uid)
  if (amount > balance) {
    throw new HttpError(400, 'Insufficient balance')
  }

  const dailyWithdrawn = await fetchDailyWithdrawn(service, caller.uid)
  if (dailyWithdrawn + amount > DAILY_WITHDRAWAL_LIMIT) {
    throw new HttpError(400, `Daily withdrawal limit of NGN ${DAILY_WITHDRAWAL_LIMIT} exceeded`)
  }

  let accountName: string
  let verifiedAccountNumber: string
  if (isTestMode()) {
    accountName = String(body.accountName ?? 'Test Account')
    verifiedAccountNumber = accountNumber
  } else {
    const account = await resolveAccount(accountNumber, bankCode)
    accountName = String(body.accountName ?? account.account_name)
    verifiedAccountNumber = account.account_number
  }

  const { data, error } = await service
    .from('wallet_transactions')
    .insert({
      userId: caller.uid,
      amount,
      balanceAfter: balance - amount,
      type: 'debit',
      source: 'withdrawal',
      description: `Withdrawal request to ${accountName} (${verifiedAccountNumber})`,
      status: 'pending',
      metadata: {
        accountNumber: verifiedAccountNumber,
        bankCode,
        accountName,
        testMode: isTestMode(),
      },
    })
    .select('*')
    .single()

  if (error) {
    throw new HttpError(500, error.message)
  }
  return data
}