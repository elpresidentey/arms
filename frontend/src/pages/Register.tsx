import React, { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { resolvePostLoginPath } from '../routes/guards'
import { PATHS } from '../routes/paths'
import { RegisterData } from '../types'
import { Truck, User, Mail, Phone, MapPin, Home, AlertCircle, ShieldCheck, Waves, ArrowRight } from 'lucide-react'
import { AddressAutocomplete } from '../components/AddressAutocomplete'
import Input from '../components/Input'
import ErrorBoundary from '../components/ErrorBoundary'

const Register: React.FC = () => {
  const location = useLocation()
  const { register, user, isLoading: authLoading } = useAuth()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isAdminInviteEnabled = import.meta.env.VITE_ENABLE_ADMIN_SIGNUP === 'true'
  const inviteParams = new URLSearchParams(location.search)
  const inviteEmail = inviteParams.get('email') || ''
  const inviteToken = inviteParams.get('token') || inviteParams.get('invite') || ''
  const canAccessAdminInvite = !isAdminRoute || isAdminInviteEnabled || Boolean(inviteToken)
  const [formData, setFormData] = useState({
    email: isAdminRoute ? inviteEmail : '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    houseNumber: '',
    street: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    role: (isAdminRoute ? 'admin' : 'resident') as 'resident' | 'admin',
    adminInviteToken: isAdminRoute ? inviteToken : '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  if (user && !authLoading) {
    const target = resolvePostLoginPath(user.role, {
      search: location.search,
      fromPathname: undefined,
    })
    return <Navigate to={target} replace />
  }

  if (!canAccessAdminInvite) {
    return <Navigate to="/admin/login" replace />
  }

  const validateField = (name: string, value: string) => {
    const newErrors: Record<string, string> = {}
    
    switch (name) {
      case 'email':
        if (!value) {
          newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address'
        }
        break
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required'
        } else if (value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters long'
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        }
        break
      case 'firstName':
        if (!value) {
          newErrors.firstName = 'First name is required'
        } else if (value.length < 2) {
          newErrors.firstName = 'First name must be at least 2 characters long'
        }
        break
      case 'lastName':
        if (!value) {
          newErrors.lastName = 'Last name is required'
        } else if (value.length < 2) {
          newErrors.lastName = 'Last name must be at least 2 characters long'
        }
        break
      case 'phoneNumber':
        if (formData.role === 'resident' && !value) {
          newErrors.phoneNumber = 'Phone number is required'
        } else if (value && !/^\+?\d{10,15}$/.test(value.replace(/\s/g, ''))) {
          newErrors.phoneNumber = 'Please enter a valid phone number'
        }
        break
      case 'houseNumber':
        if (formData.role === 'resident' && !value) {
          newErrors.houseNumber = 'House number is required'
        }
        break
      case 'street':
        if (formData.role === 'resident' && !value) {
          newErrors.street = 'Street is required'
        }
        break
      case 'address':
        if (formData.role === 'resident' && !value) {
          newErrors.address = 'Address is required'
        }
        break
      case 'adminInviteToken':
        if (formData.role === 'admin' && !value) {
          newErrors.adminInviteToken = 'Open the invite link issued by an existing admin'
        }
        break
    }
    
    return newErrors
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Validate field on change
    if (touched[name]) {
      const fieldErrors = validateField(name, value)
      setErrors(prev => ({ ...prev, ...fieldErrors }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    const fieldErrors = validateField(name, value)
    setErrors(prev => ({ ...prev, ...fieldErrors }))
  }

  const validateForm = () => {
    const allErrors: Record<string, string> = {}
    Object.keys(formData).forEach(key => {
      if (key !== 'latitude' && key !== 'longitude') {
        const value = formData[key as keyof typeof formData] as string
        const fieldErrors = validateField(key, value)
        Object.assign(allErrors, fieldErrors)
      }
    })
    return allErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const formErrors = validateForm()
    setErrors(formErrors)
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
    
    // Check if there are any errors
    if (Object.keys(formErrors).length > 0) {
      return
    }
    
    setIsLoading(true)

    try {
      const accountRole: RegisterData['role'] = isAdminRoute ? 'admin' : 'resident'
      const payload: RegisterData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: isAdminRoute ? '+1234567890' : formData.phoneNumber,
        address: isAdminRoute ? 'Admin office' : formData.address,
        ward: isAdminRoute ? 'Operations' : undefined,
        houseNumber: isAdminRoute ? 'Operations' : formData.houseNumber,
        street: isAdminRoute ? 'Admin' : formData.street,
        latitude: formData.latitude,
        longitude: formData.longitude,
        role: accountRole,
        adminInviteToken: isAdminRoute ? formData.adminInviteToken.trim() : undefined,
      }
      await register(payload)
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
        <div className="mx-auto grid min-h-screen w-full max-w-[1600px] lg:grid-cols-[1fr_1.2fr]">
          {/* Left Panel - Brand & Features */}
          <section className="relative hidden overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 px-16 py-16 text-white lg:flex lg:flex-col lg:justify-between">
            {/* Decorative Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent_50%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
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
              
              <h1 className="font-display mt-24 max-w-xl text-5xl font-bold leading-[1.15] tracking-tight">
                {isAdminRoute
                  ? 'Join the operations team'
                  : 'Start managing your waste service'}
              </h1>
              <p className="mt-10 max-w-lg text-lg leading-[1.8] text-white/90">
                {isAdminRoute
                  ? 'Accept your staff invite to access route management, billing oversight, and service coordination tools.'
                  : 'Create your account to track Amuwo Odofin collections, pay bills, report issues, and earn from recyclables.'}
              </p>
            </div>
            
            {/* Feature Cards */}
            <div className="relative z-10 grid gap-5 sm:grid-cols-2">
              <div className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-400/20">
                  <ShieldCheck className="h-5 w-5 text-primary-300" />
                </div>
                <p className="mt-5 text-sm font-semibold text-white leading-relaxed">
                  {isAdminRoute ? 'Invite-Only Access' : 'Secure Registration'}
                </p>
                <p className="mt-2.5 text-xs leading-[1.7] text-white/70">
                  {isAdminRoute
                    ? 'Staff accounts are created through invite links from existing admins'
                    : 'Your account is protected with standard security controls'}
                </p>
              </div>
              <div className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-400/20">
                  <Waves className="h-5 w-5 text-primary-300" />
                </div>
                <p className="mt-5 text-sm font-semibold text-white leading-relaxed">Instant Activation</p>
                <p className="mt-2.5 text-xs leading-[1.7] text-white/70">
                  Open your dashboard after registration and start with the main service tools
                </p>
              </div>
            </div>
          </section>

          {/* Right Panel - Registration Form */}
          <section className="flex items-center justify-center px-6 py-12 sm:px-12">
            <div className="w-full max-w-2xl">
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

              {/* Registration Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl sm:p-10">
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 mb-4">
                    <div className="h-2 w-2 rounded-full bg-primary-600 animate-pulse" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary-700">
                      {isAdminRoute ? 'Staff Registration' : 'Resident Registration'}
                    </span>
                  </div>
                  <h2 className="heading-2">
                    {isAdminRoute ? 'Accept Admin Invite' : 'Create Your Account'}
                  </h2>
                  <p className="mt-2 body text-slate-600">
                    {isAdminRoute
                      ? 'Complete your staff account setup using the invite link'
                      : 'Manage your Amuwo Odofin waste service from one account'}
                  </p>
                </div>

                {/* Account Type Selector */}
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Link
                    to={PATHS.residentRegister}
                    className={`rounded-xl border px-4 py-3.5 text-left transition-all ${
                      !isAdminRoute 
                        ? 'border-primary-500 bg-primary-50 text-primary-900 shadow-sm' 
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <User className="h-4 w-4" />
                      Resident Account
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      For household waste management
                    </span>
                  </Link>
                  {(isAdminInviteEnabled || isAdminRoute || inviteToken) && (
                    <Link
                      to={PATHS.adminRegister + (inviteToken ? `?token=${inviteToken}&email=${inviteEmail}` : '')}
                      className={`rounded-xl border px-4 py-3.5 text-left transition-all ${
                        isAdminRoute 
                          ? 'border-primary-500 bg-primary-50 text-primary-900 shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <ShieldCheck className="h-4 w-4" />
                        Staff Account
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Invite-only for operations team
                      </span>
                    </Link>
                  )}
                </div>

                {isAdminRoute && !formData.adminInviteToken && (
                  <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Invite Required</p>
                      <p className="mt-1 text-xs text-amber-800">
                        Staff accounts require an invite link from an existing admin. Contact your administrator to receive an invite.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      label="First Name"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.firstName}
                      loading={isLoading}
                      leftIcon={<User className="h-4 w-4" />}
                    />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      label="Last Name"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.lastName}
                      loading={isLoading}
                      leftIcon={<User className="h-4 w-4" />}
                    />
                  </div>

                  {/* Email Field */}
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    label="Email address"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.email}
                    loading={isLoading}
                    leftIcon={<Mail className="h-4 w-4" />}
                    placeholder="you@example.com"
                  />

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="label mb-2 block">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`input pr-11 ${errors.password && touched.password ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : ''}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && touched.password && (
                      <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.password}
                      </p>
                    )}
                    <p className="mt-1.5 text-xs text-slate-500">
                      Must contain at least 8 characters with uppercase, lowercase, and numbers
                    </p>
                  </div>

                  {/* Resident-Specific Fields */}
                  {!isAdminRoute && (
                    <>
                      {/* Phone Number */}
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        label="Phone Number"
                        required
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.phoneNumber}
                        loading={isLoading}
                        leftIcon={<Phone className="h-4 w-4" />}
                        helperText="Include country code (e.g., +234)"
                        placeholder="+234 800 000 0000"
                      />

                      {/* House Number and Street */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                          id="houseNumber"
                          name="houseNumber"
                          type="text"
                          label="House Number"
                          required
                          value={formData.houseNumber}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.houseNumber}
                          loading={isLoading}
                          leftIcon={<Home className="h-4 w-4" />}
                          placeholder="e.g., 42"
                        />
                        <Input
                          id="street"
                          name="street"
                          type="text"
                          label="Street"
                          required
                          value={formData.street}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.street}
                          loading={isLoading}
                          leftIcon={<MapPin className="h-4 w-4" />}
                          placeholder="e.g., 2nd Avenue"
                        />
                      </div>

                      {/* Address Autocomplete */}
                      <div>
                        <label htmlFor="address" className="label mb-2 block">
                          Full Address
                        </label>
                        <AddressAutocomplete
                          onChange={(address, coords) => {
                            setFormData(prev => ({ 
                              ...prev, 
                              address,
                              latitude: coords?.lat,
                              longitude: coords?.lon
                            }))
                            if (coords) {
                              setErrors(prev => ({ ...prev, address: '' }))
                            }
                          }}
                          placeholder="Search for your Amuwo Odofin address..."
                          className="w-full"
                        />
                        {errors.address && (
                          <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.address}
                          </p>
                        )}
                        <p className="mt-1.5 text-xs text-slate-500">
                          Start typing to find your address
                        </p>
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || (isAdminRoute && !formData.adminInviteToken)}
                    className="btn btn-primary h-12 w-full text-base font-semibold shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40 mt-6"
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {isAdminRoute ? 'Accepting invite...' : 'Creating account...'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        {isAdminRoute ? 'Accept Invite' : 'Create Account'}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </button>
                </form>

                {/* Links */}
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-3 text-slate-500 uppercase tracking-wider">Or</span>
                    </div>
                  </div>

                  <div className="mt-6 text-center space-y-2">
                    {isAdminRoute ? (
                      <>
                        <p className="text-sm text-slate-600">
                          Need a resident account?{' '}
                          <Link to={PATHS.residentRegister} className="font-semibold text-primary-700 hover:text-primary-800">
                            Create resident account
                          </Link>
                        </p>
                        <p className="text-sm text-slate-600">
                          Already have an account?{' '}
                          <Link to={PATHS.adminLogin} className="font-semibold text-primary-700 hover:text-primary-800">
                            Sign in
                          </Link>
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-slate-600">
                          Already have an account?{' '}
                          <Link to={PATHS.residentLogin} className="font-semibold text-primary-700 hover:text-primary-800">
                            Sign in
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
    </ErrorBoundary>
  )
}

export default Register
