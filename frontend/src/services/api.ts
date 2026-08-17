import { supabase, uploadImage as supabaseUploadImage } from '../lib/supabase'
import {
  AdminInvite,
  AuthResponse,
  AccountResolution,
  Bill,
  BillPayment,
  BillingResidentOption,
  Bank,
  CollectionRoute,
  CollectionRequest,
  CollectionRequestStatistics,
  CollectionRequestStatus,
  Driver,
  Vehicle,
  VehicleAssignment,
  RouteExecution,
  MaintenanceRecord,
  FleetSummary,
  LoginCredentials,
  LogisticsSummary,
  NearbyLocationsResponse,
  PayoutRequest,
  PayoutStatistics,
  PayoutStatus,
  Recyclable,
  RegisterData,
  Report,
  ServiceRequest,
  ServiceSchedule,
  User,
  WithdrawalRequest,
  WithdrawalStatus,
  WalletTransaction,
  WasteCollection,
} from '../types'

const MIGRATION_MESSAGE = 'This action is being migrated to Supabase and will be available soon.'

const getCurrentUserId = async (): Promise<string> => {
  const { data } = await supabase.auth.getUser()
  if (!data?.user?.id) {
    throw new Error('You must be signed in to continue.')
  }
  return data.user.id
}

const getCurrentUserRole = async (): Promise<string> => {
  const { data } = await supabase.rpc('get_role')
  return typeof data === 'string' ? data : ''
}

const edgeErrorMessage = async (error: unknown, fallback: string): Promise<string> => {
  const e = error as { message?: string; context?: unknown }
  try {
    const response = e?.context as Response | undefined
    if (response && typeof response.json === 'function') {
      const parsed = (await response.json()) as { error?: string } | null
      if (parsed && typeof parsed.error === 'string' && parsed.error) {
        return parsed.error
      }
    }
  } catch {
    // Ignore body parse failures; fall back to the generic message below.
  }
  return typeof e?.message === 'string' && e.message.trim() ? e.message : fallback
}

const invokeEdge = async <T>(name: string, body: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke(name, { body })
  if (error) {
    throw new Error(await edgeErrorMessage(error, MIGRATION_MESSAGE))
  }
  return data as T
}

const throwSupabaseError = (error: { message?: string } | null, fallback: string): never => {
  throw new Error(error?.message || fallback)
}

const toCamel = (key: string): string => key.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase())

const asNumber = (value: unknown): number => (value == null ? 0 : Number(value))
const asOptionalNumber = (value: unknown): number | undefined => (value == null ? undefined : Number(value))

const splitUrlList = (value?: string | null): string[] | undefined => {
  if (!value) return undefined
  const parts = value.split(',').map((item) => item.trim()).filter(Boolean)
  return parts.length > 0 ? parts : undefined
}

const joinUrlList = (value?: string[] | null): string | null => {
  if (!value || value.length === 0) return null
  return value.map((item) => item.trim()).filter(Boolean).join(',')
}

