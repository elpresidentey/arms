import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, LoginCredentials, RegisterData } from '../types'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'
import {
  AuthWorkspace,
  clearAuthSession,
  clearPendingRegistration,
  loadPendingRegistration,
  loadStoredAuthSession,
  normalizeAuthResponse,
  PendingRegistration,
  saveAuthSession,
  saveAuthToken,
  savePendingRegistration,
  savePreferredWorkspace,
} from '../services/authSession'
import { getErrorMessage } from '../utils/errors'
import { supabase } from '../lib/supabase'

type Workspace = AuthWorkspace

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const normalizeAuthError = (error: unknown, fallback: string) => {
  const message = getErrorMessage(error, fallback)
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('invalid login credentials') || lowerMessage.includes('invalid credentials')) {
    return 'The email or password is incorrect.'
  }

  if (lowerMessage.includes('email not confirmed') || lowerMessage.includes('confirm your email')) {
    return 'Please confirm your email address before signing in.'
  }

  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.'
  }

  return message
}

const isBackendStatus = (error: unknown, status: number) => {
  return typeof error === 'object' && error !== null && (error as { response?: { status?: number } }).response?.status === status
}

const isResidentRole = (role?: User['role']) => !role || role === 'resident'
const isAdminWorkspaceRole = (role?: User['role']) => Boolean(role && role !== 'resident')

const getProfileFromMetadata = (
  email: string,
  metadata: Record<string, unknown>
): PendingRegistration | null => {
  const requiredFields = ['firstName', 'lastName', 'phoneNumber', 'address', 'houseNumber', 'street'] as const
  const hasRequiredFields = requiredFields.every((field) => typeof metadata[field] === 'string' && String(metadata[field]).trim())

  if (!hasRequiredFields) {
    return null
  }

  return {
    email,
    firstName: String(metadata.firstName),
    lastName: String(metadata.lastName),
    phoneNumber: String(metadata.phoneNumber),
    address: String(metadata.address),
    ward: typeof metadata.ward === 'string' && metadata.ward.trim() ? String(metadata.ward) : undefined,
    houseNumber: String(metadata.houseNumber),
    street: String(metadata.street),
    latitude: typeof metadata.latitude === 'number' ? metadata.latitude : undefined,
    longitude: typeof metadata.longitude === 'number' ? metadata.longitude : undefined,
    serviceZone: typeof metadata.serviceZone === 'string' ? metadata.serviceZone : undefined,
    propertyType: typeof metadata.propertyType === 'string' ? metadata.propertyType : undefined,
    landmark: typeof metadata.landmark === 'string' ? metadata.landmark : undefined,
    householdSize: typeof metadata.householdSize === 'number' ? metadata.householdSize : undefined,
    role: metadata.role === 'admin' ? 'admin' : 'resident',
  }
}

