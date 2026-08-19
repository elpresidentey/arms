// Shared receipt signing helpers for edge functions.
// Receipt authenticity is anchored server-side: the HMAC key lives only in the
// edge-function environment, so a forged receipt cannot reproduce a valid code.
// The verification endpoint recomputes the code over the *authoritative* bill
// row, so any tampering with the presented values fails the comparison.

export function getReceiptSecret(): string {
  return Deno.env.get('RECEIPT_SIGNING_SECRET') || Deno.env.get('SERVICE_ROLE_KEY') || ''
}

/** Normalized, canonical representation of a bill for receipt signing. */
export function canonicalReceiptPayload(bill: Record<string, unknown>): string {
  const totalAmount =
    bill.totalAmount == null ? '' : Number(bill.totalAmount).toFixed(2)
  const paidAt = bill.paidAt ? new Date(String(bill.paidAt)).toISOString() : ''
  return [
    String(bill.billNumber ?? ''),
    String(bill.billingPeriod ?? ''),
    totalAmount,
    paidAt,
    String(bill.paymentReference ?? ''),
    String(bill.status ?? ''),
  ].join('|')
}

/** HMAC-SHA256 of the canonical payload, hex-encoded. */
export async function signReceipt(bill: Record<string, unknown>): Promise<string> {
  const secret = getReceiptSecret()
  if (!secret) {
    throw new Error('Receipt signing secret is not configured')
  }
  const enc = new TextEncoder()
  const keyData = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    keyData,
    enc.encode(canonicalReceiptPayload(bill)),
  )
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Constant-time hex comparison. */
export function safeEqualHex(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Normalize a user-entered code: strip separators/whitespace, lowercase. */
export function normalizeCode(code: string): string {
  return String(code).replace(/[^0-9a-fA-F]/g, '').toLowerCase()
}

/** Pretty 4-char grouping for display. */
export function chunkCode(code: string, groupSize = 4): string {
  return code.toUpperCase().replace(new RegExp(`.{1,${groupSize}}`, 'g'), '$& ').trim()
}
