import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getWorkspaceLoginPath, loadPreferredWorkspace } from '../services/authSession'
import { PATHS } from '../routes/paths'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(79,114,230,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#ffffff_60%)] px-4">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 px-8 py-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-primary-700"></div>
          <p className="mt-4 text-sm font-semibold text-slate-900">Preparing your workspace</p>
          <p className="mt-1 text-sm text-slate-500">Checking your session and loading your dashboard.</p>
        </div>
      </div>
    )
  }

  // Redirect to login if no user
  if (!user) {
    const staffPaths = [
      PATHS.appOperations,
      PATHS.appBillingAdmin,
      PATHS.appFinance,
      PATHS.appWithdrawals,
    ]
    const inferredWorkspace =
      staffPaths.some((p) => location.pathname.startsWith(p)) ||
      loadPreferredWorkspace() === 'admin'
        ? 'admin'
        : 'resident'
    return <Navigate to={getWorkspaceLoginPath(inferredWorkspace)} replace state={{ from: location }} />
  }

  return <>{children}</>
}

export default ProtectedRoute