const assertWorkspaceAccess = (profile: User, workspace: Workspace) => {
  if (workspace === 'admin' && isResidentRole(profile.role)) {
    throw new Error('This is a resident account. Use the resident sign in page instead.')
  }

  if (workspace === 'resident' && isAdminWorkspaceRole(profile.role)) {
    throw new Error('This is a staff account. Use the admin sign in page instead.')
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (credentials: LoginCredentials, workspace?: Workspace) => Promise<User>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateUser: (nextUser: User) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const applySession = (nextToken: string, nextUser: User) => {
    // Save to localStorage first, then update state
    saveAuthSession({ token: nextToken, user: nextUser })
    setToken(nextToken)
    setUser(nextUser)
  }

  const clearSessionState = () => {
    clearAuthSession()
    setToken(null)
    setUser(null)
  }

  const updateUser = (nextUser: User) => {
    setUser(nextUser)
    if (token) {
      saveAuthSession({ token, user: nextUser })
    }
  }

  const completeBackendProfile = async (
    accessToken: string,
    registration: PendingRegistration
  ) => {
    saveAuthToken(accessToken)
    const { email: _email, ...profileData } = registration
    const profile = await authApi.register(profileData)
    clearPendingRegistration(registration.email)
    applySession(accessToken, profile)
    return profile
  }

  const recoverMissingProfile = async (
    credentials: LoginCredentials,
    workspace: Workspace
  ) => {
    const normalizedEmail = normalizeEmail(credentials.email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: credentials.password,
    })

    if (error || !data.session) {
      throw error || new Error('Unable to create a recovery session for this account.')
    }

    const pendingRegistration =
      loadPendingRegistration(normalizedEmail) ||
      getProfileFromMetadata(normalizedEmail, data.user.user_metadata ?? {})

    if (!pendingRegistration) {
      await supabase.auth.signOut()
      clearSessionState()
      throw new Error('Your login is valid, but your ARMS profile is incomplete. Contact support to finish account setup.')
    }

    if (pendingRegistration.role === 'admin' && !pendingRegistration.adminInviteToken) {
      await supabase.auth.signOut()
      clearSessionState()
      throw new Error('This staff account is missing its invite link. Ask an existing admin to issue a fresh invite.')
    }

    const profile = await completeBackendProfile(data.session.access_token, pendingRegistration)
    assertWorkspaceAccess(profile, workspace)
    return profile
  }

  useEffect(() => {
    let isMounted = true

    const restoreSession = async () => {
      const isPasswordResetRoute = window.location.pathname === '/reset-password'

      if (isPasswordResetRoute) {
        clearSessionState()
        setIsLoading(false)
        return
      }

      try {
        const storedSession = loadStoredAuthSession()
        if (storedSession) {
          // Use stored user data directly
          if (isMounted) {
            setToken(storedSession.token)
            setUser(storedSession.user)
            saveAuthToken(storedSession.token)
          }
          return
        }

        const { data } = await supabase.auth.getSession()
        const session = data.session
        const accessToken = session?.access_token
        const email = session?.user.email

        if (!accessToken || !email) {
          if (isMounted) {
            clearSessionState()
          }
          return
        }

        saveAuthToken(accessToken)

        try {
          const profile = await authApi.getProfile()
          if (isMounted) {
            applySession(accessToken, profile)
          }
          return
        } catch (error) {
          if (!isBackendStatus(error, 404)) {
            throw error
          }

          const pendingRegistration =
            loadPendingRegistration(email) ||
            getProfileFromMetadata(email, session.user.user_metadata ?? {})

          if (pendingRegistration) {
            const profile = await completeBackendProfile(accessToken, pendingRegistration)
            if (isMounted) {
              applySession(accessToken, profile)
            }
          }
        }
      } catch (error) {
        await supabase.auth.signOut()
        if (isMounted) {
          clearSessionState()
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  const login = async (credentials: LoginCredentials, workspace: Workspace = 'resident') => {
    try {
      clearSessionState()
      await supabase.auth.signOut()

      try {
        const session = normalizeAuthResponse(await authApi.login({
          email: normalizeEmail(credentials.email),
          password: credentials.password,
        }))
        assertWorkspaceAccess(session.user, workspace)
        savePreferredWorkspace(workspace)
        applySession(session.token, session.user)
        toast.success('Welcome back!')
        return session.user
      } catch (error) {
        if (!isBackendStatus(error, 404)) {
          throw error
        }

        const recoveredProfile = await recoverMissingProfile(credentials, workspace)
        savePreferredWorkspace(workspace)
        toast.success('Your profile setup is complete. Welcome back!')
        return recoveredProfile
      }
    } catch (error) {
      toast.error(normalizeAuthError(error, 'Login failed'))
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const { password, email, adminInviteToken, ...profileData } = data
      const normalizedEmail = normalizeEmail(email)
      const pendingRegistration: PendingRegistration = {
        email: normalizedEmail,
        ...profileData,
        adminInviteToken,
      }
      const { adminInviteToken: _adminInviteToken, ...supabaseMetadata } = pendingRegistration

      if (pendingRegistration.role === 'admin') {
        if (!adminInviteToken) {
          throw new Error('Open the invite link issued by an existing admin.')
        }

        await authApi.validateAdminInvite({
          email: normalizedEmail,
          token: adminInviteToken,
        })
      }

      savePendingRegistration(pendingRegistration)

      const { data: authData, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: supabaseMetadata,
        },
      })

      if (error) {
        throw error
      }

      if (!authData.session) {
        toast.success('Account created. Check your email to confirm it, then sign in.')
        return
      }

      const profile = await completeBackendProfile(authData.session.access_token, pendingRegistration)
      savePreferredWorkspace(profile.role === 'resident' ? 'resident' : 'admin')
      toast.success(profile.role === 'resident' ? 'Resident account created.' : 'Staff invite accepted.')
    } catch (error) {
      toast.error(normalizeAuthError(error, 'Registration failed'))
      throw error
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    clearSessionState()
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
