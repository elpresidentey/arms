import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Dashboard from '../pages/Dashboard'
import { User } from '../types'
import {
  RouteAccess,
  canAccess,
  canAccessPath,
  getAccessDeniedRedirect,
  getDefaultAppPath,
} from './roles'

type AppRole = User['role']

type LocationState = {
  from?: { pathname: string }
}

/** Protected app index: role-aware dashboard */
export const AppHome = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <Dashboard />
}

interface RoleGuardProps {
  access: RouteAccess
  children: React.ReactNode
}

/** Blocks routes when the signed-in role lacks permission */
export const RoleGuard = ({ access, children }: RoleGuardProps) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!canAccess(user.role, access)) {
    return <Navigate to={getAccessDeniedRedirect(user.role)} replace />
  }

  return <>{children}</>
}

/** After login: honor ?redirect= or router state.from when safe */
export const resolvePostLoginPath = (
  role: AppRole | undefined,
  options?: {
    search?: string
    fromPathname?: string
  },
): string => {
  const defaultPath = getDefaultAppPath(role)

  if (options?.search) {
    const params = new URLSearchParams(options.search)
    const redirect = params.get('redirect')
    if (redirect && redirect.startsWith('/app') && canAccessPath(role, redirect)) {
      return redirect
    }
  }

  const from = options?.fromPathname
  if (from && from.startsWith('/app') && canAccessPath(role, from)) {
    return from
  }

  return defaultPath
}

/** Guest-only routes (login/register) — bounce authenticated users home */
export const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return null
  }

  if (user) {
    const state = location.state as LocationState | null
    const target = resolvePostLoginPath(user.role, {
      fromPathname: state?.from?.pathname,
    })
    return <Navigate to={target} replace />
  }

  return <>{children}</>
}

/** Unknown /app child paths */
export const AppCatchAll = () => {
  const { user } = useAuth()
  return <Navigate to={getAccessDeniedRedirect(user?.role)} replace />
}
