import axios from 'axios'
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
import { clearAuthSession, getStoredAuthToken, getWorkspaceLoginPath, loadPreferredWorkspace } from './authSession'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getStoredAuthToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url ?? ''
    const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register')
    const isLoginPage = typeof window !== 'undefined' && (
      window.location.pathname.includes('/login') || 
      window.location.pathname === '/'
    )

    // Only redirect if we get 401 on a protected route and we're not already on login
    if (error.response?.status === 401 && !isAuthRequest && !isLoginPage) {
      clearAuthSession()
      if (typeof window !== 'undefined') {
        const workspace = loadPreferredWorkspace()
        window.location.href = getWorkspaceLoginPath(workspace)
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  register: async (data: Omit<RegisterData, 'email' | 'password'>): Promise<User> => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile')
    return response.data
  },

  requestPasswordReset: async (email: string, workspace: 'resident' | 'admin' = 'resident'): Promise<{ message: string }> => {
    const response = await api.post('/auth/forgot-password', { email, workspace })
    return response.data
  },

  validateAdminInvite: async (data: { email: string; token: string }): Promise<AdminInvite> => {
    const response = await api.post('/admin-invites/validate', data)
    return response.data
  },
}

export const adminInvitesApi = {
  create: async (
    data: { email: string; expiresInHours?: number; note?: string },
  ): Promise<{ invite: AdminInvite; token: string; inviteLink: string; emailSent: boolean }> => {
    const response = await api.post('/admin-invites', data)
    return response.data
  },

  list: async (): Promise<AdminInvite[]> => {
    const response = await api.get('/admin-invites')
    return response.data
  },

  revoke: async (id: string): Promise<AdminInvite> => {
    const response = await api.patch(`/admin-invites/${id}/revoke`)
    return response.data
  },
}

export const wasteCollectionsApi = {
  getCollections: async (): Promise<WasteCollection[]> => {
    const response = await api.get('/waste-collections')
    return response.data
  },

  getMyCollections: async (): Promise<WasteCollection[]> => {
    const response = await api.get('/waste-collections/my-collections')
    return response.data
  },

  getStats: async (): Promise<{ lastPickup: string | null; thisMonth: number }> => {
    const response = await api.get('/waste-collections/stats')
    return response.data
  },

  scheduleCollection: async (data: { scheduledDate: string; notes?: string }) => {
    const response = await api.post('/waste-collections/schedule', data)
    return response.data
  },

  confirmCollection: async (id: string, observedTruckCode: string) => {
    const response = await api.patch(`/waste-collections/${id}/confirm`, { observedTruckCode })
    return response.data
  },

  verifyCollection: async (id: string) => {
    const response = await api.patch(`/waste-collections/${id}/verify`)
    return response.data
  },
}

export const recyclablesApi = {
  getRecyclables: async (): Promise<Recyclable[]> => {
    const response = await api.get('/recyclables')
    return response.data
  },

  getMyRecyclables: async (): Promise<Recyclable[]> => {
    const response = await api.get('/recyclables/my-recyclables')
    return response.data
  },

  getValuationSummary: async (): Promise<{
    totalEstimated: number;
    totalActual: number;
    pendingItems: number;
    paidItems: number;
  }> => {
    const response = await api.get('/recyclables/valuation-summary')
    return response.data
  },

  submitRecyclable: async (data: Partial<Recyclable>): Promise<Recyclable> => {
    const response = await api.post('/recyclables/submit', data)
    return response.data
  },

  createRecyclable: async (data: Partial<Recyclable>): Promise<Recyclable> => {
    const response = await api.post('/recyclables', data)
    return response.data
  },

  updateRecyclable: async (id: string, data: Partial<Recyclable>): Promise<Recyclable> => {
    const response = await api.patch(`/recyclables/${id}`, data)
    return response.data
  },

  requestPickup: async (id: string): Promise<Recyclable> => {
    const response = await api.patch(`/recyclables/${id}/request-pickup`)
    return response.data
  },
}

