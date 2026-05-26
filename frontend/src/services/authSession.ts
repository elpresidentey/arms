import { AuthResponse, RegisterData, User } from '../types'

export interface AuthSession {
  user: User
  token: string
}

export type PendingRegistration = Omit<RegisterData, 'password'>
export type AuthWorkspace = 'resident' | 'admin'

const AUTH_TOKEN_KEY = 'arms_token'
const AUTH_USER_KEY = 'arms_user'
const PENDING_REGISTRATION_PREFIX = 'arms_pending_registration:'
const AUTH_WORKSPACE_KEY = 'arms_workspace'

const getSessionStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null
  }

  // Use localStorage for persistent sessions instead of sessionStorage
  return window.localStorage
}

export const getAuthToken = (response: AuthResponse): string => {
  return response.token ?? response.access_token ?? ''
}

export const normalizeAuthResponse = (response: AuthResponse): AuthSession => {
  const token = getAuthToken(response)

  if (!token) {
    throw new Error('Auth response did not include a token')
  }

  return {
    user: response.user,
    token,
  }
}

export const loadStoredAuthSession = (): AuthSession | null => {
  const storage = getSessionStorage()
  if (!storage) {
    return null
  }

  const storedToken = storage.getItem(AUTH_TOKEN_KEY)
  const storedUser = storage.getItem(AUTH_USER_KEY)

  if (!storedToken || !storedUser) {
    return null
  }

  try {
    return {
      token: storedToken,
      user: JSON.parse(storedUser) as User,
    }
  } catch {
    return null
  }
}

export const getStoredAuthToken = (): string | null => {
  const storage = getSessionStorage()
  return storage?.getItem(AUTH_TOKEN_KEY) ?? null
}

export const saveAuthToken = (token: string) => {
  const storage = getSessionStorage()
  if (!storage) {
    return
  }

  storage.setItem(AUTH_TOKEN_KEY, token)
}

export const saveAuthSession = (session: AuthSession) => {
  const storage = getSessionStorage()
  if (!storage) {
    return
  }

  storage.setItem(AUTH_TOKEN_KEY, session.token)
  storage.setItem(AUTH_USER_KEY, JSON.stringify(session.user))
}

export const clearAuthSession = () => {
  const storage = getSessionStorage()
  if (!storage) {
    return
  }

  storage.removeItem(AUTH_TOKEN_KEY)
  storage.removeItem(AUTH_USER_KEY)
}

export const savePreferredWorkspace = (workspace: AuthWorkspace) => {
  const storage = getSessionStorage()
  if (!storage) {
    return
  }

  storage.setItem(AUTH_WORKSPACE_KEY, workspace)
}

export const loadPreferredWorkspace = (): AuthWorkspace | null => {
  const storage = getSessionStorage()
  if (!storage) {
    return null
  }

  const workspace = storage.getItem(AUTH_WORKSPACE_KEY)
  return workspace === 'admin' || workspace === 'resident' ? workspace : null
}

export const getWorkspaceLoginPath = (workspace?: AuthWorkspace | null) => {
  return workspace === 'admin' ? '/admin/login' : '/resident/login'
}

export const savePendingRegistration = (registration: PendingRegistration) => {
  const storage = getSessionStorage()
  if (!storage) {
    return
  }

  storage.setItem(
    `${PENDING_REGISTRATION_PREFIX}${registration.email.trim().toLowerCase()}`,
    JSON.stringify(registration)
  )
}

export const loadPendingRegistration = (email: string): PendingRegistration | null => {
  const storage = getSessionStorage()
  if (!storage) {
    return null
  }

  const rawRegistration = storage.getItem(`${PENDING_REGISTRATION_PREFIX}${email.trim().toLowerCase()}`)
  if (!rawRegistration) {
    return null
  }

  try {
    return JSON.parse(rawRegistration) as PendingRegistration
  } catch {
    storage.removeItem(`${PENDING_REGISTRATION_PREFIX}${email.trim().toLowerCase()}`)
    return null
  }
}

export const clearPendingRegistration = (email: string) => {
  const storage = getSessionStorage()
  if (!storage) {
    return
  }

  storage.removeItem(`${PENDING_REGISTRATION_PREFIX}${email.trim().toLowerCase()}`)
}
