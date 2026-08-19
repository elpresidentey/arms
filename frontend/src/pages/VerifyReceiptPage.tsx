import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, ShieldCheck, Search, RotateCcw } from 'lucide-react'
import { billingApi } from '../services/api'
import { getErrorMessage } from '../utils/errors'
import { formatCurrency } from '../utils/format'
import { formatBillingDate, formatBillingPeriod } from '../utils/billingFormat'

interface VerificationResult {
  valid: boolean
  bill?: {
    billNumber: string
    billingPeriod: string
    totalAmount: number
    paidAt: string | null
    paymentMethod: string | null
    status: string
  }
}

const chunkCode = (code: string, size = 4): string =>
  code.toUpperCase().replace(new RegExp(`.{1,${size}}`, 'g'), '$& ').trim()

const VerifyReceiptPage = () => {
  const [searchParams] = useSearchParams()
  const [billInput, setBillInput] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'verifying' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [verifiedCode, setVerifiedCode] = useState('')
  const [message, setMessage] = useState('')

  const runVerification = async (billNumber: string, code: string) => {
    if (!billNumber.trim() || !code.trim()) {
      setStatus('error')
      setMessage('Enter the receipt number and verification code.')
      return
    }
    setStatus('verifying')
    setResult(null)
    setVerifiedCode('')
    setMessage('Checking this receipt against official records…')
    try {
      const res = await billingApi.verifyReceipt(billNumber.trim(), code.trim())
      setResult(res)
      setVerifiedCode(code.trim())
      setStatus('done')
      if (!res.valid) {
        setMessage('This verification code does not match our records or the receipt has been altered.')
      }
    } catch (error) {
      setStatus('error')
      setMessage(getErrorMessage(error, 'Could not verify this receipt. Please try again.'))
    }
  }

  useEffect(() => {
    const bill = searchParams.get('bill')
    const code = searchParams.get('code')
    if (bill && code) {
      setBillInput(bill)
      setCodeInput(code)
      runVerification(bill, code)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleManualSubmit = (event: FormEvent) => {
    event.preventDefault()
    runVerification(billInput, codeInput)
  }

  const handleReset = () => {
    setBillInput('')
    setCodeInput('')
    setResult(null)
    setVerifiedCode('')
    setMessage('')
    setStatus('idle')
    const url = new URL(window.location.href)
    url.search = ''
    window.history.replaceState({}, '', url.toString())
  }

  const showForm = status !== 'done' || !result?.valid

  return (
    <div className="min-h-screen bg-[#f6f3ec] px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/25">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Verify a receipt</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Confirm an ARMS payment receipt against our official records. Enter the receipt number and
            the verification code printed on the receipt — or scan its QR code.
          </p>
        </div>

        {showForm && (
          <form
            onSubmit={handleManualSubmit}
            className="panel-shell rounded-[1.6rem] p-6 sm:p-8"
          >
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Receipt number
            </label>
            <input
              value={billInput}
              onChange={(event) => setBillInput(event.target.value)}
              placeholder="e.g. BILL-2026-08-0001"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />

            <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Verification code
            </label>
            <input
              value={codeInput}
              onChange={(event) => setCodeInput(event.target.value)}
              placeholder="e.g. A1B2 C3D4 E5F6 …"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-xs text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />

            <button
              type="submit"
              disabled={status === 'verifying'}
              className="btn btn-primary mt-6 inline-flex h-11 w-full items-center justify-center gap-2"
            >
              {status === 'verifying' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Verify receipt
            </button>
          </form>
        )}

        {status === 'verifying' && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying…
          </div>
        )}

        {status === 'done' && result && result.valid && result.bill && (
          <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-emerald-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-emerald-100 bg-emerald-50 px-6 py-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <div>
                <h2 className="font-semibold text-emerald-900">Receipt is genuine</h2>
                <p className="text-xs text-emerald-700">This receipt matches ARMS&apos; official records.</p>
              </div>
            </div>
            <div className="space-y-3 px-6 py-5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Receipt number</span>
                <span className="font-semibold text-slate-900">{result.bill.billNumber}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Billing period</span>
                <span className="font-semibold text-slate-900">{formatBillingPeriod(result.bill.billingPeriod)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Total paid</span>
                <span className="font-semibold text-emerald-800">{formatCurrency(result.bill.totalAmount)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Payment date</span>
                <span className="font-semibold text-slate-900">
                  {result.bill.paidAt ? formatBillingDate(result.bill.paidAt) : '—'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Method</span>
                <span className="font-semibold capitalize text-slate-900">
                  {result.bill.paymentMethod || 'Paystack'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
                <span className="text-slate-500">Matched code</span>
                <span className="font-mono text-xs font-bold tracking-wider text-emerald-800">
                  {chunkCode(verifiedCode)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-secondary mt-1 inline-flex h-11 w-full items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Verify another receipt
              </button>
            </div>
          </div>
        )}

        {status === 'done' && result && !result.valid && (
          <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-red-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-red-100 bg-red-50 px-6 py-4">
              <XCircle className="h-6 w-6 text-red-600" />
              <div>
                <h2 className="font-semibold text-red-900">Receipt could not be verified</h2>
                <p className="text-xs text-red-600">{message}</p>
              </div>
            </div>
            <div className="px-6 py-5 text-sm leading-6 text-slate-600">
              <p className="font-medium text-slate-900">The code you entered is displayed as:</p>
              <p className="mt-1 font-mono text-xs break-all text-slate-500">{chunkCode(codeInput)}</p>
              <p className="mt-3">
                Double-check you copied the full code, check the receipt number, or contact ARMS support if
                you believe this is an error.
              </p>
              <p className="mt-2 text-xs">support@arms.ng</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 rounded-[1.6rem] border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-800">
            {message}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-slate-500">
          <Link to="/" className="font-semibold text-primary-700 hover:text-primary-800">
            ← Back to ARMS
          </Link>
          <span className="mx-2">·</span>
          <span>support@arms.ng</span>
        </p>
      </div>
    </div>
  )
}

export default VerifyReceiptPage