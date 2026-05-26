import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, XCircle, Loader2, Receipt, ArrowRight } from 'lucide-react'
import { billingApi } from '../services/api'
import { getErrorMessage } from '../utils/errors'

const PaymentVerification = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
  const [message, setMessage] = useState('Verifying your payment...')
  const [billNumber, setBillNumber] = useState('')
  const [billId, setBillId] = useState('')

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference')

      if (!reference) {
        setStatus('failed')
        setMessage('Payment reference not found. Return to My Bills and try again.')
        return
      }

      try {
        const result = await billingApi.verifyPayment(reference)

        if (result.status === 'success') {
          setStatus('success')
          setMessage('Payment successful! Your refuse bill has been paid.')
          setBillNumber(result.bill?.billNumber || '')
          setBillId(result.bill?.id || result.billId || '')
          await queryClient.invalidateQueries({ queryKey: ['my-bills'] })
        } else {
          setStatus('failed')
          setMessage(
            'Payment verification failed. Contact support if you were charged — include your payment reference.',
          )
        }
      } catch (error) {
        setStatus('failed')
        setMessage(getErrorMessage(error, 'Failed to verify payment'))
      }
    }

    verifyPayment()
  }, [searchParams, queryClient])

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="panel-shell max-w-lg w-full rounded-[1.6rem] p-8">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifying payment</h2>
              <p className="text-slate-600">{message}</p>
              <p className="mt-4 text-xs text-slate-500">Please do not close this page.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment successful</h2>
              <p className="text-slate-600 mb-4">{message}</p>
              {billNumber && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 mb-6 text-left">
                  <p className="text-sm text-emerald-800">
                    Bill: <span className="font-semibold">{billNumber}</span>
                  </p>
                  <p className="mt-1 text-xs text-emerald-700">
                    Your receipt is ready in Payment history.
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-3">
                {billId && (
                  <Link
                    to={`/app/bills/${billId}/receipt`}
                    className="btn btn-primary h-11 w-full inline-flex items-center justify-center gap-2"
                  >
                    <Receipt className="w-4 h-4" />
                    View receipt
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => navigate('/app/bills')}
                  className="btn btn-secondary h-11 w-full inline-flex items-center justify-center gap-2"
                >
                  Go to My Bills
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment not confirmed</h2>
              <p className="text-slate-600 mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => navigate('/app/bills')}
                  className="btn btn-primary h-11 w-full"
                >
                  Back to My Bills
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/app')}
                  className="btn btn-secondary h-11 w-full"
                >
                  Go to dashboard
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentVerification
