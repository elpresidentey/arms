import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash or query params
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          throw error
        }
        
        if (data.session) {
          // Email confirmed successfully, session created
          setStatus('success')
          setMessage('Email confirmed successfully!')
          setTimeout(() => {
            navigate('/dashboard', { replace: true })
          }, 2000)
        } else {
          // Email confirmed but no session (user needs to login)
          setStatus('success')
          setMessage('Email confirmed! Please sign in to continue.')
          setTimeout(() => {
            navigate('/login?message=Email confirmed. Please sign in.', { replace: true })
          }, 2000)
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage('Failed to confirm email. The link may be expired or invalid.')
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 3000)
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4 border border-slate-200">
        {status === 'loading' && (
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Confirming your email...</h2>
            <p className="text-slate-600">Please wait while we verify your account.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Success!</h2>
            <p className="text-slate-600 mb-4">{message}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Redirecting...</span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Confirmation Failed</h2>
            <p className="text-slate-600 mb-4">{message}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Redirecting to login...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthCallback
