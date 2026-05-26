export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  address: string
  ward?: string
  houseNumber?: string
  street: string
  role: 'resident' | 'psp_operator' | 'recycler' | 'admin' | 'ward_officer' | 'supervisor' | 'dispatcher' | 'finance_officer'
  serviceZone?: string
  propertyType?: string
  landmark?: string
  householdSize?: number
  latitude?: number
  longitude?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Bill {
  id: string
  billNumber: string
  userId: string
  user?: User
  billingPeriod: string
  propertyType: 'residential' | 'commercial'
  amount: number
  lateFee: number
  totalAmount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  dueDate: string
  paidAt?: string
  paymentReference?: string
  paymentMethod?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface BillingResidentOption {
  id: string
  firstName: string
  lastName: string
  email: string
  ward?: string
  street: string
  houseNumber?: string
  propertyType?: string
}

export interface BillPayment {
  id: string
  billId: string
  bill?: Bill
  userId: string
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'phoneNumber'>
  amount: number
  paymentReference: string
  paymentMethod: string
  status: 'pending' | 'success' | 'failed' | 'cancelled'
  paystackReference?: string
  paystackAccessCode?: string
  metadata?: any
  createdAt: string
  updatedAt: string
}

export type PayoutStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'rejected'

export interface PayoutRequest {
  id: string
  userId: string
  user: User & {
    accountNumber?: string
    bankName?: string
  }
  amount: number
  status: PayoutStatus
  type: 'wallet_withdrawal' | 'recyclable_payout' | 'referral_bonus'
  transferReference?: string
  transferCode?: string
  paystackReference?: string
  failureReason?: string
  notes?: string
  processedBy?: string
  processedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface PayoutStatistics {
  total: number
  pending: number
  approved: number
  processing: number
  completed: number
  failed: number
  rejected: number
  totalAmount: number
}

export interface WasteCollection {
  id: string
  residentId: string
  resident?: User
  pspOperatorId?: string
  routeId?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'verified'
  scheduledDate: string
  actualCollectionTime?: string
  address: string
  ward?: string
  street: string
  latitude?: number
  longitude?: number
  notes?: string
  photoUrl?: string
  scheduledTruckCode?: string
  reportedTruckCode?: string
  residentConfirmed: boolean
  residentConfirmedAt?: string
  isVerified: boolean
  verificationTime?: string
  createdAt: string
}

export type RecyclableType = 'plastic_bottles' | 'glass_bottles' | 'aluminum_cans' | 'cardboard' | 'paper' | 'metal_scraps' | 'electronics' | 'other'

export interface Recyclable {
  id: string
  userId: string
  user?: User
  recyclerId?: string
  type: RecyclableType
  quantity: number
  unit: string
  estimatedValue: number
  actualValue?: number
  status: 'logged' | 'pickup_requested' | 'collected' | 'processed' | 'paid'
  description?: string
  photoUrl?: string
  latitude?: number
  longitude?: number
  pickupDate?: string
  collectionDate?: string
  createdAt: string
}

export interface WalletTransaction {
  id: string
  userId: string
  user?: User
  type: 'credit' | 'debit'
  amount: number
  balanceAfter: number
  source: 'recyclables' | 'reward_points' | 'withdrawal' | 'bonus' | 'penalty'
  description?: string
  referenceId?: string
  externalTransactionId?: string
  status?: 'pending' | 'approved' | 'completed' | 'rejected' | 'failed'
  createdAt: string
}

export interface WalletWithdrawalLimits {
  minAmount: number
  maxAmount: number
  dailyLimit: number
  dailyWithdrawn: number
  remainingDaily: number
}

export interface Bank {
  name: string
  code: string
  slug?: string
}

export interface AccountResolution {
  account_number: string
  account_name: string
  bank_id: number
}

export interface WithdrawalRequest {
  amount: number
  bankCode: string
  accountNumber: string
  accountName?: string
}

export interface WithdrawalStatus {
  transaction: WalletTransaction
  paystack: {
    id?: number
    transferCode?: string
    reference?: string
    status: string
  }
}

export interface WalletSummary {
  totalCredits: number
  totalDebits: number
  netBalance: number
  transactionCount: number
  lastTransaction: string | null
}

export interface Report {
  id: string
  ticketNumber: string
  reporterId: string
  reporter?: User
  assignedToId?: string
  type: 'missed_pickup' | 'illegal_dumping' | 'damaged_bins' | 'truck_issue' | 'other'
  title: string
  description: string
  address: string
  ward?: string
  street: string
  latitude?: number
  longitude?: number
  status: 'submitted' | 'under_review' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  photoUrls?: string[]
  resolutionNotes?: string
  resolvedAt?: string
  dueAt?: string
  firstResponseAt?: string
  escalatedAt?: string
  resolutionEvidenceUrls?: string[]
  createdAt: string
  updatedAt: string
}

export interface CollectionRoute {
  id: string
  routeCode: string
  name: string
  ward: string
  street: string
  zone?: string
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  serviceDay: string
  startTimeWindow: string
  endTimeWindow: string
  nextCollectionDate: string
  lastCompletedAt?: string
  status: 'active' | 'disrupted' | 'inactive'
  pspOperatorId?: string
  truckCode?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type CollectionRequestType = 'routine' | 'urgent' | 'bulky' | 'special'
export type CollectionRequestStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled'

export interface CollectionRequest {
  id: string
  residentId: string
  resident: User
  type: CollectionRequestType
  status: CollectionRequestStatus
  preferredDate?: string
  description?: string
  scheduledDate?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CollectionRequestStatistics {
  total: number
  pending: number
  scheduled: number
  completed: number
  cancelled: number
  byType?: Partial<Record<CollectionRequestType, number>>
}

export interface ServiceSchedule {
  id: string
  scheduleCode: string
  serviceType: string
  ward: string
  street?: string
  zone: string
  frequency: string
  serviceDays: string[]
  startTimeWindow: string
  endTimeWindow: string
  status: 'draft' | 'published' | 'archived' | 'suspended'
  description?: string
  operatorName?: string
  operatorPhoneNumber?: string
  operatorEmail?: string
  notes?: string
  effectiveFromDate?: string
  effectiveToDate?: string
  publishedDate?: string
  createdAt: string
  updatedAt: string
}

export interface LogisticsSummary {
  fleet: {
    totalTrucks: number
    deployedToday: number
    idleToday: number
    unassignedRoutes: number
  }
  readiness: {
    activeRoutes: number
    dueToday: number
    readyToday: number
    missingTruckToday: number
    disruptedRoutes: number
    readinessPercent: number
  }
  queues: {
    pendingCollections: number
    openServiceRequests: number
    openComplaints: number
    urgentServiceRequests: number
    urgentComplaints: number
  }
  truckDeployments: Array<{
    truckCode: string
    routeCount: number
    dueToday: number
    activeRoutes: number
    disruptedRoutes: number
    nextRoute: {
      id: string
      routeCode: string
      name: string
      ward: string
      street: string
      nextCollectionDate: string
      status: CollectionRoute['status']
    } | null
  }>
  attention: {
    unassignedRoutes: Array<{
      id: string
      routeCode: string
      name: string
      ward: string
      street: string
      nextCollectionDate: string
    }>
    disruptedRoutes: Array<{
      id: string
      routeCode: string
      name: string
      ward: string
      street: string
      truckCode?: string
      nextCollectionDate: string
    }>
  }
}

export interface LocationPoi {
  id: string
  osmType: 'node' | 'way' | 'relation' | 'curated'
  name: string
  category: 'bin' | 'collection_point'
  latitude: number
  longitude: number
  distanceMeters: number
  address?: string
  area?: string
  capacity?: 'small' | 'medium' | 'large'
  acceptedWaste?: string[]
  liveStatus?: 'available' | 'near_capacity' | 'closed' | 'scheduled_pickup'
  tags?: Record<string, string>
}

export interface NearbyLocationsResponse {
  center: {
    latitude: number
    longitude: number
  }
  radiusMeters: number
  results: LocationPoi[]
}

export interface ServiceRequest {
  id: string
  requestNumber: string
  residentId: string
  resident?: User
  assignedToId?: string
  assignedTo?: User
  type:
    | 'bin_replacement'
    | 'new_bin'
    | 'bulky_pickup'
    | 'missed_pickup_follow_up'
    | 'service_transfer'
    | 'property_onboarding'
  status: 'submitted' | 'triaged' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'escalated'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  address: string
  ward: string
  street: string
  latitude?: number
  longitude?: number
  preferredDate?: string
  scheduledFor?: string
  slaDueAt?: string
  completedAt?: string
  resolutionNotes?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token?: string
  access_token?: string
}

export interface AdminInvite {
  id: string
  email: string
  role: User['role']
  createdByUserId: string
  usedByUserId?: string | null
  expiresAt: string
  usedAt?: string | null
  revokedAt?: string | null
  note?: string | null
  createdAt: string
  updatedAt: string
  status: 'active' | 'used' | 'revoked' | 'expired'
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  address: string
  ward?: string
  houseNumber: string
  street: string
  latitude?: number
  longitude?: number
  serviceZone?: string
  propertyType?: string
  landmark?: string
  householdSize?: number
  role?: User['role']
  adminInviteToken?: string
}