export const walletApi = {
  getBanks: async (): Promise<Bank[]> => {
    const response = await api.get('/wallet/banks')
    return response.data
  },

  resolveAccount: async (data: { accountNumber: string; bankCode: string }): Promise<AccountResolution> => {
    const response = await api.post('/wallet/resolve-account', data)
    return response.data
  },

  getTransactions: async (): Promise<WalletTransaction[]> => {
    const response = await api.get('/wallet/transactions')
    return response.data
  },

  getWithdrawals: async (): Promise<WalletTransaction[]> => {
    const response = await api.get('/wallet/withdrawals')
    return response.data
  },

  getWithdrawalStatus: async (id: string): Promise<WithdrawalStatus> => {
    const response = await api.get(`/wallet/withdrawals/${id}/status`)
    return response.data
  },

  getBalance: async (): Promise<{ balance: number }> => {
    const response = await api.get('/wallet/balance')
    return response.data
  },

  getWithdrawalLimits: async (): Promise<{
    minAmount: number
    maxAmount: number
    dailyLimit: number
    dailyWithdrawn: number
    remainingDaily: number
  }> => {
    const response = await api.get('/wallet/withdrawal-limits')
    return response.data
  },

  getSummary: async (): Promise<{
    totalCredits: number
    totalDebits: number
    netBalance: number
    transactionCount: number
    lastTransaction: string | null
  }> => {
    const response = await api.get('/wallet/summary')
    return response.data
  },

  withdraw: async (data: WithdrawalRequest): Promise<WalletTransaction> => {
    const response = await api.post('/wallet/withdraw', data)
    return response.data
  },
}

