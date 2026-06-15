import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Mail, CheckCircle, AlertTriangle, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { authApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { PATHS } from '../routes/paths'
import toast from 'react-hot-toast'

const AcceptAdminInvite: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, register } = useAuth()
  
  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    ward: '',
    houseNumber: '',
    street: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inviteValid, setInviteValid] = useState<boolean | null>(null)
  const [inviteDetails, setInviteDetails] = useState<any>(null)

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate(PATHS.app)
      } else {
        navigate(PATHS.app)
      }
    }
  }, [user, navigate])

  // Validate invite on component mount
  useEffect(() => {
    if (email && token) {
      validateInvite()
    } else {
      setInviteValid(false)
    }
  }, [email, token])

  const validateInvite = async () => {
    try {
      const invite = await authApi.validateAdminInvite({ email, token })
      setInviteDetails(invite)
      setInviteValid(true)
    } catch (error) {
      console.error('Invalid invite:', error)
      setInviteValid(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }

      // Register the admin user
      await register({
        email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        ward: formData.ward,
        houseNumber: formData.houseNumber,
        street: formData.street,
        role: 'admin',
        adminInviteToken: token
      })

      toast.success('Admin account created successfully!')

    } catch (error: any) {
      console.error('Admin registration failed:', error)
      toast.error(error.message || 'Failed to create admin account')
    } finally {
      setIsLoading(false)
    }
  }

  // Show invalid invite state
  if (inviteValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mx-auto mb-4">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="heading-2 text-slate-900 mb-2">Invalid Invite Link</h1>
            <p className="body text-slate-600">
              This admin invite link is invalid, expired, or has already been used.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-red-200 p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-900 mb-1">Invite Not Valid</p>
                  <p className="text-sm text-red-800">
                    This could happen if:
                  </p>
                  <ul className="text-sm text-red-800 mt-2 space-y-1">
                    <li>• The invite link has expired</li>
                    <li>• The invite has already been used</li>
                    <li>• The link was copied incorrectly</li>
                    <li>• The inviting admin revoked the invite</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link to={PATHS.residentLogin} className="btn btn-primary w-full">
                Admin Login
              </Link>
              <Link to={PATHS.residentLogin} className="btn btn-outline w-full">
                Resident Login
              </Link>
              <Link to={PATHS.home} className="btn btn-ghost w-full">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state while validating
  if (inviteValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Validating invite...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-700 mx-auto mb-4">
              <Mail className="h-8 w-8" />
            </div>
            <h1 className="heading-1 text-slate-900 mb-2">Accept Admin Invite</h1>
            <p className="body text-slate-600">
              Complete your admin account setup for ARMS
            </p>
          </div>

          {/* Invite Details */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-primary-900 mb-1">Valid Admin Invite</p>
                <p className="text-sm text-primary-800">
                  You've been invited to join ARMS as an administrator for <strong>{email}</strong>
                </p>
                {inviteDetails?.note && (
                  <p className="text-sm text-primary-700 mt-2 italic">
                    Note: {inviteDetails.note}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Details */}
              <div>
                <h3 className="heading-4 text-slate-900 mb-4">Administrator Account</h3>
                
                {/* Email (readonly) */}
                <div className="mb-4">
                  <label className="label mb-2 block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="input bg-slate-50 text-slate-700 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This email was provided in your invite
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="label mb-2 block">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="label mb-2 block">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="label mb-2 block">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="+234 801 234 5678"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="label mb-2 block">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="input pr-11"
                        placeholder="••••••••"
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="label mb-2 block">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="input pr-11"
                        placeholder="••••••••"
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="heading-4 text-slate-900 mb-4">Location Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="address" className="label mb-2 block">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Full address"
                    />
                  </div>

                  <div>
                    <label htmlFor="ward" className="label mb-2 block">
                      Ward <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="ward"
                      name="ward"
                      type="text"
                      required
                      value={formData.ward}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Ward name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="houseNumber" className="label mb-2 block">
                      House Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="houseNumber"
                      name="houseNumber"
                      type="text"
                      required
                      value={formData.houseNumber}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="123"
                    />
                  </div>

                  <div>
                    <label htmlFor="street" className="label mb-2 block">
                      Street <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="street"
                      name="street"
                      type="text"
                      required
                      value={formData.street}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Street name"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t border-slate-200 pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full h-12 text-base font-semibold"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Admin Account...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      Accept Invite & Create Account
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="caption text-slate-500">
              Already have an account?{' '}
              <Link to={PATHS.residentLogin} className="font-medium text-primary-700 hover:text-primary-800">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AcceptAdminInvite