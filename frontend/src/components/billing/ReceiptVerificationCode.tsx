import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { ShieldCheck, ExternalLink, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buildReceiptVerifyUrl } from '../../utils/receiptDownload'

interface ReceiptVerificationCodeProps {
  code?: string
  billNumber?: string
}

const chunkCode = (code: string, size = 4): string =>
  code.toUpperCase().replace(new RegExp(`.{1,${size}}`, 'g'), '$& ').trim()

const ReceiptVerificationCode = ({ code, billNumber = '' }: ReceiptVerificationCodeProps) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  const verifyUrl = useMemo(() => (code ? buildReceiptVerifyUrl(billNumber, code) : ''), [billNumber, code])

  useEffect(() => {
    if (!code) {
      setQrDataUrl(null)
      return
    }
    let cancelled = false
    QRCode.toDataURL(verifyUrl, { margin: 1, width: 168, color: { dark: '#0f172a' } })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [verifyUrl, code])

  if (!code) {
    return (
      <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Loader2 className="h-4 w-4 animate-spin" />
        Preparing verification code…
      </div>
    )
  }

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-primary-200 bg-primary-50/60">
      <div className="flex items-center gap-2 border-b border-primary-100 px-4 py-3">
        <ShieldCheck className="h-4 w-4 text-primary-700" />
        <h3 className="text-sm font-semibold text-primary-900">Verification Code</h3>
      </div>
      <div className="flex flex-col items-center gap-4 p-4 sm:flex-row">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm font-bold tracking-wider text-slate-900 break-all">
            {chunkCode(code)}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            Scan the QR code or use the verify link to confirm this receipt against ARMS&apos; official records.
            Any change to the receipt makes this code invalid.
          </p>
          <Link
            to={`/verify-receipt?bill=${encodeURIComponent(billNumber)}&code=${encodeURIComponent(code)}`}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open verification page
          </Link>
        </div>
        {qrDataUrl ? (
          <div className="shrink-0 rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-200">
            <img src={qrDataUrl} alt="QR code to verify this receipt" className="h-36 w-36" />
          </div>
        ) : (
          <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-lg bg-white text-xs text-slate-400 ring-1 ring-slate-200">
            QR unavailable
          </div>
        )}
      </div>
    </div>
  )
}

export default ReceiptVerificationCode
