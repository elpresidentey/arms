import { http } from './errors.ts'

export function isTestMode(): boolean {
  return Deno.env.get('PAYSTACK_TEST_MODE') === 'true'
}

export async function paystack<T = unknown>(
  path: string,
  options: { method?: 'GET' | 'POST'; body?: Record<string, unknown> } = {},
): Promise<T> {
  const secretKey = Deno.env.get('PAYSTACK_SECRET_KEY')
  if (!secretKey || secretKey.includes('replace-with') || secretKey.includes('your-')) {
    throw http(503, 'Paystack secret key is not configured')
  }
  const response = await fetch(`https://api.paystack.co${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = (await response.json().catch(() => null)) as { status?: boolean; message?: string; data?: T } | null
  if (!response.ok || !data?.status) {
    const message = data?.message || response.statusText || 'Paystack request failed'
    throw http(502, String(message))
  }
  return data.data as T
}

export interface PaystackBank {
  name: string
  code: string
  slug?: string
}

export interface PaystackAccountResolution {
  account_number: string
  account_name: string
  bank_id: number
}

export interface PaystackRecipient {
  recipient_code: string
  name: string
}

export interface PaystackTransfer {
  id?: number
  transfer_code?: string
  reference?: string
  status?: string
}

export async function listBanks(): Promise<PaystackBank[]> {
  return paystack<PaystackBank[]>('/bank?country=nigeria&currency=NGN')
}

export async function resolveAccount(accountNumber: string, bankCode: string): Promise<PaystackAccountResolution> {
  const clean = String(accountNumber).replace(/\D/g, '')
  if (clean.length !== 10) {
    throw http(400, 'Account number must be 10 digits')
  }
  if (!bankCode) {
    throw http(400, 'Bank is required')
  }
  return paystack<PaystackAccountResolution>(
    `/bank/resolve?account_number=${encodeURIComponent(clean)}&bank_code=${encodeURIComponent(bankCode)}`,
  )
}

export async function createTransferRecipient(input: {
  accountNumber: string
  bankCode: string
  accountName: string
}): Promise<PaystackRecipient> {
  const data = await paystack<PaystackRecipient>('/transferrecipient', {
    method: 'POST',
    body: {
      type: 'nuban',
      name: input.accountName,
      account_number: input.accountNumber.replace(/\D/g, ''),
      bank_code: input.bankCode,
      currency: 'NGN',
    },
  })
  return data
}

export async function initiateTransfer(input: {
  amount: number
  recipientCode: string
  reason: string
  reference: string
}): Promise<PaystackTransfer> {
  const data = await paystack<PaystackTransfer>('/transfer', {
    method: 'POST',
    body: {
      source: 'balance',
      amount: Math.round(input.amount * 100),
      recipient: input.recipientCode,
      reason: input.reason,
      reference: input.reference,
    },
  })
  return data
}

export async function verifyTransfer(reference: string): Promise<PaystackTransfer> {
  if (!reference) {
    throw http(400, 'Transfer reference is required')
  }
  return paystack<PaystackTransfer>(`/transfer/verify/${encodeURIComponent(reference)}`)
}

export async function verifyTransaction(reference: string): Promise<Record<string, unknown>> {
  const data = await paystack<Record<string, unknown>>(`/transaction/verify/${encodeURIComponent(reference)}`)
  return data
}

export async function initializeTransaction(input: {
  email: string
  amount: number
  reference: string
  metadata?: Record<string, unknown>
  callback_url?: string
}): Promise<{ authorization_url: string; access_code: string; reference: string }> {
  return paystack<{ authorization_url: string; access_code: string; reference: string }>('/transaction/initialize', {
    method: 'POST',
    body: {
      email: input.email,
      amount: input.amount,
      reference: input.reference,
      metadata: input.metadata,
      callback_url: input.callback_url,
    },
  })
}