export const uploadApi = {
  uploadImage: async (file: File): Promise<{ success: boolean; imageUrl: string; message: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}

export const reportsApi = {
  getReports: async (): Promise<Report[]> => {
    const response = await api.get('/reports')
    return response.data
  },

  createReport: async (data: Partial<Report>): Promise<Report> => {
    const response = await api.post('/reports', data)
    return response.data
  },

  updateReport: async (id: string, data: Partial<Report>): Promise<Report> => {
    const response = await api.patch(`/reports/${id}`, data)
    return response.data
  },
}

export const collectionRoutesApi = {
  getRoutes: async (): Promise<CollectionRoute[]> => {
    const response = await api.get('/collection-routes')
    return response.data
  },

  getMyRoutes: async (): Promise<CollectionRoute[]> => {
    const response = await api.get('/collection-routes/mine')
    return response.data
  },

  getSummary: async (): Promise<{ totalRoutes: number; activeRoutes: number; disruptedRoutes: number; dueToday: number }> => {
    const response = await api.get('/collection-routes/summary')
    return response.data
  },

  createRoute: async (data: Partial<CollectionRoute>): Promise<CollectionRoute> => {
    const response = await api.post('/collection-routes', data)
    return response.data
  },

  updateRoute: async (id: string, data: Partial<CollectionRoute>): Promise<CollectionRoute> => {
    const response = await api.patch(`/collection-routes/${id}`, data)
    return response.data
  },

  completeRoute: async (id: string, payload?: { completedAt?: string; notes?: string }) => {
    const response = await api.patch(`/collection-routes/${id}/complete`, payload || {})
    return response.data
  },

  confirmResidentCollection: async (id: string, payload: { observedTruckCode: string }) => {
    const response = await api.patch(`/collection-routes/${id}/resident-confirm`, payload)
    return response.data
  },
}

export const logisticsApi = {
  getSummary: async (): Promise<LogisticsSummary> => {
    const response = await api.get('/logistics/summary')
    return response.data
  },
}

export const locationsApi = {
  getNearby: async (params: { latitude: number; longitude: number; radius?: number }): Promise<NearbyLocationsResponse> => {
    const response = await api.get('/locations/nearby', {
      params: {
        lat: params.latitude,
        lon: params.longitude,
        radius: params.radius ?? 5000,
      },
    })
    return response.data
  },
}

export const serviceRequestsApi = {
  getRequests: async (): Promise<ServiceRequest[]> => {
    const response = await api.get('/service-requests')
    return response.data
  },

  getMyRequests: async (): Promise<ServiceRequest[]> => {
    const response = await api.get('/service-requests/mine')
    return response.data
  },

  getSummary: async (): Promise<{ totalRequests: number; openRequests: number; overdueRequests: number; urgentRequests: number }> => {
    const response = await api.get('/service-requests/summary')
    return response.data
  },

  createRequest: async (data: Partial<ServiceRequest>): Promise<ServiceRequest> => {
    const response = await api.post('/service-requests', data)
    return response.data
  },

  updateRequest: async (id: string, data: Partial<ServiceRequest>): Promise<ServiceRequest> => {
    const response = await api.patch(`/service-requests/${id}`, data)
    return response.data
  },
}

export const usersApi = {
  updateProfile: async (data: { street?: string; ward?: string; houseNumber?: string; landmark?: string; propertyType?: string }) => {
    const response = await api.patch('/users/profile', data)
    return response.data
  },
}

export const collectionRequestsApi = {
  createRequest: async (data: {
    type: CollectionRequest['type']
    preferredDate?: string
    description?: string
  }): Promise<CollectionRequest> => {
    const response = await api.post<CollectionRequest>('/collection-requests', data)
    return response.data
  },

  getMyRequests: async (): Promise<CollectionRequest[]> => {
    const response = await api.get<CollectionRequest[]>('/collection-requests/my-requests')
    return response.data
  },

  getAllRequests: async (status?: CollectionRequestStatus): Promise<CollectionRequest[]> => {
    const response = await api.get<CollectionRequest[]>('/collection-requests', {
      params: status ? { status } : undefined,
    })
    return response.data
  },

  getOne: async (id: string): Promise<CollectionRequest> => {
    const response = await api.get<CollectionRequest>(`/collection-requests/${id}`)
    return response.data
  },

  scheduleRequest: async (id: string, routeId: string, scheduledDate: string): Promise<CollectionRequest> => {
    const response = await api.patch<CollectionRequest>(`/collection-requests/${id}/schedule`, {
      routeId,
      scheduledDate,
    })
    return response.data
  },

  completeRequest: async (id: string): Promise<CollectionRequest> => {
    const response = await api.patch<CollectionRequest>(`/collection-requests/${id}/complete`)
    return response.data
  },

  cancelRequest: async (id: string): Promise<CollectionRequest> => {
    const response = await api.patch<CollectionRequest>(`/collection-requests/${id}/cancel`)
    return response.data
  },

  getStatistics: async (): Promise<CollectionRequestStatistics> => {
    const response = await api.get<CollectionRequestStatistics>('/collection-requests/stats')
    return response.data
  },
}

export const serviceSchedulesApi = {
  getPublished: async (params?: { ward?: string; serviceType?: string }): Promise<ServiceSchedule[]> => {
    const response = await api.get<ServiceSchedule[]>('/service-schedules/published', { params })
    return response.data
  },

  getAll: async (params?: { status?: string; ward?: string; serviceType?: string }): Promise<ServiceSchedule[]> => {
    const response = await api.get<ServiceSchedule[]>('/service-schedules', { params })
    return response.data
  },

  getOne: async (id: string): Promise<ServiceSchedule> => {
    const response = await api.get<ServiceSchedule>(`/service-schedules/${id}`)
    return response.data
  },

  getByWard: async (ward: string, published?: boolean): Promise<ServiceSchedule[]> => {
    const response = await api.get<ServiceSchedule[]>(`/service-schedules/ward/${ward}`, {
      params: published !== undefined ? { published } : undefined,
    })
    return response.data
  },

  getByServiceType: async (serviceType: string, published?: boolean): Promise<ServiceSchedule[]> => {
    const response = await api.get<ServiceSchedule[]>(`/service-schedules/type/${serviceType}`, {
      params: published !== undefined ? { published } : undefined,
    })
    return response.data
  },

  getStatistics: async () => {
    const response = await api.get('/service-schedules/stats')
    return response.data
  },

  create: async (data: Partial<ServiceSchedule>): Promise<ServiceSchedule> => {
    const response = await api.post<ServiceSchedule>('/service-schedules', data)
    return response.data
  },

  update: async (id: string, data: Partial<ServiceSchedule>): Promise<ServiceSchedule> => {
    const response = await api.patch<ServiceSchedule>(`/service-schedules/${id}`, data)
    return response.data
  },

  publish: async (id: string): Promise<ServiceSchedule> => {
    const response = await api.patch<ServiceSchedule>(`/service-schedules/${id}/publish`)
    return response.data
  },

  archive: async (id: string) => {
    const response = await api.patch(`/service-schedules/${id}/archive`)
    return response.data
  },

  suspend: async (id: string, reason?: string) => {
    const response = await api.patch(`/service-schedules/${id}/suspend`, { reason })
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/service-schedules/${id}`)
    return response.data
  },
}

export const billingApi = {
  getMyBills: async (): Promise<Bill[]> => {
    const response = await api.get<Bill[]>('/billing/my-bills')
    return response.data
  },

  getAllBills: async (status?: string): Promise<Bill[]> => {
    const response = await api.get<Bill[]>('/billing', { params: status ? { status } : undefined })
    return response.data
  },

  getBill: async (id: string): Promise<Bill> => {
    const response = await api.get<Bill>(`/billing/${id}`)
    return response.data
  },

  getStatistics: async () => {
    const response = await api.get('/billing/stats')
    return response.data
  },

  generateBills: async (period?: string) => {
    const response = await api.post('/billing/generate', {}, { params: period ? { period } : undefined })
    return response.data
  },

  applyLateFees: async () => {
    const response = await api.post('/billing/apply-late-fees')
    return response.data
  },

  initiatePayment: async (billId: string): Promise<{
    authorizationUrl: string
    accessCode: string
    reference: string
  }> => {
    const response = await api.post(`/billing/${billId}/pay`)
    return response.data
  },

  verifyPayment: async (reference: string): Promise<BillPayment & { bill?: Bill }> => {
    const response = await api.get<BillPayment & { bill?: Bill }>(`/billing/verify/${reference}`)
    return response.data
  },

  getAllPayments: async (status?: string): Promise<BillPayment[]> => {
    const response = await api.get<BillPayment[]>('/billing/payments', { params: status ? { status } : undefined })
    return response.data
  },

  approvePayment: async (paymentId: string) => {
    const response = await api.post(`/billing/payments/${paymentId}/approve`)
    return response.data
  },

  rejectPayment: async (paymentId: string, reason?: string) => {
    const response = await api.post(`/billing/payments/${paymentId}/reject`, { reason })
    return response.data
  },

  issueBill: async (userId: string, period?: string) => {
    const response = await api.post('/billing/issue', { userId, period })
    return response.data
  },

  getResidents: async (search?: string): Promise<BillingResidentOption[]> => {
    const response = await api.get<BillingResidentOption[]>('/billing/residents', {
      params: search?.trim() ? { search: search.trim() } : undefined,
    })
    return response.data
  },
}

export const payoutsApi = {
  getStatistics: async (): Promise<PayoutStatistics> => {
    const response = await api.get<PayoutStatistics>('/payouts/admin/statistics')
    return response.data
  },

  getAll: async (status?: PayoutStatus): Promise<PayoutRequest[]> => {
    const response = await api.get<PayoutRequest[]>('/payouts/admin/all', {
      params: status ? { status } : undefined,
    })
    return response.data
  },

  approve: async (id: string): Promise<PayoutRequest> => {
    const response = await api.put<PayoutRequest>(`/payouts/admin/${id}/approve`)
    return response.data
  },

  process: async (id: string): Promise<PayoutRequest> => {
    const response = await api.put<PayoutRequest>(`/payouts/admin/${id}/process`)
    return response.data
  },

  reject: async (id: string, reason: string): Promise<PayoutRequest> => {
    const response = await api.put<PayoutRequest>(`/payouts/admin/${id}/reject`, { reason })
    return response.data
  },

  updateStatus: async (id: string): Promise<PayoutRequest> => {
    const response = await api.put<PayoutRequest>(`/payouts/admin/${id}/update-status`)
    return response.data
  },
}

export default api
