import React, { useState } from 'react'
import { ArrowLeft, MailCheck, Truck } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../services/api'
import { getWorkspaceLoginPath } from '../services/authSession'
import { getErrorMessage } from '../utils/errors'

const ForgotPassword: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const workspace = searchParams.get('workspace') === 'admin' ? 'admin' : 'resident'

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await authApi.requestPasswordReset(email, workspace)
      setMessage(response.message)
      toast.success('Recovery request received')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to request password recovery'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.12),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(194,120,59,0.14),_transparent_28%),linear-gradient(180deg,#f6f1e8_0%,#fcfbf8_38%,#f1efe8_100%)]">
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-10 sm:px-8">
        <section className="w-full rounded-[2rem] border border-black/5 bg-white/88 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-10">
          <Link to="/" className="inline-flex items-center gap-3 text-slate-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/30">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">ARMS</p>
              <p className="text-[10px] leading-tight text-slate-500 font-medium uppercase tracking-[0.16em]">Automated Refuse Management</p>
            </div>
          </Link>

          <div className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f766e]">Password recovery</p>
            <h1 className="font-display mt-3 text-4xl tracking-tight text-slate-950">Get back into your account</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
              Enter the email connected to your resident account. If it exists, we will send a secure password reset link.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="input"
                placeholder="resident@domain.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-primary h-12 w-full text-base">
              {isLoading ? 'Sending reset link...' : 'Send reset link'}
              {!isLoading ? <MailCheck className="ml-2 h-4 w-4" /> : null}
            </button>
          </form>

          {message ? (
            <div className="mt-5 rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm leading-6 text-primary-900">
              {message}
            </div>
          ) : null}

          <Link
            to={getWorkspaceLoginPath(workspace)}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#0f766e] transition hover:text-[#134e4a]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </section>
      </main>
    </div>
  )
}

export default ForgotPassword
