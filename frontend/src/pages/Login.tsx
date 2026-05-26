import React, { useState, useEffect } from 'react'
import { ArrowRight, Eye, EyeOff, ShieldCheck, Truck, Waves } from 'lucide-react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { resolvePostLoginPath } from '../routes/guards'
import { PATHS } from '../routes/paths'
import OptimizedImage from '../components/OptimizedImage'

// Import the aerial city images
import aerialCity1 from '../assets/login-aerial-city-1.jpg'
import aerialCity2 from '../assets/login-aerial-city-2.jpg'
import aerialCity3 from '../assets/login-aerial-city-3.jpg'

const loginBackgroundImages = [
  {
    src: aerialCity1,
    alt: 'Aerial view of Lagos cityscape with residential areas',
  },
  {
    src: aerialCity2,
    alt: 'Overhead view of Lagos neighborhoods and streets',
  },
  {
    src: aerialCity3,
    alt: 'Panoramic aerial view of Lagos urban landscape',
  },
]

const Login: React.FC = () => {
  const location = useLocation()
  const { login, user, isLoading: authLoading } = useAuth()
  const isAdminInviteEnabled = import.meta.env.VITE_ENABLE_ADMIN_SIGNUP === 'true'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [backgroundImageIndex, setBackgroundImageIndex] = useState(0)
  const workspace = location.pathname.startsWith('/admin') ? 'admin' : 'resident'
  const isAdminWorkspace = workspace === 'admin'

  // Rotate background images every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setBackgroundImageIndex((current) => (current + 1) % loginBackgroundImages.length)
    }, 5000)

    return () => clearInterval(intervalId)
  }, [])

  if (user && !authLoading) {
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname
    const target = resolvePostLoginPath(user.role, {
      search: location.search,
      fromPathname: from,
    })
    return <Navigate to={target} replace />
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      await login({ email, password }, workspace)
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
      <div className="mx-auto grid min-h-screen w-full max-w-[1400px] lg:grid-cols-[1fr_1fr]">
        {/* Left Panel - Brand & Features with Background Images */}
        <section className="relative hidden overflow-hidden px-16 py-16 text-white lg:flex lg:flex-col lg:justify-between">
          {/* Rotating Background Images */}
          <div className="absolute inset-0">
            {loginBackgroundImages.map((image, index) => (
              <OptimizedImage
                key={image.src}
                src={image.src}
                alt={image.alt}
                priority={index === 0}
                shouldLoad={index === backgroundImageIndex || index === 0}
                className={`absolute inset-0 h-full w-full object-cover transition-all ease-in-out ${
                  index === backgroundImageIndex
                    ? 'opacity-100 scale-105 duration-[2000ms]'
                    : 'opacity-0 scale-100 duration-[1500ms]'
                }`}
              />
            ))}
            {/* Soft Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-800/80 to-slate-900/90" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-900/40" />
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_50%)] pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Image Indicator */}
          <div className="absolute bottom-8 right-8 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/40 px-3 py-2 backdrop-blur-md">
            {loginBackgroundImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setBackgroundImageIndex(index)}
                aria-label={`Show image ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === backgroundImageIndex ? 'w-6 bg-primary-400' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
          
          <div className="relative z-10 max-w-xl">
            <Link to={PATHS.home} className="inline-flex items-center gap-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm text-white shadow-lg border border-white/20 transition-transform group-hover:scale-105">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-bold text-white">ARMS</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/70">
                  Automated Refuse Management
                </p>
              </div>
            </Link>
            
            <div className="mt-24 space-y-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
                <span className="text-sm font-medium text-white">
                  {isAdminWorkspace ? 'Staff Access Portal' : 'Resident Services Portal'}
                </span>
              </div>
              
              <h1 className="font-display max-w-xl text-5xl font-bold leading-[1.15] tracking-tight">
                {isAdminWorkspace
                  ? 'Centralized operations control for waste management'
                  : 'Your complete household waste service dashboard'}
              </h1>
              
              <p className="max-w-lg text-lg leading-[1.8] text-white/90">
                {isAdminWorkspace
                  ? 'Manage collection routes, oversee billing operations, handle resident complaints, and coordinate field teams from one unified command center.'
                  : 'Track your collection schedule, pay bills online, report service issues, manage recyclables, and monitor your wallet earnings - all in one convenient place.'}
              </p>

              {/* Key Benefits List */}
              <div className="mt-12 space-y-5">
                {isAdminWorkspace ? (
                  <>
                    <div className="flex items-start gap-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-400/20 mt-1 flex-shrink-0">
                        <svg className="h-3.5 w-3.5 text-primary-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white leading-relaxed">Route updates</p>
                        <p className="text-xs text-white/70 mt-1.5 leading-relaxed">Track collection routes and field team locations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-400/20 mt-1 flex-shrink-0">
                        <svg className="h-3.5 w-3.5 text-primary-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white leading-relaxed">Billing & payment oversight</p>
                        <p className="text-xs text-white/70 mt-1.5 leading-relaxed">Manage resident bills and track payment status</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-400/20 mt-1 flex-shrink-0">
                        <svg className="h-3.5 w-3.5 text-primary-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white leading-relaxed">Complaint resolution system</p>
                        <p className="text-xs text-white/70 mt-1.5 leading-relaxed">Handle and resolve resident service requests efficiently</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-400/20 mt-1 flex-shrink-0">
                        <svg className="h-3.5 w-3.5 text-primary-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white leading-relaxed">Never miss a collection</p>
                        <p className="text-xs text-white/70 mt-1.5 leading-relaxed">Get notified before scheduled pickups in your area</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-400/20 mt-1 flex-shrink-0">
                        <svg className="h-3.5 w-3.5 text-primary-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white leading-relaxed">Pay bills securely online</p>
                        <p className="text-xs text-white/70 mt-1.5 leading-relaxed">Quick and secure payments through Paystack</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-400/20 mt-1 flex-shrink-0">
                        <svg className="h-3.5 w-3.5 text-primary-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white leading-relaxed">Earn from recyclables</p>
                        <p className="text-xs text-white/70 mt-1.5 leading-relaxed">Track and monetize your recycling contributions</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Feature Cards */}
          <div className="relative z-10 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-400/20">
                  <ShieldCheck className="h-5 w-5 text-primary-300" />
                </div>
                <p className="mt-4 text-sm font-semibold text-white">
                  {isAdminWorkspace ? 'Full Operations Access' : 'Secure Account Access'}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-white/70">
                  {isAdminWorkspace
                    ? 'Complete visibility into routes, billing, and service requests'
                    : 'Protected access to your household service history and billing'}
                </p>
              </div>
              <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-400/20">
                  <Waves className="h-5 w-5 text-primary-300" />
                </div>
                <p className="mt-4 text-sm font-semibold text-white">Service updates</p>
                <p className="mt-2 text-xs leading-relaxed text-white/70">
                  Notices for collections, payments, and service changes
                </p>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">20+</p>
                  <p className="text-xs text-white/70 mt-1">Active Routes</p>
                </div>
                <div className="text-center border-x border-white/10">
                  <p className="text-2xl font-bold text-white">1000+</p>
                  <p className="text-xs text-white/70 mt-1">Residents</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">98%</p>
                  <p className="text-xs text-white/70 mt-1">On-time Rate</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel - Login Form */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-md">
            {/* Back to Home Button */}
            <div className="mb-6">
              <Link 
                to={PATHS.home}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary-700 transition-colors rounded-lg px-3 py-2 hover:bg-slate-100"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>

            {/* Login Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl sm:p-10">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 mb-4">
                  <div className="h-2 w-2 rounded-full bg-primary-600 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary-700">
                    {isAdminWorkspace ? 'Staff Portal' : 'Resident Portal'}
                  </span>
                </div>
                <h2 className="heading-2">Welcome back</h2>
                <p className="mt-2 body text-slate-600">
                  {isAdminWorkspace
                    ? 'Sign in to access operations and billing tools'
                    : 'Sign in to manage your household waste service'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="label mb-2 block">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="you@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="label mb-2 block">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pr-11"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary h-12 w-full text-base font-semibold shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      Sign in
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </button>
              </form>

              {/* Links */}
              <div className="mt-8 space-y-4">
                <div className="text-center">
                  <Link
                    to={PATHS.forgotPassword}
                    className="text-sm font-medium text-primary-700 hover:text-primary-800 transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-slate-500 uppercase tracking-wider">Or</span>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  {isAdminWorkspace ? (
                    <>
                      <p className="text-sm text-slate-600">
                        Need a resident account?{' '}
                        <Link to={PATHS.residentLogin} className="font-semibold text-primary-700 hover:text-primary-800">
                          Resident sign in
                        </Link>
                      </p>
                      {isAdminInviteEnabled && (
                        <p className="text-sm text-slate-600">
                          Have an invite?{' '}
                          <Link to={PATHS.adminRegister} className="font-semibold text-primary-700 hover:text-primary-800">
                            Accept staff invite
                          </Link>
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link to={PATHS.residentRegister} className="font-semibold text-primary-700 hover:text-primary-800">
                          Create account
                        </Link>
                      </p>
                      <p className="text-sm text-slate-600">
                        Staff member?{' '}
                        <Link to={PATHS.adminLogin} className="font-semibold text-primary-700 hover:text-primary-800">
                          Admin sign in
                        </Link>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <p className="mt-6 text-center caption">
              Protected account access
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Login
