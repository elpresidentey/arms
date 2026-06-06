import React, { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { billingApi, collectionRoutesApi, recyclablesApi, serviceRequestsApi, walletApi, wasteCollectionsApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { useOnboarding } from '../hooks/useOnboarding'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardMetrics from '../components/dashboard/DashboardMetrics'
import DashboardContent from '../components/dashboard/DashboardContent'
import DashboardBillingWidget from '../components/billing/DashboardBillingWidget'
import StatePanel from '../components/StatePanel'
import OnboardingChecklist from '../components/OnboardingChecklist'
import AdminBillIssuePanel from '../components/billing/AdminBillIssuePanel'
import { summarizeBills } from '../utils/bills'
import { BILLING_ADMIN_ROLES, hasRole } from '../routes/roles'

// Helper function to build pulse data
const buildResidentPulseData = (collections: any[], recyclables: any[]) => {
  const today = new Date()
  const sixDaysAgo = new Date(today)
  sixDaysAgo.setDate(today.getDate() - 6)

  const data = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(sixDaysAgo)
    date.setDate(sixDaysAgo.getDate() + i)
    
    const dayCollections = collections.filter(c => {
      const collectionDate = new Date(c.scheduledDate)
      return collectionDate.toDateString() === date.toDateString()
    }).length

    const dayRecyclables = recyclables.filter(r => {
      const recyclableDate = new Date(r.createdAt)
      return recyclableDate.toDateString() === date.toDateString()
    }).length

    data.push({
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      activity: dayCollections + dayRecyclables,
    })
  }

  return data
}

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const { notifications } = useSocket()
  const queryClient = useQueryClient()
  const isResident = user?.role === 'resident'
  const canIssueBills = hasRole(user?.role, BILLING_ADMIN_ROLES)
  const {
    shouldShowChecklist,
    state,
    completeStep,
    dismissChecklist,
  } = useOnboarding()

  const {
    data: wasteStats,
    isLoading: isWasteStatsLoading,
    isError: isWasteStatsError,
  } = useQuery({
    queryKey: ['waste-stats'],
    queryFn: wasteCollectionsApi.getStats,
  })

  const {
    data: balance,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
  } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: walletApi.getBalance,
    enabled: isResident,
  })

  const { data: walletSummary } = useQuery({
    queryKey: ['wallet-summary'],
    queryFn: walletApi.getSummary,
    enabled: isResident,
  })

  const {
    data: recyclables,
    isLoading: isRecyclablesLoading,
    isError: isRecyclablesError,
  } = useQuery({
    queryKey: ['my-recyclables'],
    queryFn: isResident ? recyclablesApi.getMyRecyclables : recyclablesApi.getRecyclables,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const { data: valuationSummary } = useQuery({
    queryKey: ['valuation-summary'],
    queryFn: recyclablesApi.getValuationSummary,
    enabled: isResident,
  })

  const {
    data: collections,
    isLoading: isCollectionsLoading,
    isError: isCollectionsError,
  } = useQuery({
    queryKey: [isResident ? 'my-waste-collections' : 'waste-collections'],
    queryFn: isResident ? wasteCollectionsApi.getMyCollections : wasteCollectionsApi.getCollections,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const { data: routeSummary } = useQuery({
    queryKey: ['collection-routes-summary'],
    queryFn: collectionRoutesApi.getSummary,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const { data: requestSummary } = useQuery({
    queryKey: ['service-requests-summary'],
    queryFn: serviceRequestsApi.getSummary,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const {
    data: myBills,
    isLoading: isBillsLoading,
    refetch: refetchBills,
  } = useQuery({
    queryKey: ['my-bills'],
    queryFn: billingApi.getMyBills,
    enabled: isResident,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const {
    payableBills,
    paidBills,
    nextBill,
    totalDue: billsDue,
  } = React.useMemo(() => summarizeBills(myBills), [myBills])

  useEffect(() => {
    if (notifications.length === 0) return
    const latest = notifications[0]
    switch (latest.event) {
      case 'waste-collection-update':
        queryClient.invalidateQueries({ queryKey: ['waste-stats'] })
        queryClient.invalidateQueries({ queryKey: ['my-waste-collections'] })
        queryClient.invalidateQueries({ queryKey: ['waste-collections'] })
        break
      case 'recyclable-update':
        queryClient.invalidateQueries({ queryKey: ['my-recyclables'] })
        queryClient.invalidateQueries({ queryKey: ['valuation-summary'] })
        break
      case 'wallet-update':
        queryClient.invalidateQueries({ queryKey: ['wallet-balance'] })
        queryClient.invalidateQueries({ queryKey: ['wallet-summary'] })
        queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] })
        break
      case 'service-request-update':
        queryClient.invalidateQueries({ queryKey: ['service-requests-summary'] })
        break
      case 'collection-route-update':
        queryClient.invalidateQueries({ queryKey: ['collection-routes-summary'] })
        queryClient.invalidateQueries({ queryKey: ['collection-routes-live'] })
        break
    }
  }, [notifications, queryClient])

  const pendingRecyclables =
    recyclables?.filter((item) => item.status === 'logged' || item.status === 'pickup_requested').length || 0
  const completedCollections = collections?.filter((collection) => ['completed', 'verified'].includes(collection.status)).length || 0
  const pendingCollections = collections?.filter((collection) => ['scheduled', 'in_progress'].includes(collection.status)).length || 0
  
  const now = new Date()
  const nextCollection = React.useMemo(() => {
    if (!collections || collections.length === 0) return null
    
    return collections
      .filter((collection) => {
        if (!['scheduled', 'in_progress'].includes(collection.status)) return false
        if (!collection.scheduledDate) return false
        
        const scheduledDate = new Date(collection.scheduledDate)
        if (isNaN(scheduledDate.getTime())) return false
        
        return scheduledDate >= now
      })
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())[0] || null
  }, [collections, now])
  
  const latestCollection = collections?.[0]
  
  const hasSummaryError = isWasteStatsError || isRecyclablesError || (isResident && isBalanceError)
  
  const servicePulseData = React.useMemo(
    () => buildResidentPulseData(collections || [], recyclables || []),
    [collections, recyclables],
  )
  
  const workloadRingData = React.useMemo(
    () => {
      const data = [
        { name: 'Collections', value: pendingCollections, fill: '#3d5a36' },
        { name: 'Requests', value: requestSummary?.openRequests ?? 0, fill: '#d97706' },
        { name: 'Recyclables', value: pendingRecyclables, fill: '#16a34a' },
      ].filter((entry) => entry.value > 0)
      
      return data.length > 0 ? data : []
    },
    [pendingCollections, pendingRecyclables, requestSummary?.openRequests],
  )

  const billsSummary = React.useMemo(() => ({
    totalDue: billsDue,
    payableBillsCount: payableBills.length,
    paidBillsCount: paidBills.length,
  }), [billsDue, payableBills.length, paidBills.length])

  return (
    <div className="page-container">
      {/* Onboarding Checklist */}
      {shouldShowChecklist && isResident && (
        <OnboardingChecklist
          completedSteps={state.completedSteps}
          onStepClick={completeStep}
          onDismiss={dismissChecklist}
        />
      )}

      {/* Billing Widget for Residents */}
      {isResident && (
        <>
          {isBillsLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-7 text-center text-sm text-slate-500">
              Loading your refuse bills...
            </div>
          ) : myBills ? (
            <DashboardBillingWidget bills={myBills} />
          ) : (
            <StatePanel
              tone="error"
              title="Couldn't load bills"
              description="Your billing account couldn't be reached. Check that the backend is running."
              action={
                <button type="button" onClick={() => refetchBills()} className="btn btn-primary h-11 mt-4">
                  Try again
                </button>
              }
            />
          )}
        </>
      )}

      {/* Dashboard Header */}
      <DashboardHeader
        user={user}
        isResident={isResident}
        nextBill={nextBill}
        payableBillsCount={payableBills.length}
      />

      {/* Admin Bill Issue Panel */}
      {!isResident && canIssueBills && <AdminBillIssuePanel compact />}

      {/* Dashboard Metrics */}
      {hasSummaryError ? (
        <StatePanel
          tone="error"
          title="Dashboard summary unavailable"
          description="We couldn't load one or more overview metrics right now."
        />
      ) : (
        <DashboardMetrics
          isResident={isResident}
          wasteStats={wasteStats}
          balance={balance}
          walletSummary={walletSummary}
          valuationSummary={valuationSummary}
          routeSummary={routeSummary}
          billsSummary={billsSummary}
          completedCollections={completedCollections}
          pendingCollections={pendingCollections}
          pendingRecyclables={pendingRecyclables}
          isLoading={{
            wasteStats: isWasteStatsLoading,
            balance: isBalanceLoading,
            recyclables: isRecyclablesLoading,
          }}
        />
      )}

      {/* Dashboard Main Content */}
      <DashboardContent
        isResident={isResident}
        collections={collections}
        isCollectionsLoading={isCollectionsLoading}
        isCollectionsError={isCollectionsError}
        nextCollection={nextCollection}
        latestCollection={latestCollection}
        completedCollections={completedCollections}
        pendingRecyclables={pendingRecyclables}
        requestSummary={requestSummary}
        routeSummary={routeSummary}
        servicePulseData={servicePulseData}
        workloadRingData={workloadRingData}
      />
    </div>
  )
}

export default Dashboard