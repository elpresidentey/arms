import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

const DiagnosticPage: React.FC = () => {
  const [results, setResults] = useState<any>({})
  const [testEmail, setTestEmail] = useState('test@example.com')
  const [testPassword, setTestPassword] = useState('Test123!')

  const runDiagnostics = async () => {
    const diagnostics: any = {}

    // 1. Check API URL
    diagnostics.apiUrl = import.meta.env.VITE_API_URL || 'Not set'

    // 2. Check Supabase config
    diagnostics.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'Not set'
    diagnostics.supabaseKeyExists = !!import.meta.env.VITE_SUPABASE_ANON_KEY

    // 3. Check session storage
    diagnostics.authToken = sessionStorage.getItem('arms-auth-token') ? 'EXISTS' : 'MISSING'
    diagnostics.supabaseAuth = sessionStorage.getItem('arms-supabase-auth') ? 'EXISTS' : 'MISSING'

    // 4. Test backend health
    try {
      const healthResponse = await fetch(`${diagnostics.apiUrl}/health`)
      diagnostics.backendHealth = healthResponse.ok ? 'OK' : `ERROR: ${healthResponse.status}`
    } catch (error: any) {
      diagnostics.backendHealth = `ERROR: ${error.message}`
    }

    // 5. Check Supabase connection
    try {
      const { data, error } = await supabase.auth.getSession()
      diagnostics.supabaseSession = error ? `ERROR: ${error.message}` : (data.session ? 'ACTIVE' : 'NO SESSION')
    } catch (error: any) {
      diagnostics.supabaseSession = `ERROR: ${error.message}`
    }

    // 6. Test Supabase signup
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            firstName: 'Test',
            lastName: 'User',
          }
        }
      })

      if (error) {
        diagnostics.supabaseSignup = `ERROR: ${error.message}`
      } else if (!data.session) {
        diagnostics.supabaseSignup = 'NO SESSION (Email confirmation required)'
        diagnostics.supabaseUser = data.user ? 'User created' : 'No user'
      } else {
        diagnostics.supabaseSignup = 'SUCCESS with session'
        diagnostics.supabaseAccessToken = data.session.access_token ? 'Token received' : 'No token'
      }
    } catch (error: any) {
      diagnostics.supabaseSignup = `ERROR: ${error.message}`
    }

    setResults(diagnostics)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">ARMS Diagnostics</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Registration Flow</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Test Email
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Test Password
              </label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            <button
              onClick={runDiagnostics}
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
            >
              Run Diagnostics
            </button>
          </div>
        </div>

        {Object.keys(results).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <div className="space-y-3">
              {Object.entries(results).map(([key, value]) => (
                <div key={key} className="flex items-start">
                  <div className="font-mono text-sm font-semibold text-slate-700 w-48">
                    {key}:
                  </div>
                  <div className="font-mono text-sm text-slate-900 flex-1">
                    {String(value)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-md">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2">Instructions</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-amber-800">
            <li>Click "Run Diagnostics" to test the system</li>
            <li>Check if backend is reachable</li>
            <li>Check if Supabase is configured correctly</li>
            <li>Test if signup creates a session or requires email confirmation</li>
            <li>Copy results and share with developer if issues persist</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default DiagnosticPage
