import React, { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, KeyRound, Lock, Truck } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { getWorkspaceLoginPath, loadPreferredWorkspace } from '../services/authSession'
import { getErrorMessage } from '../utils/errors'

const ResetPassword: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)
  const workspace = searchParams.get('workspace') === 'admin'
    ? 'admin'
    : (loadPreferredWorkspace() ?? 'resident')

  const passwordError = useMemo(() => {
    if (!password) {
      return ''
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.'
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      return 'Use at least one uppercase letter, one lowercase letter, and one number.'
    }
    if (confirmPassword && password !== confirmPassword) {
      return 'Passwords do not match.'
    }
    return ''
  }, [confirmPassword, password])

  useEffect(() => {
    let isMounted = true

    const checkRecoverySession = async () => {
      const { data } = await supabase.auth.getSession()

      if (isMounted) {
        setHasRecoverySession(Boolean(data.session?.access_token))
        setIsCheckingSession(false)
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session?.access_token) {
        setHasRecoverySession(true)
        setIsCheckingSession(false)
      }
    })

    checkRecoverySession()

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (passwordError || !password || password !== confirmPassword) {
      toast.error(passwordError || 'Enter and confirm your new password.')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        throw error
      }

      await supabase.auth.signOut()
      toast.success('Password updated. Sign in with your new password.')
      navigate(getWorkspaceLoginPath(workspace), { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update password'))
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f766e]">Password reset</p>
            <h1 className="font-display mt-3 text-4xl tracking-tight text-slate-950">Create a new password</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
              Use the secure recovery link from your email, then choose a fresh password for your account.
            </p>
          </div>

          {isCheckingSession ? (
            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Checking your recovery link...
            </div>
          ) : hasRecoverySession ? (
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="input"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="input"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>

              {passwordError ? (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {passwordError}
                </div>
              ) : null}

              <button type="submit" disabled={isLoading || Boolean(passwordError)} className="btn btn-primary h-12 w-full text-base">
                {isLoading ? 'Updating password...' : 'Update password'}
                {!isLoading ? <Lock className="ml-2 h-4 w-4" /> : null}
              </button>
            </form>
          ) : (
            <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              This reset link is missing, expired, or already used. Request a new password reset email to continue.
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to={`/forgot-password?workspace=${workspace}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f766e] transition hover:text-[#134e4a]">
              <KeyRound className="h-4 w-4" />
              Request a new link
            </Link>
            <Link to={getWorkspaceLoginPath(workspace)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950">
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ResetPassword
