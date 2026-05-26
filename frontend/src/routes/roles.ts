import { User } from '../types'
import { PATHS } from './paths'

export type AppRole = User['role']

export const RESIDENT_ROLE = 'resident' as const

export const STAFF_ROLES: AppRole[] = [
  'admin',
  'supervisor',
  'ward_officer',
  'dispatcher',
  'finance_officer',
  'psp_operator',
  'recycler',
]

export const BILLING_ADMIN_ROLES: AppRole[] = ['admin', 'finance_officer']

export const FINANCE_ROLES: AppRole[] = ['admin', 'finance_officer', 'supervisor']

export const WITHDRAWAL_APPROVER_ROLES: AppRole[] = ['admin', 'supervisor', 'finance_officer']

export type RouteAccess =
  | 'public'
  | 'authenticated'
  | 'resident'
  | 'staff'
  | 'billing-admin'
  | 'finance'
  | 'withdrawal-approver'

export const isResident = (role?: AppRole | null) => !role || role === RESIDENT_ROLE

export const isStaff = (role?: AppRole | null) => Boolean(role && role !== RESIDENT_ROLE)

export const hasRole = (role: AppRole | undefined | null, allowed: AppRole[]) =>
  Boolean(role && allowed.includes(role))

export const canAccess = (role: AppRole | undefined | null, access: RouteAccess): boolean => {
  if (access === 'public' || access === 'authenticated') {
    return true
  }
  if (!role) {
    return false
  }
  switch (access) {
    case 'resident':
      return isResident(role)
    case 'staff':
      return isStaff(role)
    case 'billing-admin':
      return hasRole(role, BILLING_ADMIN_ROLES)
    case 'finance':
      return hasRole(role, FINANCE_ROLES)
    case 'withdrawal-approver':
      return hasRole(role, WITHDRAWAL_APPROVER_ROLES)
    default:
      return false
  }
}

/** Default landing route after sign-in, by role */
export const getDefaultAppPath = (role?: AppRole | null): string => {
  void role
  return PATHS.app
}

/** Where to send users who hit a route they cannot access */
export const getAccessDeniedRedirect = (role?: AppRole | null): string => getDefaultAppPath(role)

const ROUTE_ACCESS_RULES: { prefix: string; access: RouteAccess }[] = [
  { prefix: '/app/wallet', access: 'resident' },
  { prefix: '/app/bills', access: 'resident' },
  { prefix: '/app/payment', access: 'resident' },
  { prefix: '/app/collection-requests', access: 'resident' },
  { prefix: '/app/schedule-collection', access: 'resident' },
  { prefix: '/app/submit-recyclable', access: 'resident' },
  { prefix: '/app/billing-admin', access: 'billing-admin' },
  { prefix: '/app/finance', access: 'finance' },
  { prefix: '/app/withdrawal-approvals', access: 'withdrawal-approver' },
  { prefix: '/app/operations', access: 'staff' },
  { prefix: '/app/collection-requests-queue', access: 'staff' },
]

export const getAccessForPath = (pathname: string): RouteAccess | null => {
  const match = ROUTE_ACCESS_RULES.find((rule) => pathname.startsWith(rule.prefix))
  return match?.access ?? null
}

export const canAccessPath = (role: AppRole | undefined | null, pathname: string): boolean => {
  const access = getAccessForPath(pathname)
  if (!access) {
    return true
  }
  return canAccess(role, access)
}