const mapUser = (row: Record<string, any>): User => ({
  id: row.id,
  email: row.email,
  firstName: row.firstName,
  lastName: row.lastName,
  phoneNumber: row.phoneNumber,
  address: row.address,
  ward: row.ward,
  houseNumber: row.houseNumber,
  street: row.street,
  role: row.role,
  serviceZone: row.serviceZone,
  propertyType: row.propertyType,
  landmark: row.landmark,
  householdSize: row.householdSize == null ? undefined : Number(row.householdSize),
  latitude: asOptionalNumber(row.latitude),
  longitude: asOptionalNumber(row.longitude),
  isActive: row.isActive,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

const fetchUsersByIds = async (ids: string[]): Promise<Record<string, User>> => {
  const uniqueIds = Array.from(new Set((ids || []).filter(Boolean)))
  if (uniqueIds.length === 0) return {}
  const { data, error } = await supabase.from('users').select('*').in('id', uniqueIds)
  if (error) return {}
  const map: Record<string, User> = {}
  for (const row of data || []) {
    map[row.id] = mapUser(row)
  }
  return map
}

const attachUsers = async <T extends { userId: string }>(rows: T[]): Promise<(T & { user?: User })[]> => {
  const usersMap = await fetchUsersByIds(rows.map((row) => row.userId))
  return rows.map((row) => ({ ...row, user: usersMap[row.userId] as User | undefined }))
}

const mapWalletTransaction = (row: Record<string, any>): WalletTransaction => ({
  id: row.id,
  userId: row.userId,
  type: row.type,
  amount: asNumber(row.amount),
  balanceAfter: asNumber(row.balanceAfter),
  source: row.source,
  description: row.description,
  referenceId: row.referenceId,
  externalTransactionId: row.externalTransactionId,
  status: row.status,
  createdAt: row.createdAt,
})

const mapRecyclable = (row: Record<string, any>): Recyclable => ({
  id: row.id,
  userId: row.userId,
  recyclerId: row.recyclerId,
  type: row.type,
  quantity: asNumber(row.quantity),
  unit: row.unit,
  estimatedValue: asNumber(row.estimatedValue),
  actualValue: asOptionalNumber(row.actualValue),
  status: row.status,
  description: row.description,
  photoUrl: row.photoUrl,
  latitude: asOptionalNumber(row.latitude),
  longitude: asOptionalNumber(row.longitude),
  pickupDate: row.pickupDate,
  collectionDate: row.collectionDate,
  createdAt: row.createdAt,
})

const mapWasteCollection = (row: Record<string, any>): WasteCollection => ({
  id: row.id,
  residentId: row.residentId,
  pspOperatorId: row.pspOperatorId,
  routeId: row.routeId,
  status: row.status,
  scheduledDate: row.scheduledDate,
  actualCollectionTime: row.actualCollectionTime,
  address: row.address,
  ward: row.ward,
  street: row.street,
  latitude: asOptionalNumber(row.latitude),
  longitude: asOptionalNumber(row.longitude),
  notes: row.notes,
  photoUrl: row.photoUrl,
  scheduledTruckCode: row.scheduledTruckCode,
  reportedTruckCode: row.reportedTruckCode,
  residentConfirmed: row.residentConfirmed,
  residentConfirmedAt: row.residentConfirmedAt,
  isVerified: row.isVerified,
  verificationTime: row.verificationTime,
  createdAt: row.createdAt,
})

const mapReport = (row: Record<string, any>): Report => ({
  id: row.id,
  ticketNumber: row.ticketNumber,
  reporterId: row.reporterId,
  assignedToId: row.assignedToId,
  type: row.type,
  title: row.title,
  description: row.description,
  address: row.address,
  ward: row.ward,
  street: row.street,
  latitude: asOptionalNumber(row.latitude),
  longitude: asOptionalNumber(row.longitude),
  status: row.status,
  priority: row.priority,
  photoUrls: splitUrlList(row.photoUrls),
  resolutionNotes: row.resolutionNotes,
  resolvedAt: row.resolvedAt,
  dueAt: row.dueAt,
  firstResponseAt: row.firstResponseAt,
  escalatedAt: row.escalatedAt,
  resolutionEvidenceUrls: splitUrlList(row.resolutionEvidenceUrls),
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

const mapServiceRequest = (row: Record<string, any>): ServiceRequest => ({
  id: row.id,
  requestNumber: row.requestNumber,
  residentId: row.residentId,
  assignedToId: row.assignedToId,
  type: row.type,
  status: row.status,
  priority: row.priority,
  title: row.title,
  description: row.description,
  address: row.address,
  ward: row.ward,
  street: row.street,
  latitude: asOptionalNumber(row.latitude),
  longitude: asOptionalNumber(row.longitude),
  preferredDate: row.preferredDate,
  scheduledFor: row.scheduledFor,
  slaDueAt: row.slaDueAt,
  completedAt: row.completedAt,
  resolutionNotes: row.resolutionNotes,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

const mapCollectionRequest = (row: Record<string, any>, resident?: User): CollectionRequest => ({
  id: row.id,
  residentId: row.residentId,
  resident: resident || ({} as User),
  type: row.type,
  status: row.status,
  preferredDate: row.preferredDate,
  description: row.description,
  scheduledDate: row.scheduledDate,
  completedAt: row.completedAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

const mapCollectionRoute = (row: Record<string, any>): CollectionRoute => ({
  id: row.id,
  routeCode: row.routeCode,
  name: row.name,
  ward: row.ward,
  street: row.street,
  zone: row.zone,
  frequency: row.frequency,
  serviceDay: row.serviceDay,
  startTimeWindow: row.startTimeWindow,
  endTimeWindow: row.endTimeWindow,
  nextCollectionDate: row.nextCollectionDate,
  lastCompletedAt: row.lastCompletedAt,
  status: row.status,
  pspOperatorId: row.pspOperatorId,
  truckCode: row.truckCode,
  notes: row.notes,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

const mapServiceSchedule = (row: Record<string, any>): ServiceSchedule => ({
  id: row.id,
  scheduleCode: row.scheduleCode,
  serviceType: row.serviceType,
  ward: row.ward,
  street: row.street,
  zone: row.zone,
  frequency: row.frequency,
  serviceDays: Array.isArray(row.serviceDays) ? row.serviceDays : [],
  startTimeWindow: row.startTimeWindow || '',
  endTimeWindow: row.endTimeWindow || '',
  status: row.status,
  description: row.description,
  operatorName: row.operatorName,
  operatorPhoneNumber: row.operatorPhoneNumber,
  operatorEmail: row.operatorEmail,
  notes: row.notes,
  effectiveFromDate: row.effectiveFromDate,
  effectiveToDate: row.effectiveToDate,
  publishedDate: row.publishedDate,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

const mapBill = (row: Record<string, any>): Bill => ({
  id: row.id,
  billNumber: row.billNumber,
  userId: row.userId,
  billingPeriod: row.billingPeriod,
  propertyType: row.propertyType,
  amount: asNumber(row.amount),
  lateFee: asNumber(row.lateFee),
  totalAmount: asNumber(row.totalAmount),
  status: row.status,
  dueDate: row.dueDate,
  paidAt: row.paidAt,
  paymentReference: row.paymentReference,
  paymentMethod: row.paymentMethod,
  notes: row.notes,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

// Bubble up bill payment sub-query response; DB returns a plain object or array.
interface BillPaymentRow extends Record<string, any> {}

const mapBillPayment = (row: BillPaymentRow): BillPayment => ({
  id: row.id,
  billId: row.billId,
  userId: row.userId,
  amount: asNumber(row.amount),
  paymentReference: row.paymentReference,
  paymentMethod: row.paymentMethod,
  status: row.status,
  paystackReference: row.paystackReference,
  paystackAccessCode: row.paystackAccessCode,
  metadata: row.metadata,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

const mapPayout = (row: Record<string, any>): PayoutRequest => ({
  id: row.id,
  userId: row.userId,
  user: {} as PayoutRequest['user'],
  amount: asNumber(row.amount),
  status: row.status,
  type: row.type,
  transferReference: row.transferReference,
  transferCode: row.transferCode,
  paystackReference: row.paystackReference,
  failureReason: row.failureReason,
  notes: row.notes,
  processedBy: row.processedBy,
  processedAt: row.processedAt,
  completedAt: row.completedAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

const mapAdminInvite = (row: Record<string, any>): AdminInvite => {
  let status: AdminInvite['status'] = 'active'
  if (row.revokedAt) status = 'revoked'
  else if (row.usedAt) status = 'used'
  else if (row.expiresAt && new Date(row.expiresAt) < new Date()) status = 'expired'
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    createdByUserId: row.createdByUserId,
    usedByUserId: row.usedByUserId ?? null,
    expiresAt: row.expiresAt,
    usedAt: row.usedAt ?? null,
    revokedAt: row.revokedAt ?? null,
    note: row.note ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    status,
  }
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials)
    if (error) {
      throw new Error(error.message.toLowerCase().includes('invalid') ? 'Invalid login credentials' : error.message)
    }

    const accessToken = data.session?.access_token || ''
    const { data: profileRow, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profileError) {
      throw new Error(profileError.message)
    }
    if (!profileRow) {
      const notFound: any = new Error('Profile not found')
      notFound.response = { status: 404 }
      throw notFound
    }

    const user = mapUser(profileRow)
    return { access_token: accessToken, token: accessToken, user }
  },

  register: async (data: Omit<RegisterData, 'email' | 'password'>): Promise<User> => {
    const userId = await getCurrentUserId()
    const meta = { userId, ...data }
    const { error } = await supabase.rpc('ensure_profile', { meta })
    if (error) {
      throw new Error(error.message)
    }
    const { data: row, error: profileError } = await supabase.from('users').select('*').eq('id', userId).maybeSingle()
    if (profileError || !row) {
      throw profileError || new Error('Profile could not be created.')
    }
    return mapUser(row)
  },

  getProfile: async (): Promise<User> => {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    if (!data) {
      const notFound: any = new Error('Profile not found')
      notFound.response = { status: 404 }
      throw notFound
    }
    return mapUser(data)
  },

  requestPasswordReset: async (email: string, workspace: 'resident' | 'admin' = 'resident'): Promise<{ message: string }> => {
    const redirectTo = `${window.location.origin}/reset-password?workspace=${workspace}`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) {
      throw new Error(error.message || 'Could not send the password reset email.')
    }
    return { message: 'If an account exists for this email, a reset link has been sent.' }
  },

  validateAdminInvite: async (data: { email: string; token: string }): Promise<AdminInvite> =>
    invokeEdge<AdminInvite>('admin-invites', { action: 'validate', ...data }),

  bootstrapAdmin: async (data: {
    bootstrapToken: string
    email: string
    password: string
    firstName: string
    lastName: string
    phoneNumber: string
    address: string
    ward: string
    houseNumber: string
    street: string
  }): Promise<AuthResponse & { message: string }> => invokeEdge<AuthResponse & { message: string }>('admin-bootstrap', data),

  acceptAdminInvite: async (data: {
    token: string
    email: string
    password: string
    firstName: string
    lastName: string
    phoneNumber: string
    address: string
    ward: string
    houseNumber: string
    street: string
  }): Promise<AuthResponse & { message: string }> =>
    invokeEdge<AuthResponse & { message: string }>('admin-invites', { action: 'accept', ...data }),
}

export const adminInvitesApi = {
  create: async (
    data: { email: string; expiresInHours?: number; note?: string },
  ): Promise<{ invite: AdminInvite; token: string; inviteLink: string; emailSent: boolean }> =>
    invokeEdge<{ invite: AdminInvite; token: string; inviteLink: string; emailSent: boolean }>('admin-invites', {
      action: 'create',
      ...data,
    }),

  list: async (): Promise<AdminInvite[]> => {
    const { data, error } = await supabase
      .from('admin_invites')
      .select('*')
      .order('createdAt', { ascending: false })
    if (error) {
      throwSupabaseError(error, 'Could not load admin invites')
    }
    return (data || []).map(mapAdminInvite)
  },

  revoke: async (id: string): Promise<AdminInvite> =>
    invokeEdge<AdminInvite>('admin-invites', { action: 'revoke', id }),
}

export const wasteCollectionsApi = {
  getCollections: async (): Promise<WasteCollection[]> => {
    const { data, error } = await supabase
      .from('waste_collections')
      .select('*')
      .order('scheduledDate', { ascending: false })
    if (error) {
      throwSupabaseError(error, 'Could not load waste collections')
    }
    return (data || []).map(mapWasteCollection)
  },

  getMyCollections: async (): Promise<WasteCollection[]> => {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('waste_collections')
      .select('*')
      .eq('residentId', userId)
      .order('scheduledDate', { ascending: false })
    if (error) {
      throwSupabaseError(error, 'Could not load your waste collections')
    }
    return (data || []).map(mapWasteCollection)
  },

  getStats: async (): Promise<{ lastPickup: string | null; thisMonth: number }> => {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase.from('waste_collections').select('*').eq('residentId', userId)
    if (error) {
      throwSupabaseError(error, 'Could not load collection statistics')
    }

    let lastPickup: string | null = null
    for (const row of data || []) {
      if (row.actualCollectionTime && (!lastPickup || new Date(row.actualCollectionTime) > new Date(lastPickup))) {
        lastPickup = row.actualCollectionTime
      }
    }

    const now = new Date()
    const thisMonth = (data || []).filter((row) => {
      const value = row.actualCollectionTime || row.scheduledDate
      if (!value) return false
      const parsed = new Date(value)
      return parsed.getFullYear() === now.getFullYear() && parsed.getMonth() === now.getMonth()
    }).length

    return { lastPickup, thisMonth }
  },

  scheduleCollection: async (data: { scheduledDate: string; notes?: string }) => {
    const userId = await getCurrentUserId()
    const { data: profile } = await supabase.auth.getUser()
    const meta = profile.user?.user_metadata || {}

    const { data: inserted, error } = await supabase
      .from('waste_collections')
      .insert({
        residentId: userId,
        scheduledDate: data.scheduledDate,
        notes: data.notes || null,
        status: 'scheduled',
        address: String(meta.address || ''),
        ward: String(meta.ward || ''),
        street: String(meta.street || ''),
        latitude: asOptionalNumber(meta.latitude),
        longitude: asOptionalNumber(meta.longitude),
      })
      .select('*')
      .single()

    if (error) {
      throwSupabaseError(error, 'Could not schedule this collection')
    }
    return mapWasteCollection(inserted)
  },

  confirmCollection: async (id: string, observedTruckCode: string) => {
    const { data, error } = await supabase
      .from('waste_collections')
      .update({
        residentConfirmed: true,
        reportedTruckCode: observedTruckCode,
        residentConfirmedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not confirm this collection')
    }
    return mapWasteCollection(data)
  },

  verifyCollection: async (id: string) => {
    const { data, error } = await supabase
      .from('waste_collections')
      .update({ isVerified: true, verificationTime: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not verify this collection')
    }
    return mapWasteCollection(data)
  },
}

const RECYCLABLE_RATES: Record<string, number> = {
  plastic_bottles: 0.5,
  glass_bottles: 0.3,
  aluminum_cans: 1.2,
  cardboard: 0.25,
  paper: 0.4,
  metal_scraps: 0.8,
  electronics: 2.5,
  other: 0.2,
}

const estimateRecyclableValue = (data: Partial<Recyclable>): number => {
  const rate = RECYCLABLE_RATES[data.type || 'other'] || 0.2
  const quantity = asNumber(data.quantity)
  const estimatedKg = data.unit && data.unit !== 'kg' ? quantity * 0.5 : quantity
  return Math.round(estimatedKg * rate * 100) / 100
}

export const recyclablesApi = {
  getRecyclables: async (): Promise<Recyclable[]> => {
    const { data, error } = await supabase.from('recyclables').select('*').order('createdAt', { ascending: false })
    if (error) {
      throwSupabaseError(error, 'Could not load recyclables')
    }
    return (data || []).map(mapRecyclable)
  },

  getMyRecyclables: async (): Promise<Recyclable[]> => {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase.from('recyclables').select('*').eq('userId', userId).order('createdAt', { ascending: false })
    if (error) {
      throwSupabaseError(error, 'Could not load your recyclables')
    }
    return (data || []).map(mapRecyclable)
  },

  getValuationSummary: async (): Promise<{
    totalEstimated: number
    totalActual: number
    pendingItems: number
    paidItems: number
  }> => {
    const { data, error } = await supabase.from('recyclables').select('*')
    if (error) {
      throwSupabaseError(error, 'Could not load valuation summary')
    }
    const rows = data || []
    let totalEstimated = 0
    let totalActual = 0
    let pendingItems = 0
    let paidItems = 0
    for (const row of rows) {
      totalEstimated += asNumber(row.estimatedValue)
      totalActual += asNumber(row.actualValue)
      if (row.status === 'logged' || row.status === 'pickup_requested') pendingItems += 1
      if (row.status === 'paid') paidItems += 1
    }
    return { totalEstimated, totalActual, pendingItems, paidItems }
  },

  submitRecyclable: async (data: Partial<Recyclable>): Promise<Recyclable> => {
    const userId = await getCurrentUserId()
    const { data: inserted, error } = await supabase
      .from('recyclables')
      .insert({
        userId,
        type: data.type,
        quantity: data.quantity,
        unit: data.unit || 'kg',
        estimatedValue: data.estimatedValue ?? estimateRecyclableValue(data),
        status: 'logged',
        description: data.description || null,
        latitude: asOptionalNumber(data.latitude),
        longitude: asOptionalNumber(data.longitude),
      })
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not submit the recyclable item')
    }
    return mapRecyclable(inserted)
  },

  createRecyclable: async (data: Partial<Recyclable>): Promise<Recyclable> => {
    const userId = await getCurrentUserId()
    const { data: inserted, error } = await supabase
      .from('recyclables')
      .insert({
        userId,
        type: data.type,
        quantity: data.quantity,
        unit: data.unit || 'kg',
        estimatedValue: data.estimatedValue ?? estimateRecyclableValue(data),
        status: 'logged',
        description: data.description || null,
        latitude: asOptionalNumber(data.latitude),
        longitude: asOptionalNumber(data.longitude),
      })
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not add the recyclable item')
    }
    return mapRecyclable(inserted)
  },

  updateRecyclable: async (id: string, data: Partial<Recyclable>): Promise<Recyclable> => {
    const userId = await getCurrentUserId()
    const role = await getCurrentUserRole()
    let query = supabase.from('recyclables').update({
      type: data.type,
      quantity: data.quantity,
      unit: data.unit,
      estimatedValue: data.estimatedValue,
      actualValue: data.actualValue,
      status: data.status,
      description: data.description,
      photoUrl: data.photoUrl,
      latitude: asOptionalNumber(data.latitude),
      longitude: asOptionalNumber(data.longitude),
      pickupDate: data.pickupDate,
      collectionDate: data.collectionDate,
    })
    if (role === 'resident') {
      query = query.eq('userId', userId)
    }
    const { data: updated, error } = await query
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not update the recyclable item')
    }
    return mapRecyclable(updated)
  },

  requestPickup: async (id: string): Promise<Recyclable> => {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('recyclables')
      .update({ status: 'pickup_requested' })
      .eq('id', id)
      .eq('userId', userId)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not request a pickup')
    }
    return mapRecyclable(data)
  },
}

export const walletApi = {
  getBanks: async (): Promise<Bank[]> => invokeEdge<Bank[]>('wallet', { action: 'getBanks' }),

  resolveAccount: async (data: { accountNumber: string; bankCode: string }): Promise<AccountResolution> =>
    invokeEdge<AccountResolution>('wallet', { action: 'resolveAccount', ...data }),

  getTransactions: async (): Promise<WalletTransaction[]> => {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
    if (error) {
      throwSupabaseError(error, 'Could not load wallet transactions')
    }
    return (data || []).map(mapWalletTransaction)
  },

  getWithdrawals: async (): Promise<WalletTransaction[]> => {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('type', 'debit')
      .order('createdAt', { ascending: false })
    if (error) {
      throwSupabaseError(error, 'Could not load withdrawals')
    }
    const enriched = await attachUsers((data || []).map(mapWalletTransaction))
    return enriched.map((transaction) => ({
      ...transaction,
      metadata: (transaction as unknown as { metadata?: Record<string, unknown> }).metadata ?? {},
    })) as unknown as WalletTransaction[]
  },

  getWithdrawalStatus: async (id: string): Promise<WithdrawalStatus> =>
    invokeEdge<WithdrawalStatus>('payouts', { action: 'status', id }),

  getBalance: async (): Promise<{ balance: number }> => {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('balanceAfter,createdAt')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error && error.code !== 'PGRST116') {
      throwSupabaseError(error, 'Could not load wallet balance')
    }
    return { balance: data?.balanceAfter != null ? asNumber(data.balanceAfter) : 0 }
  },

  getWithdrawalLimits: async (): Promise<{
    minAmount: number
    maxAmount: number
    dailyLimit: number
    dailyWithdrawn: number
    remainingDaily: number
  }> => {
    const userId = await getCurrentUserId()
    const minAmount = 100
    const maxAmount = 50000
    const dailyLimit = 100000

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('userId', userId)
      .eq('type', 'debit')
      .gte('createdAt', startOfDay.toISOString())
    if (error) {
      throwSupabaseError(error, 'Could not load withdrawal limits')
    }
    const dailyWithdrawn = (data || []).reduce((sum, row) => sum + asNumber(row.amount), 0)
    return { minAmount, maxAmount, dailyLimit, dailyWithdrawn, remainingDaily: Math.max(0, dailyLimit - dailyWithdrawn) }
  },

  getSummary: async (): Promise<{
    totalCredits: number
    totalDebits: number
    netBalance: number
    transactionCount: number
    lastTransaction: string | null
  }> => {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
    if (error) {
      throwSupabaseError(error, 'Could not load wallet summary')
    }

    let totalCredits = 0
    let totalDebits = 0
    let lastTransaction: string | null = null
    for (const row of data || []) {
      if (row.type === 'credit') totalCredits += asNumber(row.amount)
      if (row.type === 'debit') totalDebits += asNumber(row.amount)
      if (!lastTransaction && row.createdAt) lastTransaction = row.createdAt
    }

    return {
      totalCredits,
      totalDebits,
      netBalance: totalCredits - totalDebits,
      transactionCount: (data || []).length,
      lastTransaction,
    }
  },

  withdraw: async (data: WithdrawalRequest): Promise<WalletTransaction> =>
    invokeEdge<WalletTransaction>('wallet', { action: 'withdraw', ...data }),
}

export const uploadApi = {
  uploadImage: async (file: File): Promise<{ success: boolean; imageUrl: string; message: string }> => {
    const imageUrl = await supabaseUploadImage(file)
    return { success: true, imageUrl, message: 'Image uploaded successfully' }
  },
}

const attachReporters = async (reports: Report[]): Promise<Report[]> => {
  const reporterIds = Array.from(new Set(reports.map((report) => report.reporterId).filter(Boolean)))
  if (reporterIds.length === 0) return reports
  const usersMap = await fetchUsersByIds(reporterIds)
  return reports.map((report) => ({ ...report, reporter: usersMap[report.reporterId] }))
}

export const reportsApi = {
  getReports: async (): Promise<Report[]> => {
    const { data, error } = await supabase.from('reports').select('*').order('createdAt', { ascending: false })
    if (error) {
      throwSupabaseError(error, 'Could not load reports')
    }
    return attachReporters((data || []).map(mapReport))
  },

  createReport: async (data: Partial<Report>): Promise<Report> => {
    const userId = await getCurrentUserId()
    const { data: inserted, error } = await supabase
      .from('reports')
      .insert({
        ticketNumber: `RPT-${Date.now()}`,
        reporterId: userId,
        type: data.type,
        title: data.title,
        description: data.description,
        address: data.address,
        ward: data.ward,
        street: data.street,
        latitude: asOptionalNumber(data.latitude),
        longitude: asOptionalNumber(data.longitude),
        status: data.status || 'submitted',
        priority: data.priority || 'medium',
        photoUrls: joinUrlList(data.photoUrls),
      })
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not submit the report')
    }
    return mapReport(inserted)
  },

  updateReport: async (id: string, data: Partial<Report>): Promise<Report> => {
    const { data: updated, error } = await supabase
      .from('reports')
      .update({
        type: data.type,
        title: data.title,
        description: data.description,
        address: data.address,
        ward: data.ward,
        street: data.street,
        latitude: asOptionalNumber(data.latitude),
        longitude: asOptionalNumber(data.longitude),
        status: data.status,
        priority: data.priority,
        assignedToId: data.assignedToId,
        resolutionNotes: data.resolutionNotes,
        resolvedAt: data.resolvedAt,
        dueAt: data.dueAt,
        firstResponseAt: data.firstResponseAt,
        escalatedAt: data.escalatedAt,
        photoUrls: joinUrlList(data.photoUrls),
        resolutionEvidenceUrls: joinUrlList(data.resolutionEvidenceUrls),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not update the report')
    }
    return mapReport(updated)
  },
}

export const collectionRoutesApi = {
  getRoutes: async (): Promise<CollectionRoute[]> => {
    const { data, error } = await supabase.from('collection_routes').select('*').order('nextCollectionDate', { ascending: true })
    if (error) {
      throwSupabaseError(error, 'Could not load collection routes')
    }
    return (data || []).map(mapCollectionRoute)
  },

  getMyRoutes: async (): Promise<CollectionRoute[]> => {
    const { data, error } = await supabase
      .from('collection_routes')
      .select('*')
      .eq('status', 'active')
      .order('nextCollectionDate', { ascending: true })
    if (error) {
      throwSupabaseError(error, 'Could not load collection routes')
    }
    return (data || []).map(mapCollectionRoute)
  },

  getSummary: async (): Promise<{ totalRoutes: number; activeRoutes: number; disruptedRoutes: number; dueToday: number }> => {
    const { data, error } = await supabase.from('collection_routes').select('*')
    if (error) {
      throwSupabaseError(error, 'Could not load collection route summary')
    }
    const rows = data || []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const totalRoutes = rows.length
    const activeRoutes = rows.filter((row) => row.status === 'active').length
    const disruptedRoutes = rows.filter((row) => row.status === 'disrupted').length
    const dueToday = rows.filter((row) => {
      if (!row.nextCollectionDate) return false
      const parsed = new Date(row.nextCollectionDate)
      return parsed >= today && parsed < tomorrow
    }).length

    return { totalRoutes, activeRoutes, disruptedRoutes, dueToday }
  },

  createRoute: async (data: Partial<CollectionRoute>): Promise<CollectionRoute> => {
    const { data: inserted, error } = await supabase
      .from('collection_routes')
      .insert({
        routeCode: data.routeCode || `RT-${Date.now()}`,
        name: data.name,
        ward: data.ward,
        street: data.street,
        zone: data.zone || null,
        frequency: data.frequency || 'weekly',
        serviceDay: data.serviceDay || '',
        startTimeWindow: data.startTimeWindow || '07:00',
        endTimeWindow: data.endTimeWindow || '11:00',
        nextCollectionDate: data.nextCollectionDate,
        status: data.status || 'active',
        pspOperatorId: data.pspOperatorId || null,
        truckCode: data.truckCode || null,
        notes: data.notes || null,
      })
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not create this route')
    }
    return mapCollectionRoute(inserted)
  },

  updateRoute: async (id: string, data: Partial<CollectionRoute>): Promise<CollectionRoute> => {
    const { data: updated, error } = await supabase
      .from('collection_routes')
      .update({
        name: data.name,
        ward: data.ward,
        street: data.street,
        zone: data.zone,
        frequency: data.frequency,
        serviceDay: data.serviceDay,
        startTimeWindow: data.startTimeWindow,
        endTimeWindow: data.endTimeWindow,
        nextCollectionDate: data.nextCollectionDate,
        status: data.status,
        pspOperatorId: data.pspOperatorId,
        truckCode: data.truckCode,
        notes: data.notes,
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not update this route')
    }
    return mapCollectionRoute(updated)
  },

  completeRoute: async (id: string, payload?: { completedAt?: string; notes?: string }) => {
    const { data: existing, error: fetchError } = await supabase
      .from('collection_routes')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (fetchError) {
      throwSupabaseError(fetchError, 'Could not complete this route')
    }
    if (!existing) {
      throw new Error('This route no longer exists.')
    }

    const base = existing.nextCollectionDate ? new Date(existing.nextCollectionDate) : new Date()
    const advanceBy: Record<string, (day: number) => number> = {
      daily: (day: number) => day + 1,
      weekly: (day: number) => day + 7,
      biweekly: (day: number) => day + 14,
      monthly: (day: number) => day + 28,
    }
    const frequency = (existing.frequency as string) || 'weekly'
    const nextDate = new Date(base)
    const advance = advanceBy[frequency] || advanceBy.weekly
    nextDate.setDate(advance(nextDate.getDate()))

    const { data, error } = await supabase
      .from('collection_routes')
      .update({
        lastCompletedAt: payload?.completedAt || new Date().toISOString(),
        nextCollectionDate: nextDate.toISOString(),
        notes: payload?.notes || null,
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not complete this route')
    }
    return mapCollectionRoute(data)
  },

  confirmResidentCollection: async (id: string, payload: { observedTruckCode: string }) => {
    const userId = await getCurrentUserId()
    const { data: matched, error: matchError } = await supabase
      .from('waste_collections')
      .select('*')
      .eq('residentId', userId)
      .eq('routeId', id)
      .in('status', ['scheduled', 'in_progress'])
      .maybeSingle()
    if (matchError) {
      throwSupabaseError(matchError, 'Could not find a collection record for this route')
    }
    if (!matched) {
      throw new Error('No scheduled collection was found for this route.')
    }
    const { data: updated, error } = await supabase
      .from('waste_collections')
      .update({
        residentConfirmed: true,
        reportedTruckCode: payload.observedTruckCode,
        residentConfirmedAt: new Date().toISOString(),
      })
      .eq('id', matched.id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not confirm the refuse collection')
    }
    return mapWasteCollection(updated)
  },
}

// Fleet helpers ------------------------------------------------------------

const mapDriver = (row: Record<string, any>, user?: User, currentVehicle?: Driver['currentVehicle']): Driver => ({
  id: row.id,
  driverCode: row.driver_code,
  user: user || ({} as User),
  userId: row.user_id,
  licenseNumber: row.license_number,
  licenseClass: row.license_class,
  licenseExpiryDate: row.license_expiry_date,
  emergencyContact: row.emergency_contact,
  emergencyPhone: row.emergency_phone,
  hireDate: row.hire_date,
  status: row.status,
  specializations: typeof row.specializations === 'string'
    ? row.specializations.split(',').map((item: string) => item.trim()).filter(Boolean)
    : undefined,
  performanceRating: asNumber(row.performance_rating),
  totalRoutes: asNumber(row.total_routes),
  completedRoutes: asNumber(row.completed_routes),
  averageCompletionTime: asNumber(row.average_completion_time),
  notes: row.notes,
  currentVehicle,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const mapVehicle = (row: Record<string, any>, currentDriver?: Vehicle['currentDriver'], maintenanceStatus?: Vehicle['maintenanceStatus']): Vehicle => ({
  id: row.id,
  vehicleCode: row.vehicle_code,
  plateNumber: row.plate_number,
  make: row.make,
  model: row.model,
  year: asNumber(row.year),
  vehicleType: row.vehicle_type,
  fuelType: row.fuel_type,
  capacity: asNumber(row.capacity),
  capacityUnit: row.capacity_unit,
  status: row.status,
  purchaseDate: row.purchase_date,
  purchasePrice: asOptionalNumber(row.purchase_price),
  insuranceExpiry: row.insurance_expiry,
  registrationExpiry: row.registration_expiry,
  lastServiceDate: row.last_service_date,
  nextServiceDue: row.next_service_due,
  currentMileage: asNumber(row.current_mileage),
  fuelEfficiency: asNumber(row.fuel_efficiency),
  totalRoutes: asNumber(row.total_routes),
  averageDowntime: asNumber(row.average_downtime),
  currentLocation: row.current_location,
  latitude: asOptionalNumber(row.latitude),
  longitude: asOptionalNumber(row.longitude),
  notes: row.notes,
  currentDriver,
  maintenanceStatus,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const fetchAssignmentVehicles = async (driverIds: string[]): Promise<Record<string, Driver['currentVehicle']>> => {
  if (driverIds.length === 0) return {}
  const { data, error } = await supabase
    .from('vehicle_assignments')
    .select('*')
    .in('driver_id', driverIds)
    .eq('status', 'active')
  if (error || !data || data.length === 0) return {}

  const vehicleIds = Array.from(new Set(data.map((assignment) => assignment.vehicle_id).filter(Boolean)))
  const result: Record<string, Driver['currentVehicle']> = {}
  for (const assignment of data) {
    if (!assignment.vehicle_id) continue
    const { data: vehicleRow } = await supabase.from('vehicles').select('*').eq('id', assignment.vehicle_id).maybeSingle()
    if (vehicleRow) {
      result[assignment.driver_id] = {
        id: vehicleRow.id,
        vehicleCode: vehicleRow.vehicle_code,
        plateNumber: vehicleRow.plate_number,
        vehicleType: vehicleRow.vehicle_type,
        assignedDate: assignment.assigned_date,
      }
    }
  }
  return result
}

const enrichDrivers = async (rows: Record<string, any>[]): Promise<Driver[]> => {
  if (rows.length === 0) return []
  const usersMap = await fetchUsersByIds(rows.map((row) => row.user_id).filter(Boolean))
  const vehiclesMap = await fetchAssignmentVehicles(rows.map((row) => row.id))
  return rows.map((row) => mapDriver(row, usersMap[row.user_id], vehiclesMap[row.id]))
}

const fetchDriverRows = async (id: string): Promise<Record<string, any> | null> => {
  const { data, error } = await supabase.from('drivers').select('*').eq('id', id).maybeSingle()
  if (error) throwSupabaseError(error, 'Could not load driver')
  return data
}

const fetchVehicleRowsByIds = async (ids: string[]): Promise<Record<string, Record<string, any>>> => {
  const map: Record<string, Record<string, any>> = {}
  if (ids.length === 0) return map
  const { data, error } = await supabase.from('vehicles').select('*').in('id', ids)
  if (error) return map
  for (const row of data || []) map[row.id] = row
  return map
}

const enrichVehicles = async (rows: Record<string, any>[]): Promise<Vehicle[]> => {
  const vehicles = rows.map((row) => mapVehicle(row))
  if (rows.length === 0) return vehicles

  const vehicleIds = rows.map((row) => row.id)
  const { data: assignments } = await supabase
    .from('vehicle_assignments')
    .select('*')
    .in('vehicle_id', vehicleIds)
    .eq('status', 'active')

  if (!assignments || assignments.length === 0) return vehicles

  const driverIds = Array.from(new Set(assignments.map((assignment) => assignment.driver_id).filter(Boolean)))
  const usersMap = driverIds.length > 0 ? await fetchUsersByIds(driverIds) : {}
  const driverRows: Record<string, Record<string, any>> = {}
  if (driverIds.length > 0) {
    const { data: driverData } = await supabase.from('drivers').select('*').in('id', driverIds)
    for (const row of driverData || []) driverRows[row.id] = row
  }

  const byVehicle: Record<string, Vehicle['currentDriver']> = {}
  for (const assignment of assignments) {
    const driverRow = driverRows[assignment.driver_id]
    if (!driverRow) continue
    const name = [usersMap[driverRow.user_id]?.firstName, usersMap[driverRow.user_id]?.lastName].filter(Boolean).join(' ')
    byVehicle[assignment.vehicle_id] = {
      id: driverRow.id,
      driverCode: driverRow.driver_code,
      name: name || driverRow.driver_code,
      assignedDate: assignment.assigned_date,
    }
  }

  return vehicles.map((vehicle) => ({
    ...vehicle,
    currentDriver: byVehicle[vehicle.id],
    maintenanceStatus: {
      overdue: asNumber(vehicle.totalRoutes) > 0 ? 0 : 0,
    },
  }))
}

const mapRouteExecution = (
  row: Record<string, any>,
  route?: CollectionRoute,
  driver?: Driver,
  vehicle?: Vehicle,
): RouteExecution => ({
  id: row.id,
  route: route || ({} as CollectionRoute),
  driver,
  vehicle,
  scheduledDate: row.scheduled_date,
  startedAt: row.started_at,
  completedAt: row.completed_at,
  status: row.status,
  plannedStops: asNumber(row.planned_stops),
  completedStops: asNumber(row.completed_stops),
  totalDistance: asOptionalNumber(row.total_distance),
  fuelUsed: asOptionalNumber(row.fuel_used),
  wasteCollected: asOptionalNumber(row.waste_collected),
  wasteUnit: row.waste_unit,
  startMileage: asOptionalNumber(row.start_mileage),
  endMileage: asOptionalNumber(row.end_mileage),
  startLocation: row.start_location,
  endLocation: row.end_location,
  routeGpsTrace: row.route_gps_trace,
  delayReason: row.delay_reason,
  delayMinutes: asNumber(row.delay_minutes),
  issues: row.issues,
  notes: row.notes,
  driverRating: asOptionalNumber(row.driver_rating),
  residentSatisfaction: asOptionalNumber(row.resident_satisfaction),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const enrichExecutions = async (rows: Record<string, any>[]): Promise<RouteExecution[]> => {
  if (rows.length === 0) return []

  const routeIds = Array.from(new Set(rows.map((row) => row.route_id).filter(Boolean)))
  const driverIds = Array.from(new Set(rows.map((row) => row.driver_id).filter(Boolean)))
  const vehicleIds = Array.from(new Set(rows.map((row) => row.vehicle_id).filter(Boolean)))

  const [routeRows, driverRows, vehicleRows] = await Promise.all([
    routeIds.length > 0 ? supabase.from('collection_routes').select('*').in('id', routeIds) : Promise.resolve({ data: [] }),
    driverIds.length > 0 ? supabase.from('drivers').select('*').in('id', driverIds) : Promise.resolve({ data: [] }),
    vehicleIds.length > 0 ? supabase.from('vehicles').select('*').in('id', vehicleIds) : Promise.resolve({ data: [] }),
  ])

  const routesMap: Record<string, CollectionRoute> = {}
  for (const row of (routeRows.data || []) as any[]) routesMap[row.id] = mapCollectionRoute(row)

  let driversMap: Record<string, Driver> = {}
  if ((driverRows.data || []).length > 0) {
    const enriched = await enrichDrivers(driverRows.data as Record<string, any>[])
    for (const driver of enriched) driversMap[driver.id] = driver
  }

  let vehiclesMap: Record<string, Vehicle> = {}
  if ((vehicleRows.data || []).length > 0) {
    const enriched = await enrichVehicles(vehicleRows.data as Record<string, any>[])
    for (const vehicle of enriched) vehiclesMap[vehicle.id] = vehicle
  }

  return rows.map((row) =>
    mapRouteExecution(row, routesMap[row.route_id], driversMap[row.driver_id], vehiclesMap[row.vehicle_id]),
  )
}

const routePerformance = (rows: any[]) => {
  const totalExecutions = rows.length
  const completedExecutions = rows.filter((row) => row.status === 'completed').length
  const completionRate = totalExecutions > 0 ? ((completedExecutions / totalExecutions) * 100).toFixed(1) : '0.0'
  const durations = rows
    .filter((row) => row.started_at && row.completed_at)
    .map((row) => {
      const start = new Date(row.started_at).getTime()
      const end = new Date(row.completed_at).getTime()
      return Math.max(0, (end - start) / (1000 * 60))
    })
  const nums = rows.map((row) => asNumber(row.value))
  const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0

  return {
    totalExecutions,
    completedExecutions,
    completionRate,
    averageDuration: durations.length ? average(durations) : 0,
    averageDistance: rows.length ? average(rows.map((row) => asNumber(row.total_distance))) : 0,
    averageFuel: rows.length ? average(rows.map((row) => asNumber(row.fuel_used))) : 0,
    averageWaste: rows.length ? average(rows.map((row) => asNumber(row.waste_collected))) : 0,
    averageRating: rows.length ? average(rows.map((row) => asNumber(row.driver_rating))) : 0,
    onTimeRate: totalExecutions > 0 ? '0.0' : '0.0',
  }
}

const mapMaintenanceRecord = (row: Record<string, any>, vehicle?: Vehicle): MaintenanceRecord => ({
  id: row.id,
  vehicle: vehicle || ({} as Vehicle),
  maintenanceType: row.maintenance_type,
  status: row.status,
  priority: row.priority,
  title: row.title,
  description: row.description,
  scheduledDate: row.scheduled_date,
  startedDate: row.started_date,
  completedDate: row.completed_date,
  mileageAtMaintenance: asOptionalNumber(row.mileage_at_maintenance),
  serviceProvider: row.service_provider,
  technician: row.technician,
  estimatedCost: asOptionalNumber(row.estimated_cost),
  actualCost: asOptionalNumber(row.actual_cost),
  partsUsed: row.parts_used,
  workPerformed: row.work_performed,
  nextServiceDue: row.next_service_due,
  nextServiceMileage: asOptionalNumber(row.next_service_mileage),
  attachments: row.attachments,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export const logisticsApi = {
  getSummary: async (): Promise<LogisticsSummary> => {
    const [vehicles, drivers, assignments, routes, executions, serviceRequests, reports, collections] =
      await Promise.all([
        supabase.from('vehicles').select('*'),
        supabase.from('drivers').select('*'),
        supabase.from('vehicle_assignments').select('*').eq('status', 'active'),
        supabase.from('collection_routes').select('*'),
        supabase.from('route_executions').select('*'),
        supabase.from('service_requests').select('*'),
        supabase.from('reports').select('*'),
        supabase.from('waste_collections').select('*'),
      ])

    const vehicleRows = vehicles.data || []
    const driverRows = drivers.data || []
    const assignmentRows = assignments.data || []
    const routeRows = routes.data || []
    const executionRows = executions.data || []
    const requestRows = serviceRequests.data || []
    const reportRows = reports.data || []
    const collectionRows = collections.data || []

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const operationalVehicles = vehicleRows.filter((row) => row.status === 'operational').length
    const maintenanceVehicles = vehicleRows.filter((row) => row.status === 'maintenance').length
    const outOfServiceVehicles = vehicleRows.filter((row) => row.status === 'out_of_service' || row.status === 'retired').length
    const activeAssignments = new Set(assignmentRows.map((row) => row.vehicle_id).filter(Boolean)).size

    const activeRoutes = routeRows.filter((row) => row.status === 'active')
    const activeRouteIds = new Set(activeRoutes.map((row) => row.id))
    const dueToday = activeRoutes.filter((row) => {
      if (!row.next_collection_date) return false
      const parsed = new Date(row.next_collection_date)
      return parsed >= today && parsed < tomorrow
    }).length
    const disruptedRoutes = routeRows.filter((row) => row.status === 'disrupted').length
    const missingTruckToday = activeRoutes.filter((row) => !row.truck_code).length

    const scheduledExecutions = executionRows.filter((row) => row.status === 'scheduled').length
    const inProgressExecutions = executionRows.filter((row) => row.status === 'in_progress').length
    const completedExecutions = executionRows.filter((row) => row.status === 'completed').length
    const readyToday = Math.max(0, dueToday - missingTruckToday)
    const readinessPercent = dueToday > 0 ? Math.round((readyToday / dueToday) * 100) : 100

    const activeDriverIds = driverRows.filter((row) => row.status === 'active').length
    const assignedDriverIds = new Set(assignmentRows.map((row) => row.driver_id).filter(Boolean)).size

    const openServiceRequests = requestRows
      .filter((row) => ['submitted', 'triaged', 'scheduled', 'in_progress', 'escalated'].includes(row.status))
    const urgentServiceRequests = openServiceRequests.filter((row) => row.priority === 'urgent')
    const openComplaints = reportRows.filter((row) => !['resolved', 'closed'].includes(row.status))
    const urgentComplaints = openComplaints.filter((row) => row.priority === 'urgent')
    const pendingCollections = collectionRows
      .filter((row) => ['scheduled', 'in_progress'].includes(row.status))

    const usersMap = await fetchUsersByIds(driverRows.map((row) => row.user_id).filter(Boolean))
    const driversByVehicle: Record<string, Record<string, any>> = {}
    for (const assignment of assignmentRows) {
      driversByVehicle[assignment.vehicle_id] = driverRows.find((row) => row.id === assignment.driver_id)
    }
    const vehicleRowsMap: Record<string, Record<string, any>> = {}
    for (const row of vehicleRows) vehicleRowsMap[row.id] = row

    const vehicleDeployments = vehicleRows
      .filter((row) => driversByVehicle[row.id])
      .map((vehicle) => {
        const driverRow = driversByVehicle[vehicle.id]
        const user = driverRow ? usersMap[driverRow.user_id] : undefined
        return {
          vehicleCode: vehicle.vehicle_code,
          plateNumber: vehicle.plate_number,
          vehicleType: vehicle.vehicle_type,
          status: vehicle.status,
          driverName: user ? `${user.firstName} ${user.lastName}` : (driverRow?.driver_code || 'Unassigned'),
          driverCode: driverRow?.driver_code || '',
          routesToday: executionRows.filter((row) => row.vehicle_id === vehicle.id && row.scheduled_date).length,
          completedToday: executionRows.filter((row) => row.vehicle_id === vehicle.id && row.status === 'completed').length,
          inProgress: executionRows.some((row) => row.vehicle_id === vehicle.id && row.status === 'in_progress'),
          currentLocation: vehicle.current_location,
        }
      })

    const driverSummary = driverRows.map((row) => {
      const user = usersMap[row.user_id]
      return {
        id: row.id,
        driverCode: row.driver_code,
        name: user ? `${user.firstName} ${user.lastName}` : row.driver_code,
        status: row.status,
        performanceRating: asNumber(row.performance_rating),
        totalRoutes: asNumber(row.total_routes),
        completedRoutes: asNumber(row.completed_routes),
        currentVehicle: Object.entries(driversByVehicle).find(([_, value]) => value?.id === row.id)?.[0],
        routesToday: executionRows.filter((exec) => exec.driver_id === row.id && exec.scheduled_date).length,
        licenseExpiry: row.license_expiry_date,
      }
    })

    const maintenanceAlerts = vehicleRows
      .filter((row) => row.next_service_due && new Date(row.next_service_due) < new Date())
      .map((row) => ({
        vehicleCode: row.vehicle_code,
        plateNumber: row.plate_number,
        nextServiceDue: row.next_service_due,
        currentMileage: asNumber(row.current_mileage),
      }))

    const expiringLicenses = driverRows
      .filter((row) => row.license_expiry_date && new Date(row.license_expiry_date) < new Date())
      .map((row) => {
        const user = usersMap[row.user_id]
        return {
          driverCode: row.driver_code,
          name: user ? `${user.firstName} ${user.lastName}` : row.driver_code,
          licenseExpiryDate: row.license_expiry_date,
        }
      })

    return {
      fleet: {
        totalVehicles: vehicleRows.length,
        operationalVehicles,
        assignedVehicles: activeAssignments,
        availableVehicles: Math.max(0, operationalVehicles - activeAssignments),
        maintenanceVehicles,
        outOfServiceVehicles,
        totalTrucks: vehicleRows.length,
        deployedToday: activeAssignments,
        idleToday: Math.max(0, vehicleRows.length - activeAssignments),
        unassignedRoutes: missingTruckToday,
      },
      drivers: {
        totalDrivers: driverRows.length,
        activeDrivers: activeDriverIds,
        assignedDrivers: assignedDriverIds,
        availableDrivers: Math.max(0, activeDriverIds - assignedDriverIds),
        onLeave: driverRows.filter((row) => row.status === 'on_leave').length,
        suspended: driverRows.filter((row) => row.status === 'suspended').length,
      },
      readiness: {
        activeRoutes: activeRoutes.length,
        dueToday,
        readyToday,
        missingTruckToday,
        disruptedRoutes,
        readinessPercent,
        scheduledExecutions,
        inProgressExecutions,
        completedExecutions,
      },
      queues: {
        pendingCollections: pendingCollections.length,
        openServiceRequests: openServiceRequests.length,
        openComplaints: openComplaints.length,
        urgentServiceRequests: urgentServiceRequests.length,
        urgentComplaints: urgentComplaints.length,
      },
      vehicleDeployments,
      driverSummary,
      attention: {
        unassignedRoutes: routeRows
          .filter((row) => row.status === 'active' && !row.truck_code)
          .map((row) => ({
            id: row.id,
            routeCode: row.route_code,
            name: row.name,
            ward: row.ward,
            street: row.street,
            nextCollectionDate: row.next_collection_date,
          })),
        disruptedRoutes: routeRows
          .filter((row) => row.status === 'disrupted')
          .map((row) => ({
            id: row.id,
            routeCode: row.route_code,
            name: row.name,
            ward: row.ward,
            street: row.street,
            truckCode: row.truck_code,
            nextCollectionDate: row.next_collection_date,
          })),
        maintenanceAlerts,
        expiringLicenses,
      },
    }
  },

  getFleetDetails: async (): Promise<{ vehicles: Vehicle[]; drivers: Driver[]; assignments: VehicleAssignment[] }> => {
    const [vehiclesRows, driverRows, assignmentRows] = await Promise.all([
      supabase.from('vehicles').select('*'),
      supabase.from('drivers').select('*'),
      supabase.from('vehicle_assignments').select('*').eq('status', 'active'),
    ])

    const [vehicles, drivers] = await Promise.all([
      enrichVehicles((vehiclesRows.data || []) as Record<string, any>[]),
      enrichDrivers((driverRows.data || []) as Record<string, any>[]),
    ])

    const driverById: Record<string, Driver> = {}
    for (const driver of drivers) driverById[driver.id] = driver
    const vehicleById: Record<string, Vehicle> = {}
    for (const vehicle of vehicles) vehicleById[vehicle.id] = vehicle

    const assignments: VehicleAssignment[] = (assignmentRows.data || []).map((row) => {
      const driver = driverById[row.driver_id]
      const vehicle = vehicleById[row.vehicle_id]
      return {
        id: row.id,
        driver: {
          id: row.driver_id,
          driverCode: driver?.driverCode || row.driver_id,
          name: driver ? `${driver.user.firstName} ${driver.user.lastName}` : 'Unknown driver',
          performanceRating: driver?.performanceRating ?? 0,
        },
        vehicle: {
          id: row.vehicle_id,
          vehicleCode: vehicle?.vehicleCode || row.vehicle_id,
          plateNumber: vehicle?.plateNumber || '',
          vehicleType: vehicle?.vehicleType || '',
          status: vehicle?.status || '',
        },
        assignedDate: row.assigned_date,
        status: row.status,
      }
    })

    return { vehicles, drivers, assignments }
  },
}

export const locationsApi = {
  getNearby: async (params: { latitude: number; longitude: number; radius?: number }): Promise<NearbyLocationsResponse> => {
    const { data, error } = await supabase.from('collection_routes').select('*').eq('status', 'active')
    if (error) {
      throwSupabaseError(error, 'Could not load nearby locations')
    }

    const results = (data || []).map((row) => ({
      id: `route-${row.id}`,
      osmType: 'curated' as const,
      name: row.name,
      category: 'collection_point' as const,
      latitude: params.latitude,
      longitude: params.longitude,
      distanceMeters: 0,
      address: row.street,
      area: row.ward,
      capacity: 'large' as const,
      liveStatus: 'available' as const,
    }))

    return {
      center: { latitude: params.latitude, longitude: params.longitude },
      radiusMeters: params.radius ?? 5000,
      results,
    }
  },
}

export const serviceRequestsApi = {
  getRequests: async (): Promise<ServiceRequest[]> => {
    const { data, error } = await supabase.from('service_requests').select('*').order('createdAt', { ascending: false })
    if (error) {
      throwSupabaseError(error, 'Could not load service requests')
    }
    const rows = (data || []).map(mapServiceRequest)
    const residentIds = Array.from(new Set(rows.map((row) => row.residentId).filter(Boolean)))
    const usersMap = await fetchUsersByIds(residentIds)
    return rows.map((row) => ({ ...row, resident: usersMap[row.residentId] }))
  },

  getMyRequests: async (): Promise<ServiceRequest[]> => {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .eq('residentId', userId)
      .order('createdAt', { ascending: false })
    if (error) {
      throwSupabaseError(error, 'Could not load your service requests')
    }
    const rows = (data || []).map(mapServiceRequest)
    const { data: profile } = await supabase.auth.getUser()
    const resident = profile.user ? await fetchUsersByIds([profile.user.id]) : {}
    return rows.map((row) => ({ ...row, resident: resident[row.residentId] }))
  },

  getSummary: async (): Promise<{ totalRequests: number; openRequests: number; overdueRequests: number; urgentRequests: number }> => {
    const { data, error } = await supabase.from('service_requests').select('*')
    if (error) {
      throwSupabaseError(error, 'Could not load service request summary')
    }
    const rows = data || []
    const open = rows.filter((row) => !['completed', 'cancelled'].includes(row.status))
    const now = new Date()
    return {
      totalRequests: rows.length,
      openRequests: open.length,
      overdueRequests: open.filter((row) => row.sla_due_at && new Date(row.sla_due_at) < now).length,
      urgentRequests: open.filter((row) => row.priority === 'urgent').length,
    }
  },

  createRequest: async (data: Partial<ServiceRequest>): Promise<ServiceRequest> => {
    const userId = await getCurrentUserId()
    const slaDue = new Date()
    slaDue.setDate(slaDue.getDate() + 7)
    const { data: inserted, error } = await supabase
      .from('service_requests')
      .insert({
        requestNumber: `SRQ-${Date.now()}`,
        residentId: userId,
        type: data.type,
        status: data.status || 'submitted',
        priority: data.priority || 'medium',
        title: data.title,
        description: data.description,
        address: data.address,
        ward: data.ward,
        street: data.street,
        latitude: asOptionalNumber(data.latitude),
        longitude: asOptionalNumber(data.longitude),
        preferredDate: data.preferredDate || null,
        slaDueAt: data.slaDueAt || slaDue.toISOString(),
      })
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not submit the service request')
    }
    return mapServiceRequest(inserted)
  },

  updateRequest: async (id: string, data: Partial<ServiceRequest>): Promise<ServiceRequest> => {
    const { data: updated, error } = await supabase
      .from('service_requests')
      .update({
        type: data.type,
        status: data.status,
        priority: data.priority,
        title: data.title,
        description: data.description,
        assignedToId: data.assignedToId,
        address: data.address,
        ward: data.ward,
        street: data.street,
        latitude: asOptionalNumber(data.latitude),
        longitude: asOptionalNumber(data.longitude),
        preferredDate: data.preferredDate,
        scheduledFor: data.scheduledFor,
        slaDueAt: data.slaDueAt,
        completedAt: data.completedAt,
        resolutionNotes: data.resolutionNotes,
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not update the service request')
    }
    return mapServiceRequest(updated)
  },
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*').order('createdAt', { ascending: false })
    if (error) {
      throwSupabaseError(error, 'Could not load users')
    }
    return (data || []).map(mapUser)
  },

  updateProfile: async (data: { street?: string; ward?: string; houseNumber?: string; landmark?: string; propertyType?: string; latitude?: number; longitude?: number }) => {
    const userId = await getCurrentUserId()
    const { data: updated, error } = await supabase
      .from('users')
      .update({
        street: data.street,
        ward: data.ward,
        houseNumber: data.houseNumber,
        landmark: data.landmark,
        propertyType: data.propertyType,
        latitude: data.latitude ?? undefined,
        longitude: data.longitude ?? undefined,
      })
      .eq('id', userId)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not update your profile')
    }
    return mapUser(updated)
  },
}

export const collectionRequestsApi = {
  createRequest: async (data: {
    type: CollectionRequest['type']
    preferredDate?: string
    description?: string
  }): Promise<CollectionRequest> => {
    const userId = await getCurrentUserId()
    const { data: profile } = await supabase
      .from('users')
      .select('address, ward, street, latitude, longitude')
      .eq('id', userId)
      .maybeSingle()
    const geo = {
      address: String(profile?.address ?? '').trim(),
      ward: String(profile?.ward ?? '').trim(),
      street: String(profile?.street ?? '').trim(),
    }
    if (!geo.address || !geo.ward || !geo.street) {
      throw new Error('Update your profile address, ward, and street before requesting a collection.')
    }
    const { data: inserted, error } = await supabase
      .from('collection_requests')
      .insert({
        residentId: userId,
        address: geo.address,
        ward: geo.ward,
        street: geo.street,
        latitude: profile?.latitude ?? null,
        longitude: profile?.longitude ?? null,
        type: data.type,
        status: 'pending',
        preferredDate: data.preferredDate || null,
        description: data.description || null,
      })
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not submit the collection request')
    }
    return mapCollectionRequest(inserted)
  },

  getMyRequests: async (): Promise<CollectionRequest[]> => {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('collection_requests')
      .select('*')
      .eq('residentId', userId)
      .order('createdAt', { ascending: false })
    if (error) {
      throwSupabaseError(error, 'Could not load your collection requests')
    }
    return (data || []).map((row) => mapCollectionRequest(row))
  },

  getAllRequests: async (status?: CollectionRequestStatus): Promise<CollectionRequest[]> => {
    let query = supabase.from('collection_requests').select('*').order('createdAt', { ascending: false })
    if (status) {
      query = query.eq('status', status)
    }
    const { data, error } = await query
    if (error) {
      throwSupabaseError(error, 'Could not load collection requests')
    }
    const rows = (data || []) as Record<string, any>[]
    const residentIds = Array.from(new Set(rows.map((row) => row.residentId).filter(Boolean)))
    const usersMap = await fetchUsersByIds(residentIds)
    return rows.map((row) => mapCollectionRequest(row, usersMap[row.residentId]))
  },

  getOne: async (id: string): Promise<CollectionRequest> => {
    const { data, error } = await supabase.from('collection_requests').select('*').eq('id', id).maybeSingle()
    if (error) {
      throwSupabaseError(error, 'Could not load this collection request')
    }
    if (!data) {
      throw new Error('Collection request not found.')
    }
    const usersMap = await fetchUsersByIds([data.residentId])
    return mapCollectionRequest(data, usersMap[data.residentId])
  },

  scheduleRequest: async (id: string, routeId: string, scheduledDate: string): Promise<CollectionRequest> => {
    const { data, error } = await supabase
      .from('collection_requests')
      .update({ routeId, scheduledDate, status: 'scheduled' })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not schedule this request')
    }
    return mapCollectionRequest(data)
  },

  completeRequest: async (id: string): Promise<CollectionRequest> => {
    const { data, error } = await supabase
      .from('collection_requests')
      .update({ status: 'completed', completedAt: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not complete this request')
    }
    return mapCollectionRequest(data)
  },

  cancelRequest: async (id: string): Promise<CollectionRequest> => {
    const { data, error } = await supabase
      .from('collection_requests')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not cancel this request')
    }
    return mapCollectionRequest(data)
  },

  getStatistics: async (): Promise<CollectionRequestStatistics> => {
    const { data, error } = await supabase.from('collection_requests').select('*')
    if (error) {
      throwSupabaseError(error, 'Could not load collection request statistics')
    }
    const rows = data || []
    const byType: Partial<Record<CollectionRequest['type'], number>> = {}
    for (const row of rows) {
      byType[row.type] = (byType[row.type] || 0) + 1
    }
    return {
      total: rows.length,
      pending: rows.filter((row) => row.status === 'pending').length,
      scheduled: rows.filter((row) => row.status === 'scheduled').length,
      completed: rows.filter((row) => row.status === 'completed').length,
      cancelled: rows.filter((row) => row.status === 'cancelled').length,
      byType,
    }
  },
}

export const serviceSchedulesApi = {
  getPublished: async (params?: { ward?: string; serviceType?: string }): Promise<ServiceSchedule[]> => {
    let query = supabase.from('service_schedules').select('*').eq('status', 'published').order('createdAt', { ascending: false })
    if (params?.ward) query = query.eq('ward', params.ward)
    if (params?.serviceType) query = query.eq('serviceType', params.serviceType)
    const { data, error } = await query
    if (error) {
      throwSupabaseError(error, 'Could not load service schedules')
    }
    return (data || []).map(mapServiceSchedule)
  },

  getAll: async (params?: { status?: string; ward?: string; serviceType?: string }): Promise<ServiceSchedule[]> => {
    let query = supabase.from('service_schedules').select('*').order('createdAt', { ascending: false })
    if (params?.status) query = query.eq('status', params.status)
    if (params?.ward) query = query.eq('ward', params.ward)
    if (params?.serviceType) query = query.eq('serviceType', params.serviceType)
    const { data, error } = await query
    if (error) {
      throwSupabaseError(error, 'Could not load service schedules')
    }
    return (data || []).map(mapServiceSchedule)
  },

  getOne: async (id: string): Promise<ServiceSchedule> => {
    const { data, error } = await supabase.from('service_schedules').select('*').eq('id', id).maybeSingle()
    if (error) {
      throwSupabaseError(error, 'Could not load this service schedule')
    }
    if (!data) {
      throw new Error('Service schedule not found.')
    }
    return mapServiceSchedule(data)
  },

  getByWard: async (ward: string, published?: boolean): Promise<ServiceSchedule[]> => {
    let query = supabase.from('service_schedules').select('*').eq('ward', ward)
    if (published !== undefined) query = query.eq('status', published ? 'published' : 'draft')
    const { data, error } = await query
    if (error) {
      throwSupabaseError(error, 'Could not load service schedules')
    }
    return (data || []).map(mapServiceSchedule)
  },

  getByServiceType: async (serviceType: string, published?: boolean): Promise<ServiceSchedule[]> => {
    let query = supabase.from('service_schedules').select('*').eq('serviceType', serviceType)
    if (published !== undefined) query = query.eq('status', published ? 'published' : 'draft')
    const { data, error } = await query
    if (error) {
      throwSupabaseError(error, 'Could not load service schedules')
    }
    return (data || []).map(mapServiceSchedule)
  },

  getStatistics: async () => {
    const { data, error } = await supabase.from('service_schedules').select('*')
    if (error) {
      throwSupabaseError(error, 'Could not load service schedule statistics')
    }
    const rows = data || []
    return {
      total: rows.length,
      published: rows.filter((row) => row.status === 'published').length,
      draft: rows.filter((row) => row.status === 'draft').length,
      archived: rows.filter((row) => row.status === 'archived').length,
      suspended: rows.filter((row) => row.status === 'suspended').length,
    }
  },

  create: async (data: Partial<ServiceSchedule>): Promise<ServiceSchedule> => {
    const { data: inserted, error } = await supabase
      .from('service_schedules')
      .insert({
        scheduleCode: data.scheduleCode || `SCH-${Date.now()}`,
        serviceType: data.serviceType,
        ward: data.ward,
        street: data.street || null,
        zone: data.zone,
        frequency: data.frequency || 'weekly',
        serviceDays: data.serviceDays || [],
        serviceProviders: [],
        startTimeWindow: data.startTimeWindow,
        endTimeWindow: data.endTimeWindow,
        description: data.description || null,
        operatorName: data.operatorName || null,
        operatorPhoneNumber: data.operatorPhoneNumber || null,
        operatorEmail: data.operatorEmail || null,
        status: data.status || 'draft',
        notes: data.notes || null,
        effectiveFromDate: data.effectiveFromDate || null,
        effectiveToDate: data.effectiveToDate || null,
      })
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not create this service schedule')
    }
    return mapServiceSchedule(inserted)
  },

  update: async (id: string, data: Partial<ServiceSchedule>): Promise<ServiceSchedule> => {
    const { data: updated, error } = await supabase
      .from('service_schedules')
      .update({
        serviceType: data.serviceType,
        ward: data.ward,
        street: data.street,
        zone: data.zone,
        frequency: data.frequency,
        serviceDays: data.serviceDays,
        startTimeWindow: data.startTimeWindow,
        endTimeWindow: data.endTimeWindow,
        description: data.description,
        operatorName: data.operatorName,
        operatorPhoneNumber: data.operatorPhoneNumber,
        operatorEmail: data.operatorEmail,
        status: data.status,
        notes: data.notes,
        effectiveFromDate: data.effectiveFromDate,
        effectiveToDate: data.effectiveToDate,
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not update this service schedule')
    }
    return mapServiceSchedule(updated)
  },

  publish: async (id: string): Promise<ServiceSchedule> => {
    const { data, error } = await supabase
      .from('service_schedules')
      .update({ status: 'published', publishedDate: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not publish this service schedule')
    }
    return mapServiceSchedule(data)
  },

  archive: async (id: string) => {
    const { data, error } = await supabase
      .from('service_schedules')
      .update({ status: 'archived' })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not archive this service schedule')
    }
    return mapServiceSchedule(data)
  },

  suspend: async (id: string, reason?: string) => {
    const { data, error } = await supabase
      .from('service_schedules')
      .update({ status: 'suspended', notes: reason || null })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not suspend this service schedule')
    }
    return mapServiceSchedule(data)
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('service_schedules').delete().eq('id', id)
    if (error) {
      throwSupabaseError(error, 'Could not delete this service schedule')
    }
  },
}

const attachBillsUsers = async (bills: Bill[]): Promise<Bill[]> => {
  const userIds = Array.from(new Set(bills.map((bill) => bill.userId).filter(Boolean)))
  if (userIds.length === 0) return bills
  const usersMap = await fetchUsersByIds(userIds)
  return bills.map((bill) => ({ ...bill, user: usersMap[bill.userId] }))
}

export const billingApi = {
  getMyBills: async (): Promise<Bill[]> => {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('userId', userId)
      .order('dueDate', { ascending: false })
    if (error) {
      throwSupabaseError(error, 'Could not load your bills')
    }
    return (data || []).map(mapBill)
  },

  getAllBills: async (status?: string): Promise<Bill[]> => {
    let query = supabase.from('bills').select('*').order('dueDate', { ascending: false })
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) {
      throwSupabaseError(error, 'Could not load bills')
    }
    const bills = (data || []).map(mapBill)
    return attachBillsUsers(bills)
  },

  getBill: async (id: string): Promise<Bill> => {
    const { data, error } = await supabase.from('bills').select('*').eq('id', id).maybeSingle()
    if (error) {
      throwSupabaseError(error, 'Could not load this bill')
    }
    if (!data) {
      throw new Error('Bill not found.')
    }
    return mapBill(data)
  },

  getStatistics: async () => {
    const { data, error } = await supabase.from('bills').select('*')
    if (error) {
      throwSupabaseError(error, 'Could not load billing statistics')
    }
    const rows = data || []
    const statusCount = (value: string) => rows.filter((row) => row.status === value).length
    const sumByStatus = (values: string[]) =>
      rows.filter((row) => values.includes(row.status)).reduce((sum, row) => sum + asNumber(row.totalAmount), 0)

    return {
      totalBills: rows.length,
      pending: statusCount('pending'),
      overdue: statusCount('overdue'),
      paid: statusCount('paid'),
      cancelled: statusCount('cancelled'),
      totalRevenue: sumByStatus(['paid']),
      pendingRevenue: sumByStatus(['pending', 'overdue']),
      totalAmount: rows.reduce((sum, row) => sum + asNumber(row.totalAmount), 0),
    }
  },

  generateBills: async (period?: string) =>
    invokeEdge('billing', { action: 'generate', period }),

  applyLateFees: async (): Promise<Bill[]> =>
    invokeEdge<Bill[]>('billing', { action: 'applyLateFees' }),

  initiatePayment: async (billId: string): Promise<{
    authorizationUrl: string
    accessCode: string
    reference: string
  }> => invokeEdge<{ authorizationUrl: string; accessCode: string; reference: string }>('billing', { action: 'initiatePayment', billId }),

  verifyPayment: async (reference: string): Promise<BillPayment & { bill?: Bill }> =>
    invokeEdge<BillPayment & { bill?: Bill }>('billing', { action: 'verifyPayment', reference }),

  getAllPayments: async (status?: string): Promise<BillPayment[]> => {
    let query = supabase.from('bill_payments').select('*').order('createdAt', { ascending: false })
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) {
      throwSupabaseError(error, 'Could not load bill payments')
    }
    const payments = (data || []).map(mapBillPayment)
    const userIds = Array.from(new Set(payments.map((payment) => payment.userId).filter(Boolean)))
    const billIds = Array.from(new Set(payments.map((payment) => payment.billId).filter(Boolean)))
    const [usersMap, billRows] = await Promise.all([
      fetchUsersByIds(userIds),
      billIds.length > 0 ? supabase.from('bills').select('*').in('id', billIds) : Promise.resolve({ data: [] }),
    ])
    const billsMap: Record<string, Bill> = {}
    for (const row of (billRows.data || []) as any[]) billsMap[row.id] = mapBill(row)

    return payments.map((payment) => ({
      ...payment,
      user: usersMap[payment.userId],
      bill: billsMap[payment.billId],
    }))
  },

  approvePayment: async (paymentId: string) =>
    invokeEdge('billing', { action: 'approvePayment', paymentId }),

  rejectPayment: async (paymentId: string, reason?: string) =>
    invokeEdge('billing', { action: 'rejectPayment', paymentId, reason }),

  issueBill: async (userId: string, period?: string) =>
    invokeEdge('billing', { action: 'issue', userId, period }),

  getResidents: async (search?: string): Promise<BillingResidentOption[]> => {
    let query = supabase.from('users').select('*').eq('role', 'resident').order('firstName', { ascending: true })
    const trimmed = search?.trim()
    if (trimmed) {
      query = query.or(`firstName.ilike.%${trimmed}%,lastName.ilike.%${trimmed}%,email.ilike.%${trimmed}%`)
    }
    const { data, error } = await query
    if (error) {
      throwSupabaseError(error, 'Could not load resident options')
    }
    return (data || []).map((row) => ({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      ward: row.ward,
      street: row.street,
      houseNumber: row.houseNumber,
      propertyType: row.propertyType,
    }))
  },
}

export const payoutsApi = {
  getStatistics: async (): Promise<PayoutStatistics> => {
    const { data, error } = await supabase.from('payout_requests').select('*')
    if (error) {
      throwSupabaseError(error, 'Could not load payout statistics')
    }
    const rows = data || []
    const statusCount = (value: PayoutStatus) => rows.filter((row) => row.status === value).length
    return {
      total: rows.length,
      pending: statusCount('pending'),
      approved: statusCount('approved'),
      processing: statusCount('processing'),
      completed: statusCount('completed'),
      failed: statusCount('failed'),
      rejected: statusCount('rejected'),
      totalAmount: rows.reduce((sum, row) => sum + asNumber(row.amount), 0),
    }
  },

  getAll: async (status?: PayoutStatus): Promise<PayoutRequest[]> => {
    let query = supabase.from('payout_requests').select('*').order('createdAt', { ascending: false })
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) {
      throwSupabaseError(error, 'Could not load payout requests')
    }
    const payouts = (data || []).map(mapPayout)
    const usersMap = await fetchUsersByIds(payouts.map((payout) => payout.userId).filter(Boolean))
    return payouts.map((payout) => ({
      ...payout,
      user: (usersMap[payout.userId] || {}) as PayoutRequest['user'],
    }))
  },

  approve: async (id: string): Promise<PayoutRequest> =>
    invokeEdge<PayoutRequest>('payouts', { action: 'approve', id }),

  process: async (id: string): Promise<PayoutRequest> =>
    invokeEdge<PayoutRequest>('payouts', { action: 'process', id }),

  reject: async (id: string, reason: string): Promise<PayoutRequest> =>
    invokeEdge<PayoutRequest>('payouts', { action: 'reject', id, reason }),

  updateStatus: async (id: string): Promise<PayoutRequest> =>
    invokeEdge<PayoutRequest>('payouts', { action: 'updateStatus', id }),
}

export const driversApi = {
  getAll: async (includeInactive?: boolean): Promise<Driver[]> => {
    let query = supabase.from('drivers').select('*').order('created_at', { ascending: false })
    if (!includeInactive) query = query.eq('status', 'active')
    const { data, error } = await query
    if (error) {
      throwSupabaseError(error, 'Could not load drivers')
    }
    return enrichDrivers((data || []) as Record<string, any>[])
  },

  getById: async (id: string): Promise<Driver> => {
    const row = await fetchDriverRows(id)
    if (!row) {
      throw new Error('Driver not found.')
    }
    const drivers = await enrichDrivers([row])
    return drivers[0]
  },

  getByCode: async (driverCode: string): Promise<Driver> => {
    const { data, error } = await supabase.from('drivers').select('*').eq('driver_code', driverCode).maybeSingle()
    if (error) {
      throwSupabaseError(error, 'Could not load driver')
    }
    if (!data) {
      throw new Error('Driver not found.')
    }
    const drivers = await enrichDrivers([data as Record<string, any>])
    return drivers[0]
  },

  getCurrentVehicle: async (id: string): Promise<Vehicle | null> => {
    const { data: assignment } = await supabase
      .from('vehicle_assignments')
      .select('*')
      .eq('driver_id', id)
      .eq('status', 'active')
      .maybeSingle()
    if (!assignment) return null
    const { data: vehicleRow } = await supabase.from('vehicles').select('*').eq('id', assignment.vehicle_id).maybeSingle()
    if (!vehicleRow) return null
    const vehicles = await enrichVehicles([vehicleRow as Record<string, any>])
    return vehicles[0] || null
  },

  getPerformanceStats: async (id: string): Promise<{
    driver: Driver
    performance: {
      totalRoutes: number
      completedRoutes: number
      completionRate: string
      averageDuration: number
      averageRating: number
      averageSatisfaction: number
    }
  }> => {
    const driver = await driversApi.getById(id)
    const { data, error } = await supabase.from('route_executions').select('*').eq('driver_id', id)
    if (error) {
      throwSupabaseError(error, 'Could not load driver performance')
    }
    const rows = data || []
    const completed = rows.filter((row) => row.status === 'completed')
    const durations = completed
      .filter((row) => row.started_at && row.completed_at)
      .map((row) => {
        const start = new Date(row.started_at).getTime()
        const end = new Date(row.completed_at).getTime()
        return Math.max(0, (end - start) / (1000 * 60))
      })
    const avg = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0)

    return {
      driver,
      performance: {
        totalRoutes: rows.length,
        completedRoutes: completed.length,
        completionRate: rows.length > 0 ? ((completed.length / rows.length) * 100).toFixed(1) : '0.0',
        averageDuration: durations.length ? avg(durations) : 0,
        averageRating: rows.length ? avg(rows.map((row) => asNumber(row.driver_rating))) : 0,
        averageSatisfaction: rows.length ? avg(rows.map((row) => asNumber(row.resident_satisfaction))) : 0,
      },
    }
  },

  create: async (data: {
    userId: string
    licenseNumber: string
    licenseClass: string
    licenseExpiryDate: string
    emergencyContact?: string
    emergencyPhone?: string
    hireDate: string
    status?: string
    specializations?: string[]
    notes?: string
  }): Promise<Driver> => {
    const { data: inserted, error } = await supabase
      .from('drivers')
      .insert({
        driver_code: `DRV-${Date.now().toString().slice(-6)}`,
        user_id: data.userId,
        license_number: data.licenseNumber,
        license_class: data.licenseClass,
        license_expiry_date: data.licenseExpiryDate,
        emergency_contact: data.emergencyContact || null,
        emergency_phone: data.emergencyPhone || null,
        hire_date: data.hireDate,
        status: data.status || 'active',
        specializations: data.specializations?.join(',') || null,
        notes: data.notes || null,
      })
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not create the driver')
    }
    const drivers = await enrichDrivers([inserted as Record<string, any>])
    return drivers[0]
  },

  update: async (id: string, data: Partial<Driver>): Promise<Driver> => {
    const { data: updated, error } = await supabase
      .from('drivers')
      .update({
        license_number: data.licenseNumber,
        license_class: data.licenseClass,
        license_expiry_date: data.licenseExpiryDate,
        emergency_contact: data.emergencyContact,
        emergency_phone: data.emergencyPhone,
        status: data.status,
        specializations: data.specializations ? data.specializations.join(',') : undefined,
        notes: data.notes,
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not update the driver')
    }
    const drivers = await enrichDrivers([updated as Record<string, any>])
    return drivers[0]
  },

  assignVehicle: async (id: string, data: {
    vehicleId: string
    reason?: string
    notes?: string
  }): Promise<Driver> => {
    const { error } = await supabase.from('vehicle_assignments').insert({
      driver_id: id,
      vehicle_id: data.vehicleId,
      assigned_date: new Date().toISOString(),
      status: 'active',
      reason: data.reason || null,
      notes: data.notes || null,
    })
    if (error) {
      throwSupabaseError(error, 'Could not assign the vehicle')
    }
    return driversApi.getById(id)
  },

  unassignVehicle: async (id: string, reason?: string): Promise<Driver> => {
    const { error } = await supabase
      .from('vehicle_assignments')
      .update({ unassigned_date: new Date().toISOString(), status: 'inactive', reason: reason || null })
      .eq('driver_id', id)
      .eq('status', 'active')
    if (error) {
      throwSupabaseError(error, 'Could not unassign the vehicle')
    }
    return driversApi.getById(id)
  },

  delete: async (id: string): Promise<Driver> => {
    const driver = await driversApi.getById(id)
    const { error } = await supabase.from('drivers').delete().eq('id', id)
    if (error) {
      throwSupabaseError(error, 'Could not delete the driver')
    }
    return driver
  },
}

export const vehiclesApi = {
  getAll: async (includeRetired?: boolean): Promise<Vehicle[]> => {
    let query = supabase.from('vehicles').select('*').order('created_at', { ascending: false })
    if (!includeRetired) query = query.eq('status', 'operational')
    const { data, error } = await query
    if (error) {
      throwSupabaseError(error, 'Could not load vehicles')
    }
    return enrichVehicles((data || []) as Record<string, any>[])
  },

  getById: async (id: string): Promise<Vehicle> => {
    const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).maybeSingle()
    if (error) {
      throwSupabaseError(error, 'Could not load vehicle')
    }
    if (!data) {
      throw new Error('Vehicle not found.')
    }
    const vehicles = await enrichVehicles([data as Record<string, any>])
    return vehicles[0]
  },

  getByCode: async (vehicleCode: string): Promise<Vehicle> => {
    const { data, error } = await supabase.from('vehicles').select('*').eq('vehicle_code', vehicleCode).maybeSingle()
    if (error) {
      throwSupabaseError(error, 'Could not load vehicle')
    }
    if (!data) {
      throw new Error('Vehicle not found.')
    }
    const vehicles = await enrichVehicles([data as Record<string, any>])
    return vehicles[0]
  },

  getFleetSummary: async (): Promise<FleetSummary> => {
    const { data, error } = await supabase.from('vehicles').select('*')
    if (error) {
      throwSupabaseError(error, 'Could not load fleet summary')
    }
    const rows = data || []
    const operational = rows.filter((row) => row.status === 'operational').length
    const maintenance = rows.filter((row) => row.status === 'maintenance').length
    const outOfService = rows.filter((row) => row.status === 'out_of_service' || row.status === 'retired').length

    const { data: assignments } = await supabase.from('vehicle_assignments').select('*').eq('status', 'active')
    const assigned = new Set((assignments || []).map((row) => row.vehicle_id).filter(Boolean)).size

    return {
      totalVehicles: rows.length,
      operationalVehicles: operational,
      assignedVehicles: assigned,
      availableVehicles: Math.max(0, operational - assigned),
      maintenanceVehicles: maintenance,
      outOfServiceVehicles: outOfService,
      maintenanceOverdue: rows.filter((row) => row.next_service_due && new Date(row.next_service_due) < new Date()).length,
      registrationExpiring: rows.filter((row) => row.registration_expiry && new Date(row.registration_expiry) < new Date()).length,
      insuranceExpiring: rows.filter((row) => row.insurance_expiry && new Date(row.insurance_expiry) < new Date()).length,
    }
  },

  getCurrentDriver: async (id: string): Promise<Driver | null> => {
    const { data: assignment } = await supabase
      .from('vehicle_assignments')
      .select('*')
      .eq('vehicle_id', id)
      .eq('status', 'active')
      .maybeSingle()
    if (!assignment) return null
    const row = await fetchDriverRows(assignment.driver_id)
    if (!row) return null
    const drivers = await enrichDrivers([row])
    return drivers[0] || null
  },

  getPerformanceStats: async (id: string): Promise<{
    vehicle: Vehicle
    performance: {
      totalRoutes: number
      completedRoutes: number
      completionRate: string
      averageDistance: number
      averageFuel: number
      averageWaste: number
      totalDistance: number
      totalFuel: number
      fuelEfficiency: string
    }
    maintenance: {
      totalMaintenance: number
      completedMaintenance: number
      averageCost: number
      totalCost: number
    }
  }> => {
    const vehicle = await vehiclesApi.getById(id)
    const [executionResult, maintenanceResult] = await Promise.all([
      supabase.from('route_executions').select('*').eq('vehicle_id', id),
      supabase.from('maintenance_records').select('*').eq('vehicle_id', id),
    ])
    if (executionResult.error) {
      throwSupabaseError(executionResult.error, 'Could not load vehicle performance')
    }
    if (maintenanceResult.error) {
      throwSupabaseError(maintenanceResult.error, 'Could not load vehicle maintenance')
    }

    const executions = executionResult.data || []
    const maintenance = maintenanceResult.data || []
    const completed = executions.filter((row) => row.status === 'completed')
    const avg = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0)
    const totalDistance = executions.reduce((sum, row) => sum + asNumber(row.total_distance), 0)
    const totalFuel = executions.reduce((sum, row) => sum + asNumber(row.fuel_used), 0)

    return {
      vehicle,
      performance: {
        totalRoutes: executions.length,
        completedRoutes: completed.length,
        completionRate: executions.length > 0 ? ((completed.length / executions.length) * 100).toFixed(1) : '0.0',
        averageDistance: executions.length ? avg(executions.map((row) => asNumber(row.total_distance))) : 0,
        averageFuel: executions.length ? avg(executions.map((row) => asNumber(row.fuel_used))) : 0,
        averageWaste: executions.length ? avg(executions.map((row) => asNumber(row.waste_collected))) : 0,
        totalDistance,
        totalFuel,
        fuelEfficiency: totalFuel > 0 ? (totalDistance / totalFuel).toFixed(2) : '0.00',
      },
      maintenance: {
        totalMaintenance: maintenance.length,
        completedMaintenance: maintenance.filter((row) => row.status === 'completed').length,
        averageCost: maintenance.length
          ? avg(maintenance.map((row) => asNumber(row.actual_cost ?? row.estimated_cost)))
          : 0,
        totalCost: maintenance.reduce((sum, row) => sum + asNumber(row.actual_cost ?? row.estimated_cost), 0),
      },
    }
  },

  getMaintenanceHistory: async (id: string): Promise<MaintenanceRecord[]> => {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('vehicle_id', id)
      .order('scheduled_date', { ascending: false })
    if (error) {
      throwSupabaseError(error, 'Could not load maintenance history')
    }
    const vehicle = await vehiclesApi.getById(id)
    return (data || []).map((row) => mapMaintenanceRecord(row, vehicle))
  },

  create: async (data: {
    plateNumber: string
    make: string
    model: string
    year: number
    vehicleType: string
    fuelType?: string
    capacity: number
    capacityUnit: string
    status?: string
    purchaseDate: string
    purchasePrice?: number
    insuranceExpiry?: string
    registrationExpiry?: string
    currentMileage?: number
    currentLocation?: string
    notes?: string
  }): Promise<Vehicle> => {
    const { data: inserted, error } = await supabase
      .from('vehicles')
      .insert({
        vehicle_code: `VHL-${Date.now().toString().slice(-6)}`,
        plate_number: data.plateNumber,
        make: data.make,
        model: data.model,
        year: data.year,
        vehicle_type: data.vehicleType,
        fuel_type: data.fuelType || null,
        capacity: data.capacity,
        capacity_unit: data.capacityUnit,
        status: data.status || 'operational',
        purchase_date: data.purchaseDate,
        purchase_price: asOptionalNumber(data.purchasePrice),
        insurance_expiry: data.insuranceExpiry || null,
        registration_expiry: data.registrationExpiry || null,
        current_mileage: asOptionalNumber(data.currentMileage),
        current_location: data.currentLocation || null,
        notes: data.notes || null,
      })
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not create the vehicle')
    }
    const vehicles = await enrichVehicles([inserted as Record<string, any>])
    return vehicles[0]
  },

  update: async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    const { data: updated, error } = await supabase
      .from('vehicles')
      .update({
        plate_number: data.plateNumber,
        make: data.make,
        model: data.model,
        year: data.year,
        vehicle_type: data.vehicleType,
        fuel_type: data.fuelType,
        capacity: data.capacity,
        capacity_unit: data.capacityUnit,
        status: data.status,
        purchase_date: data.purchaseDate,
        purchase_price: data.purchasePrice,
        insurance_expiry: data.insuranceExpiry,
        registration_expiry: data.registrationExpiry,
        current_mileage: data.currentMileage,
        current_location: data.currentLocation,
        latitude: data.latitude,
        longitude: data.longitude,
        notes: data.notes,
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not update the vehicle')
    }
    const vehicles = await enrichVehicles([updated as Record<string, any>])
    return vehicles[0]
  },

  updateLocation: async (
    id: string,
    data: { location: string; latitude?: number; longitude?: number },
  ): Promise<Vehicle> => {
    const { data: updated, error } = await supabase
      .from('vehicles')
      .update({
        current_location: data.location,
        latitude: asOptionalNumber(data.latitude),
        longitude: asOptionalNumber(data.longitude),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not update the vehicle location')
    }
    const vehicles = await enrichVehicles([updated as Record<string, any>])
    return vehicles[0]
  },

  scheduleMaintenance: async (
    id: string,
    data: {
      maintenanceType: string
      status?: string
      priority?: string
      title: string
      description: string
      scheduledDate: string
      mileageAtMaintenance?: number
      serviceProvider?: string
      technician?: string
      estimatedCost?: number
      nextServiceDue?: string
      nextServiceMileage?: number
      notes?: string
    },
  ): Promise<MaintenanceRecord> => {
    const { data: inserted, error } = await supabase
      .from('maintenance_records')
      .insert({
        vehicle_id: id,
        maintenance_type: data.maintenanceType,
        status: data.status || 'scheduled',
        priority: data.priority || 'medium',
        title: data.title,
        description: data.description,
        scheduled_date: data.scheduledDate,
        mileage_at_maintenance: asOptionalNumber(data.mileageAtMaintenance),
        service_provider: data.serviceProvider || null,
        technician: data.technician || null,
        estimated_cost: asOptionalNumber(data.estimatedCost),
        next_service_due: data.nextServiceDue || null,
        next_service_mileage: asOptionalNumber(data.nextServiceMileage),
        notes: data.notes || null,
      })
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not schedule maintenance')
    }
    return mapMaintenanceRecord(inserted)
  },

  delete: async (id: string): Promise<Vehicle> => {
    const vehicle = await vehiclesApi.getById(id)
    const { error } = await supabase.from('vehicles').delete().eq('id', id)
    if (error) {
      throwSupabaseError(error, 'Could not delete the vehicle')
    }
    return vehicle
  },
}

export const routeExecutionsApi = {
  getAll: async (filters?: {
    driverId?: string
    vehicleId?: string
    routeId?: string
    status?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<RouteExecution[]> => {
    let query = supabase.from('route_executions').select('*').order('scheduled_date', { ascending: false })
    if (filters?.driverId) query = query.eq('driver_id', filters.driverId)
    if (filters?.vehicleId) query = query.eq('vehicle_id', filters.vehicleId)
    if (filters?.routeId) query = query.eq('route_id', filters.routeId)
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.dateFrom) query = query.gte('scheduled_date', filters.dateFrom)
    if (filters?.dateTo) query = query.lte('scheduled_date', filters.dateTo)
    const { data, error } = await query
    if (error) {
      throwSupabaseError(error, 'Could not load route executions')
    }
    return enrichExecutions((data || []) as Record<string, any>[])
  },

  getTodaysExecutions: async (): Promise<RouteExecution[]> => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const { data, error } = await supabase
      .from('route_executions')
      .select('*')
      .gte('scheduled_date', today.toISOString())
      .lt('scheduled_date', tomorrow.toISOString())
    if (error) {
      throwSupabaseError(error, 'Could not load today\'s route executions')
    }
    return enrichExecutions((data || []) as Record<string, any>[])
  },

  getPerformanceMetrics: async (filters?: {
    driverId?: string
    vehicleId?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<{
    totalExecutions: number
    completedExecutions: number
    completionRate: string
    averageDuration: number
    averageDistance: number
    averageFuel: number
    averageWaste: number
    averageRating: number
    onTimeRate: string
  }> => {
    let query = supabase.from('route_executions').select('*')
    if (filters?.driverId) query = query.eq('driver_id', filters.driverId)
    if (filters?.vehicleId) query = query.eq('vehicle_id', filters.vehicleId)
    if (filters?.dateFrom) query = query.gte('scheduled_date', filters.dateFrom)
    if (filters?.dateTo) query = query.lte('scheduled_date', filters.dateTo)
    const { data, error } = await query
    if (error) {
      throwSupabaseError(error, 'Could not load route performance metrics')
    }
    return routePerformance(data || [])
  },

  getById: async (id: string): Promise<RouteExecution> => {
    const { data, error } = await supabase.from('route_executions').select('*').eq('id', id).maybeSingle()
    if (error) {
      throwSupabaseError(error, 'Could not load this route execution')
    }
    if (!data) {
      throw new Error('Route execution not found.')
    }
    const executions = await enrichExecutions([data as Record<string, any>])
    return executions[0]
  },

  create: async (data: {
    routeId: string
    driverId?: string
    vehicleId?: string
    scheduledDate: string
    plannedStops?: number
    notes?: string
  }): Promise<RouteExecution> => {
    const { data: inserted, error } = await supabase
      .from('route_executions')
      .insert({
        route_id: data.routeId,
        driver_id: data.driverId || null,
        vehicle_id: data.vehicleId || null,
        scheduled_date: data.scheduledDate,
        planned_stops: data.plannedStops || 0,
        notes: data.notes || null,
      })
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not create the route execution')
    }
    const executions = await enrichExecutions([inserted as Record<string, any>])
    return executions[0]
  },

  startRoute: async (id: string, data: {
    startMileage?: number
    startLocation?: string
    startLatitude?: number
    startLongitude?: number
    notes?: string
  }): Promise<RouteExecution> => {
    const { data: updated, error } = await supabase
      .from('route_executions')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
        start_mileage: asOptionalNumber(data.startMileage),
        start_location: data.startLocation || null,
        start_latitude: asOptionalNumber(data.startLatitude),
        start_longitude: asOptionalNumber(data.startLongitude),
        notes: data.notes || undefined,
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not start the route')
    }
    const executions = await enrichExecutions([updated as Record<string, any>])
    return executions[0]
  },

  completeRoute: async (id: string, data: {
    completedStops: number
    totalDistance?: number
    fuelUsed?: number
    wasteCollected?: number
    wasteUnit?: string
    endMileage?: number
    endLocation?: string
    endLatitude?: number
    endLongitude?: number
    routeGpsTrace?: string
    driverRating?: number
    residentSatisfaction?: number
    notes?: string
  }): Promise<RouteExecution> => {
    const { data: updated, error } = await supabase
      .from('route_executions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_stops: data.completedStops,
        total_distance: asOptionalNumber(data.totalDistance),
        fuel_used: asOptionalNumber(data.fuelUsed),
        waste_collected: asOptionalNumber(data.wasteCollected),
        waste_unit: data.wasteUnit || null,
        end_mileage: asOptionalNumber(data.endMileage),
        end_location: data.endLocation || null,
        end_latitude: asOptionalNumber(data.endLatitude),
        end_longitude: asOptionalNumber(data.endLongitude),
        route_gps_trace: data.routeGpsTrace || null,
        driver_rating: asOptionalNumber(data.driverRating),
        resident_satisfaction: asOptionalNumber(data.residentSatisfaction),
        notes: data.notes || undefined,
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not complete the route')
    }
    const executions = await enrichExecutions([updated as Record<string, any>])
    return executions[0]
  },

  reportIssue: async (id: string, data: { issue: string; delayMinutes?: number }): Promise<RouteExecution> => {
    const { data: updated, error } = await supabase
      .from('route_executions')
      .update({
        status: 'disrupted',
        delay_reason: data.issue,
        delay_minutes: data.delayMinutes || 0,
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not report the route issue')
    }
    const executions = await enrichExecutions([updated as Record<string, any>])
    return executions[0]
  },

  update: async (id: string, data: Partial<RouteExecution>): Promise<RouteExecution> => {
    const { data: updated, error } = await supabase
      .from('route_executions')
      .update({
        status: data.status,
        planned_stops: data.plannedStops,
        completed_stops: data.completedStops,
        total_distance: data.totalDistance,
        fuel_used: data.fuelUsed,
        waste_collected: data.wasteCollected,
        waste_unit: data.wasteUnit,
        delay_reason: data.delayReason,
        delay_minutes: data.delayMinutes,
        issues: data.issues,
        notes: data.notes,
        driver_rating: data.driverRating,
        resident_satisfaction: data.residentSatisfaction,
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      throwSupabaseError(error, 'Could not update the route execution')
    }
    const executions = await enrichExecutions([updated as Record<string, any>])
    return executions[0]
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('route_executions').delete().eq('id', id)
    if (error) {
      throwSupabaseError(error, 'Could not delete the route execution')
    }
  },
}