import React, { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  MapPin,
  Recycle,
  Route as RouteIcon,
  Truck,
  Wallet,
  Receipt,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { billingApi, collectionRoutesApi, recyclablesApi, serviceRequestsApi, walletApi, wasteCollectionsApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { useOnboarding } from '../hooks/useOnboarding'
import Button from '../components/Button'
import MetricCard from '../components/MetricCard'
import DashboardBillingWidget from '../components/billing/DashboardBillingWidget'
import PayBillButton from '../components/billing/PayBillButton'
import RecentActivity from '../components/RecentActivity'
import StatePanel from '../components/StatePanel'
import Surface from '../components/Surface'
import WasteTimeline from '../components/WasteTimeline'
import OnboardingChecklist from '../components/OnboardingChecklist'
import { TimelineSkeleton } from '../components/Skeleton'
import AdminBillIssuePanel from '../components/billing/AdminBillIssuePanel'
import { formatCurrency, formatDayTime, formatShortDate } from '../utils/format'
import { getResidentDashboardGreeting } from '../utils/greeting'
import { summarizeBills } from '../utils/bills'
import { BILLING_ADMIN_ROLES, hasRole } from '../routes/roles'

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
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Refetch every 60 seconds
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
        // Check if date is valid
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
      
      // Return empty array if no data to prevent chart rendering issues
      return data.length > 0 ? data : []
    },
    [pendingCollections, pendingRecyclables, requestSummary?.openRequests],
  )

  return (
    <div className="page-container">
      {/* Welcome Modal Disabled - User requested removal */}
      {/* <WelcomeModal
        isOpen={shouldShowWelcome}
        onClose={markWelcomeSeen}
        userName={user?.firstName}
      /> */}

      {/* Onboarding Checklist */}
      {shouldShowChecklist && isResident && (
        <OnboardingChecklist
          completedSteps={state.completedSteps}
          onStepClick={completeStep}
          onDismiss={dismissChecklist}
        />
      )}

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

      <section className="panel-shell dashboard-grid relative overflow-hidden rounded-xl">
        <div className="relative grid gap-0 lg:grid-cols-[1.45fr_0.55fr]">
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-primary-700 sm:tracking-[0.14em]">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{user?.street || user?.address || 'Address pending'}</span>
              </span>
            </div>

            <div className="mt-4 max-w-3xl sm:mt-5">
              <p className="caption text-slate-500">
                {isResident ? 'Your dashboard' : 'Staff dashboard'}
              </p>
              <h1 className="font-display mt-1.5 max-w-2xl text-xl font-bold tracking-tight text-slate-950 sm:text-3xl text-balance">
                {isResident
                  ? getResidentDashboardGreeting(user)
                  : 'Operations summary'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-3">
                {isResident
                  ? 'Track refuse collection, household requests, complaints, wallet activity, and recycling from one place.'
                  : 'Monitor refuse routes, resident complaints, service requests, truck readiness, and payout activity from one view.'}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:mt-5 sm:flex sm:flex-wrap">
              {isResident ? (
                <>
                  <Link to="/app/service-requests">
                    <Button size="lg" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 shadow-lg shadow-primary-600/15">
                      <ClipboardList className="h-4 w-4" />
                      New refuse request
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/app/reports">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto inline-flex items-center justify-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Report refuse issue
                    </Button>
                  </Link>
                  <Link to="/app/schedules">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto inline-flex items-center justify-center gap-2">
                      <RouteIcon className="h-4 w-4" />
                      View refuse schedule
                    </Button>
                  </Link>
                  {nextBill && (
                    <div>
                      <PayBillButton bill={nextBill} size="lg" showAmount className="w-full sm:w-auto" />
                    </div>
                  )}
                  {payableBills.length > 0 && (
                    <Link to="/app/bills">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto inline-flex items-center justify-center gap-2">
                        <Receipt className="h-4 w-4" />
                        View all bills
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/app/operations">
                    <Button size="lg" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 shadow-lg shadow-primary-600/15">
                      <RouteIcon className="h-4 w-4" />
                      Open refuse operations
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/app/reports">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto inline-flex items-center justify-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Review complaints
                    </Button>
                  </Link>
                  <Link to="/app/service-requests">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto inline-flex items-center justify-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      Manage refuse requests
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-3">
              <MetricCard
                compact
                accent="teal"
                label="Service activity"
                value={pendingCollections}
                detail="scheduled or active stops"
                icon={<Truck className="h-5 w-5" />}
              />
              <MetricCard
                compact
                accent="amber"
                label="Open requests"
                value={requestSummary?.openRequests ?? 0}
                detail="items waiting for response"
                icon={<ClipboardList className="h-5 w-5" />}
              />
              <MetricCard
                compact
                accent="violet"
                label="Recycling queue"
                value={pendingRecyclables}
                detail="logged or pickup requested"
                icon={<Recycle className="h-5 w-5" />}
              />
            </div>
          </div>

          <div className="relative z-10 border-t border-slate-200/80 bg-[linear-gradient(180deg,#1f2e1d_0%,#2a3d28_100%)] p-4 text-white sm:p-5 lg:border-l lg:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Next action</p>
            <div className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
              {isResident && nextBill ? (
                <div
                  className={`rounded-xl border p-4 ${
                    nextBill.status === 'overdue'
                      ? 'border-red-400/50 bg-red-500/15'
                      : 'border-amber-400/40 bg-amber-500/10'
                  }`}
                >
                  <p className="text-xs text-amber-200/90">
                    {nextBill.status === 'overdue' ? 'Overdue refuse bill' : 'Refuse bill due'}
                  </p>
                  <p className="mt-1 text-xl font-semibold sm:text-2xl">{formatCurrency(nextBill.totalAmount)}</p>
                  <p className="mt-1 text-sm text-slate-300">
                    {nextBill.status === 'overdue' ? 'Expired' : 'Due'} {formatShortDate(nextBill.dueDate)}
                  </p>
                  <div className="mt-4">
                    <PayBillButton bill={nextBill} size="md" showAmount fullWidth />
                  </div>
                </div>
              ) : null}
              <div>
                <p className="text-lg font-semibold tracking-tight sm:text-2xl">
                  {nextCollection ? formatShortDate(nextCollection.scheduledDate) : 'No upcoming pickups'}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {nextCollection
                    ? `${nextCollection.status.replace('_', ' ')} collection for ${nextCollection.street || user?.street || 'your street'}.`
                    : isResident
                      ? 'No pickups scheduled for your area. Check the collection schedule or submit a special pickup request if needed.'
                      : 'No upcoming collections scheduled. Review route schedules to assign service windows.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm">
                  <p className="text-xs text-slate-400">Open requests</p>
                  <p className="mt-1 text-2xl font-semibold">{requestSummary?.openRequests ?? 0}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm">
                  <p className="text-xs text-slate-400">Pending items</p>
                  <p className="mt-1 text-2xl font-semibold">{pendingRecyclables}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!isResident && canIssueBills && <AdminBillIssuePanel compact />}

      {hasSummaryError ? (
        <StatePanel
          tone="error"
          title="Dashboard summary unavailable"
          description="We couldn't load one or more overview metrics right now."
        />
      ) : (
        <section
          className={`grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 ${isResident ? 'xl:grid-cols-5' : 'xl:grid-cols-4'}`}
        >
          <MetricCard
            accent="teal"
            icon={<Truck className="h-5 w-5" />}
            label="Last pickup"
            value={isWasteStatsLoading ? 'Loading' : formatShortDate(wasteStats?.lastPickup)}
            detail={`${completedCollections} completed records`}
          />
          <MetricCard
            accent="sky"
            icon={<Calendar className="h-5 w-5" />}
            label="This month"
            value={isWasteStatsLoading ? 'Loading' : `${wasteStats?.thisMonth || 0}`}
            detail={`${pendingCollections} scheduled or active`}
          />
          {isResident ? (
            <>
              <MetricCard
                accent="amber"
                icon={<Wallet className="h-5 w-5" />}
                label="Wallet balance"
                value={isBalanceLoading ? 'Loading' : formatCurrency(balance?.balance || 0)}
                detail={`${walletSummary?.transactionCount ?? 0} wallet transactions`}
              />
              <MetricCard
                accent="emerald"
                icon={<Recycle className="h-5 w-5" />}
                label="Recycling value"
                value={isRecyclablesLoading ? 'Loading' : formatCurrency(valuationSummary?.totalEstimated || 0)}
                detail={`${valuationSummary?.pendingItems ?? pendingRecyclables} pending items`}
              />
              <MetricCard
                accent="rose"
                icon={<Receipt className="h-5 w-5" />}
                label="Refuse bills"
                value={payableBills.length > 0 ? formatCurrency(billsDue) : 'Paid up'}
                detail={
                  payableBills.length > 0
                    ? `${payableBills.length} bill${payableBills.length > 1 ? 's' : ''} outstanding`
                    : `${paidBills.length} paid on record`
                }
              />
            </>
          ) : (
            <>
              <MetricCard
                accent="indigo"
                icon={<RouteIcon className="h-5 w-5" />}
                label="Routes due today"
                value={`${routeSummary?.dueToday ?? 0}`}
                detail={`${routeSummary?.disruptedRoutes ?? 0} disrupted routes`}
              />
              <MetricCard
                accent="violet"
                icon={<Recycle className="h-5 w-5" />}
                label="Recycling queue"
                value={isRecyclablesLoading ? 'Loading' : `${pendingRecyclables}`}
                detail="resident items awaiting pickup or processing"
              />
            </>
          )}
        </section>
      )}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <Surface
            title="Collection timeline"
          subtitle={isResident ? 'Recent and upcoming service activity for this account.' : 'Recent and upcoming refuse collection activity across resident routes.'}
          action={
            <Link to="/app/waste-history" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800">
              View history
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          {isCollectionsError ? (
            <StatePanel
              tone="error"
              title="Couldn't load collection activity"
              description="The latest pickup timeline is temporarily unavailable."
            />
          ) : isCollectionsLoading ? (
            <TimelineSkeleton />
          ) : collections && collections.length > 0 ? (
            <WasteTimeline collections={collections.slice(0, 6)} />
          ) : (
            <StatePanel
              title="No collections yet"
              description="Pickup history will appear here as soon as your route starts logging visits."
            />
          )}
        </Surface>

        <div className="space-y-5">
          <Surface
            title={isResident ? 'Recent account activity' : 'Recent operations activity'}
            subtitle={isResident ? 'Collection and recycling activity for the last six days.' : 'Collection and recycling activity for the last six days.'}
          >
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={servicePulseData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="residentPulse" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3d5a36" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#3d5a36" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 18px 40px rgba(15,23,42,0.12)' }}
                    cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="activity" stroke="#3d5a36" strokeWidth={2} fill="url(#residentPulse)" animationDuration={1000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Surface>

          <Surface title="Service status" subtitle={isResident ? "Your account activity summary." : "What needs attention now."}>
            <div className="space-y-4">
              {isResident ? (
                <>
                  <StatusRow
                    icon={<Truck className="h-4 w-4" />}
                    label="Next collection"
                    value={nextCollection ? formatDayTime(nextCollection.scheduledDate) : 'Not scheduled'}
                    tone={nextCollection ? 'good' : 'neutral'}
                  />
                  <StatusRow
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label="Completed collections"
                    value={`${completedCollections} this month`}
                    tone="good"
                  />
                  <StatusRow
                    icon={<Recycle className="h-4 w-4" />}
                    label="Recyclables"
                    value={`${pendingRecyclables} pending pickup`}
                    tone={pendingRecyclables > 0 ? 'warn' : 'good'}
                  />
                  <StatusRow
                    icon={<Clock className="h-4 w-4" />}
                    label="Service requests"
                    value={`${requestSummary?.openRequests ?? 0} open`}
                    tone={(requestSummary?.openRequests ?? 0) > 0 ? 'warn' : 'good'}
                  />
                </>
              ) : (
                <>
                  <StatusRow
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label="Route readiness"
                    value={`${routeSummary?.dueToday ?? 0} due today`}
                    tone={(routeSummary?.disruptedRoutes ?? 0) > 0 ? 'warn' : 'good'}
                  />
                  <StatusRow
                    icon={<Clock className="h-4 w-4" />}
                    label="Open service requests"
                    value={`${requestSummary?.openRequests ?? 0} open`}
                    tone={(requestSummary?.overdueRequests ?? 0) > 0 ? 'warn' : 'neutral'}
                  />
                  <StatusRow
                    icon={<Recycle className="h-4 w-4" />}
                    label="Recyclables"
                    value={`${pendingRecyclables} awaiting action`}
                    tone={pendingRecyclables > 0 ? 'warn' : 'good'}
                  />
                  <StatusRow
                    icon={<Truck className="h-4 w-4" />}
                    label="Latest collection"
                    value={latestCollection ? formatDayTime(latestCollection.scheduledDate) : 'No record yet'}
                    tone="neutral"
                  />
                </>
              )}
            </div>
          </Surface>

          <Surface
            title="Current workload mix"
            subtitle={isResident ? 'A compact view of the queues currently attached to your account.' : 'A compact view of active queues across resident operations.'}
          >
            {workloadRingData.length === 0 ? (
              <StatePanel title="No open workload" description="New collections, requests, and recyclable actions will appear here." />
            ) : (
              <div className="grid grid-cols-[0.8fr,1fr] items-center gap-4">
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={workloadRingData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={44}
                        outerRadius={70}
                        paddingAngle={4}
                        strokeWidth={0}
                        animationDuration={1100}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 18px 40px rgba(15,23,42,0.12)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {workloadRingData.map((entry) => (
                    <div key={entry.name} className="data-row flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                        {entry.name}
                      </span>
                      <span className="text-sm font-semibold text-slate-950">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Surface>

          <Surface title="Quick actions" subtitle="Common tasks for this account.">
            <div className="grid grid-cols-1 gap-2">
              {isResident ? (
                <>
                  <QuickLink to="/app/schedule-collection" icon={<Calendar className="h-4 w-4" />} label="Schedule refuse collection" />
                  <QuickLink to="/app/recyclables" icon={<Recycle className="h-4 w-4" />} label="Log recyclables" />
                  <QuickLink to="/app/locations" icon={<MapPin className="h-4 w-4" />} label="Find nearby refuse points" />
                  <QuickLink to="/app/wallet" icon={<Wallet className="h-4 w-4" />} label="Review wallet" />
                </>
              ) : (
                <>
                  <QuickLink to="/app/operations" icon={<RouteIcon className="h-4 w-4" />} label="Open refuse operations" />
                  <QuickLink to="/app/reports" icon={<AlertCircle className="h-4 w-4" />} label="Review complaints" />
                  <QuickLink to="/app/service-requests" icon={<ClipboardList className="h-4 w-4" />} label="Manage resident requests" />
                  <QuickLink to="/app/schedules" icon={<Calendar className="h-4 w-4" />} label="Review route schedules" />
                </>
              )}
            </div>
          </Surface>
        </div>
      </section>

      <Surface title="Recent activity" subtitle="Account and service updates.">
        <RecentActivity />
      </Surface>
    </div>
  )
}

const StatusRow = ({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone: 'good' | 'warn' | 'neutral'
}) => {
  const toneClass = {
    good: 'bg-emerald-50 text-emerald-700',
    warn: 'bg-amber-50 text-amber-700',
    neutral: 'bg-slate-100 text-slate-700',
  }[tone]

  return (
    <div className="data-row flex items-center justify-between gap-4 rounded-xl border border-transparent px-3 py-2.5 last:border-slate-100/0 last:pb-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>{icon}</span>
        <p className="truncate text-sm font-medium text-slate-900">{label}</p>
      </div>
      <p className="shrink-0 text-sm text-slate-500">{value}</p>
    </div>
  )
}

const QuickLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <Link
    to={to}
    className="data-row group flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 px-3.5 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:bg-primary-50/70 hover:text-primary-800"
  >
    <span className="inline-flex items-center gap-3">
      {icon}
      {label}
    </span>
    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary-700" />
  </Link>
)

const buildResidentPulseData = (
  collections: Array<{ scheduledDate?: string; createdAt?: string }>,
  recyclables: Array<{ createdAt: string; status: string }>,
) => {
  const days = Array.from({ length: 6 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (5 - index))
    return date
  })

  return days.map((date) => {
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    const inRange = (value?: string) => {
      if (!value) return false
      try {
        const parsed = new Date(value)
        // Check if date is valid
        if (isNaN(parsed.getTime())) return false
        return parsed >= date && parsed < nextDate
      } catch {
        return false
      }
    }

    const collectionsCount = collections?.filter((item) => inRange(item.scheduledDate || item.createdAt)).length || 0
    const recyclablesCount = recyclables?.filter((item) => inRange(item.createdAt)).length || 0

    return {
      label: date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }),
      activity: collectionsCount + recyclablesCount,
    }
  })
}

export default Dashboard
