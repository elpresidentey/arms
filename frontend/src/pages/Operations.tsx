import React from 'react'
import { Copy, Mail, ShieldCheck, ShieldX, Truck, Users } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import Input from '../components/Input'
import OptimizedImage from '../components/OptimizedImage'
import PageHeader from '../components/PageHeader'
import StatePanel from '../components/StatePanel'
import Surface from '../components/Surface'
import { adminInvitesApi, collectionRoutesApi, logisticsApi, reportsApi, serviceRequestsApi, walletApi, wasteCollectionsApi } from '../services/api'
import { getErrorMessage } from '../utils/errors'
import { formatCurrency, formatDayTime } from '../utils/format'

const Operations: React.FC = () => {
  const { user } = useAuth()
  const { notifications } = useSocket()
  const queryClient = useQueryClient()
  const payoutsEnabled =
    import.meta.env.VITE_ENABLE_PAYOUTS !== 'false' &&
    Boolean(import.meta.env.VITE_PAYSTACK_PUBLIC_KEY)
  const canReviewFinance = payoutsEnabled && ['admin', 'supervisor', 'finance_officer'].includes(user?.role || '')
  const [inviteEmail, setInviteEmail] = React.useState('')
  const [inviteHours, setInviteHours] = React.useState('72')
  const [inviteNote, setInviteNote] = React.useState('')
  const [latestInviteLink, setLatestInviteLink] = React.useState<string | null>(null)
  const [latestInviteEmailSent, setLatestInviteEmailSent] = React.useState<boolean | null>(null)
  const { data: routeSummary, isLoading: isRouteSummaryLoading } = useQuery({
    queryKey: ['collection-routes-summary'],
    queryFn: collectionRoutesApi.getSummary,
  })

  const { data: requestSummary, isLoading: isRequestSummaryLoading } = useQuery({
    queryKey: ['service-requests-summary'],
    queryFn: serviceRequestsApi.getSummary,
  })

  const { data: reports, isLoading: isReportsLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: reportsApi.getReports,
  })

  const { data: routes, isLoading: isRoutesLoading } = useQuery({
    queryKey: ['collection-routes'],
    queryFn: collectionRoutesApi.getRoutes,
  })

  const { data: serviceRequests, isLoading: isServiceRequestsLoading } = useQuery({
    queryKey: ['service-requests'],
    queryFn: serviceRequestsApi.getRequests,
  })

  const { data: collections, isLoading: isCollectionsLoading } = useQuery({
    queryKey: ['waste-collections'],
    queryFn: wasteCollectionsApi.getCollections,
  })

  const { data: wasteStats, isLoading: isWasteStatsLoading } = useQuery({
    queryKey: ['waste-stats'],
    queryFn: wasteCollectionsApi.getStats,
  })

  const {
    data: withdrawals,
    isLoading: isWithdrawalsLoading,
    isError: isWithdrawalsError,
  } = useQuery({
    queryKey: ['finance-withdrawals'],
    queryFn: walletApi.getWithdrawals,
    enabled: canReviewFinance,
  })

  const {
    data: adminInvites,
    isLoading: isInvitesLoading,
  } = useQuery({
    queryKey: ['admin-invites'],
    queryFn: adminInvitesApi.list,
    enabled: user?.role === 'admin',
  })

  const { data: logistics, isLoading: isLogisticsLoading } = useQuery({
    queryKey: ['logistics-summary'],
    queryFn: logisticsApi.getSummary,
  })

  React.useEffect(() => {
    if (!notifications.length) {
      return
    }

    const latest = notifications[0]
    switch (latest.event) {
      case 'service-request-update':
        queryClient.invalidateQueries({ queryKey: ['service-requests-summary'] })
        queryClient.invalidateQueries({ queryKey: ['service-requests'] })
        break
      case 'report-update':
        queryClient.invalidateQueries({ queryKey: ['reports'] })
        break
      case 'collection-route-update':
        queryClient.invalidateQueries({ queryKey: ['collection-routes-summary'] })
        queryClient.invalidateQueries({ queryKey: ['collection-routes'] })
        queryClient.invalidateQueries({ queryKey: ['logistics-summary'] })
        break
      case 'waste-collection-update':
        queryClient.invalidateQueries({ queryKey: ['waste-collections'] })
        queryClient.invalidateQueries({ queryKey: ['waste-stats'] })
        queryClient.invalidateQueries({ queryKey: ['logistics-summary'] })
        break
    }
  }, [notifications, queryClient])

  const statusMutation = useMutation({
    mutationFn: walletApi.getWithdrawalStatus,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['finance-withdrawals'] })
      toast.success(`Paystack status: ${result.paystack.status}`)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not refresh withdrawal status.'))
    },
  })

  const createInviteMutation = useMutation({
    mutationFn: adminInvitesApi.create,
    onSuccess: (result) => {
      setLatestInviteLink(result.inviteLink)
      setLatestInviteEmailSent(result.emailSent)
      setInviteEmail('')
      setInviteHours('72')
      setInviteNote('')
      queryClient.invalidateQueries({ queryKey: ['admin-invites'] })
      toast.success(result.emailSent ? 'Admin invite email sent.' : 'Admin invite created, but email delivery is not configured.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not create admin invite.'))
    },
  })

  const revokeInviteMutation = useMutation({
    mutationFn: adminInvitesApi.revoke,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invites'] })
      toast.success('Invite revoked.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not revoke invite.'))
    },
  })

  const isLoading =
    isRouteSummaryLoading ||
    isRequestSummaryLoading ||
    isReportsLoading ||
    isRoutesLoading ||
    isServiceRequestsLoading ||
    isCollectionsLoading ||
    isLogisticsLoading ||
    isWasteStatsLoading ||
    (canReviewFinance && isWithdrawalsLoading)
  const activeReports = reports?.filter((report) => !['resolved', 'closed'].includes(report.status)) || []
  const deployedTruckCount = new Set(
    (routes || [])
      .filter((route) => route.status === 'active' && route.truckCode)
      .map((route) => route.truckCode?.trim().toUpperCase())
      .filter(Boolean),
  ).size
  const pendingCollectionRequests =
    collections?.filter((collection) => ['scheduled', 'in_progress'].includes(collection.status)).length || 0
  const pendingServiceRequests =
    serviceRequests?.filter((request) => ['submitted', 'triaged', 'scheduled', 'in_progress', 'escalated'].includes(request.status)).length || 0
  const openComplaints = activeReports.length
  const recentComplaints = activeReports.slice(0, 5)
  const recentRequests = (serviceRequests || []).slice(0, 5)
  const recentWithdrawals = withdrawals?.slice(0, 6) || []
  const withdrawalTotal = withdrawals?.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0) || 0
  const recentInvites = adminInvites?.slice(0, 6) || []
  const operationsTrend = React.useMemo(() => buildOperationsTrendData(collections || [], serviceRequests || [], reports || []), [collections, serviceRequests, reports])
  const queueMix = React.useMemo(
    () => [
      { label: 'Collections', value: pendingCollectionRequests, fill: '#0f766e' },
      { label: 'Requests', value: pendingServiceRequests, fill: '#d97706' },
      { label: 'Complaints', value: openComplaints, fill: '#dc2626' },
      { label: 'Routes', value: routeSummary?.disruptedRoutes ?? 0, fill: '#334155' },
    ],
    [openComplaints, pendingCollectionRequests, pendingServiceRequests, routeSummary?.disruptedRoutes],
  )

  const handleCreateInvite = async (event: React.FormEvent) => {
    event.preventDefault()
    await createInviteMutation.mutateAsync({
      email: inviteEmail,
      expiresInHours: Number(inviteHours) || 72,
      note: inviteNote.trim() || undefined,
    })
  }

  const handleCopyInvite = async () => {
    if (!latestInviteLink || !navigator.clipboard) {
      return
    }

    await navigator.clipboard.writeText(latestInviteLink)
    toast.success('Invite link copied.')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Council operations overview"
        description="A single command view for route readiness, open resident requests, report backlog, and recent collection performance."
        meta={
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="metric-panel stagger-enter px-4 py-3">
              <p className="label text-slate-500">Trucks deployed</p>
              <p className="mt-2 heading-3 text-slate-950">{deployedTruckCount}</p>
            </div>
            <div className="metric-panel stagger-enter bg-primary-50/70 px-4 py-3">
              <p className="label text-primary-700">Pending collection requests</p>
              <p className="mt-2 heading-3 text-primary-900">{pendingCollectionRequests}</p>
            </div>
            <div className="metric-panel stagger-enter bg-amber-50/70 px-4 py-3">
              <p className="label text-amber-700">Pending service requests</p>
              <p className="mt-2 heading-3 text-amber-900">{pendingServiceRequests}</p>
            </div>
            <div className="metric-panel stagger-enter bg-emerald-50/70 px-4 py-3">
              <p className="label text-emerald-700">Open complaints</p>
              <p className="mt-2 heading-3 text-emerald-900">{openComplaints}</p>
            </div>
          </div>
        }
      />

      {isLoading ? (
        <StatePanel tone="loading" title="Loading operations view" description="Bringing together route, request, and report queues." />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr,0.9fr]">
          <Surface title="Backlog snapshot" subtitle="Fast triage on the items that most often break service quality.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="metric-panel stagger-enter p-4">
                <p className="label text-slate-500">Complaints awaiting closure</p>
                <p className="mt-3 heading-2 text-slate-950">{activeReports.length}</p>
                <p className="mt-2 body-small text-slate-500">Every resident complaint stays visible here until it is resolved or closed.</p>
              </div>
              <div className="metric-panel stagger-enter p-4">
                <p className="label text-slate-500">Urgent resident requests</p>
                <p className="mt-3 heading-2 text-slate-950">{requestSummary?.urgentRequests ?? 0}</p>
                <p className="mt-2 body-small text-slate-500">Bulky pickups, missed service escalations, and broken bins share one queue for staff follow-up.</p>
              </div>
            </div>
          </Surface>

          <Surface title="Operational load" subtitle="A seven-day moving picture of incoming field work across collections, service requests, and complaints.">
            <div className="mb-4 flex flex-wrap gap-3 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#0f766e]" /> Collections</span>
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#d97706]" /> Requests</span>
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#dc2626]" /> Complaints</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={operationsTrend} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="opsCollections" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="opsRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="opsComplaints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 18px 40px rgba(15,23,42,0.12)' }}
                    cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="collections" stroke="#0f766e" strokeWidth={2.5} fill="url(#opsCollections)" animationDuration={900} />
                  <Area type="monotone" dataKey="requests" stroke="#d97706" strokeWidth={2.5} fill="url(#opsRequests)" animationDuration={1100} />
                  <Area type="monotone" dataKey="complaints" stroke="#dc2626" strokeWidth={2.5} fill="url(#opsComplaints)" animationDuration={1300} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Surface>

          <Surface title="Route health" subtitle="A refuse operations pulse on route readiness and service disruption.">
            <div className="space-y-3">
              <div className="data-row rounded-2xl border border-slate-200 bg-white/85 px-4 py-3">
                <p className="label text-slate-500">Active routes</p>
                <p className="mt-2 heading-3 text-slate-950">{routeSummary?.activeRoutes ?? 0}</p>
              </div>
              <div className="data-row rounded-2xl border border-slate-200 bg-white/85 px-4 py-3">
                <p className="label text-slate-500">Routes due today</p>
                <p className="mt-2 heading-3 text-slate-950">{routeSummary?.dueToday ?? 0}</p>
              </div>
              <div className="data-row rounded-2xl border border-slate-200 bg-white/85 px-4 py-3">
                <p className="label text-slate-500">Disrupted routes</p>
                <p className="mt-2 heading-3 text-slate-950">{routeSummary?.disruptedRoutes ?? 0}</p>
              </div>
              <div className="data-row rounded-2xl border border-slate-200 bg-white/85 px-4 py-3">
                <p className="label text-slate-500">Last pickup</p>
                <p className="mt-2 body font-semibold text-slate-950">{formatDayTime(wasteStats?.lastPickup)}</p>
              </div>
            </div>
          </Surface>

          <Surface title="Logistics readiness" subtitle="Fleet deployment, truck assignment gaps, and routes needing operations attention.">
            <div className="grid gap-4 lg:grid-cols-[0.75fr,1.25fr]">
              <div className="space-y-3">
                <div className="metric-panel p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="label text-slate-500">Readiness</p>
                      <p className="mt-2 heading-2 text-slate-950">{logistics?.readiness.readinessPercent ?? 100}%</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                      <Truck className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-primary-600 transition-all duration-700"
                      style={{ width: `${logistics?.readiness.readinessPercent ?? 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="data-row rounded-2xl border border-slate-200 bg-white/85 px-3 py-3">
                    <p className="caption font-semibold text-slate-500">Fleet Size</p>
                    <p className="mt-2 heading-4 text-slate-950">{logistics?.fleet.totalVehicles ?? 0}</p>
                  </div>
                  <div className="data-row rounded-2xl border border-slate-200 bg-white/85 px-3 py-3">
                    <p className="caption font-semibold text-slate-500">Deployed</p>
                    <p className="mt-2 heading-4 text-slate-950">{logistics?.fleet.assignedVehicles ?? 0}</p>
                  </div>
                  <div className="data-row rounded-2xl border border-slate-200 bg-white/85 px-3 py-3">
                    <p className="caption font-semibold text-slate-500">Available</p>
                    <p className="mt-2 heading-4 text-slate-950">{logistics?.fleet.availableVehicles ?? 0}</p>
                  </div>
                  <div className="data-row rounded-2xl border border-slate-200 bg-white/85 px-3 py-3">
                    <p className="caption font-semibold text-slate-500">Maintenance</p>
                    <p className="mt-2 heading-4 text-slate-950">{logistics?.fleet.maintenanceVehicles ?? 0}</p>
                  </div>
                </div>

                {/* Driver Summary */}
                <div className="metric-panel p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="label text-slate-500">Active Drivers</p>
                      <p className="mt-1 heading-3 text-slate-950">{logistics?.drivers.activeDrivers ?? 0}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Assigned: {logistics?.drivers.assignedDrivers ?? 0}</span>
                    <span>Available: {logistics?.drivers.availableDrivers ?? 0}</span>
                  </div>
                </div>

                <div className="data-row rounded-2xl border border-slate-200 bg-white/85 px-3 py-3">
                  <p className="caption font-semibold text-slate-500">Unassigned Routes</p>
                  <p className="mt-2 heading-4 text-slate-950">{logistics?.fleet.unassignedRoutes ?? 0}</p>
                </div>
              </div>
              <div className="space-y-3">
                {[].slice(0, 5).map((truck: any) => (
                  <div key={truck.truckCode} className="data-row rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{truck.truckCode}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {truck.nextRoute ? `${truck.nextRoute.name} · ${truck.nextRoute.street}, ${truck.nextRoute.ward}` : 'No route assigned'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-primary-50 px-2.5 py-1 text-primary-700">{truck.dueToday} due today</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{truck.routeCount} routes</span>
                        {truck.disruptedRoutes > 0 ? (
                          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-700">{truck.disruptedRoutes} disrupted</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
                {!([]).length ? (
                  <StatePanel title="No trucks assigned yet" description="Assign truck codes to routes to activate logistics readiness tracking." />
                ) : null}
              </div>
            </div>
          </Surface>

          <Surface title="Queue distribution" subtitle="Where the current admin attention load is sitting right now.">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={queueMix} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#0f172a', fontSize: 12, fontWeight: 600 }} width={88} />
                  <Tooltip
                    contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 18px 40px rgba(15,23,42,0.12)' }}
                    cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                  />
                  <Bar dataKey="value" radius={[0, 12, 12, 0]} animationDuration={1000}>
                    {queueMix.map((entry) => (
                      <Cell key={entry.label} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Surface>

          <Surface title="Resident complaints" subtitle="Fresh complaints appear here so operations can respond without opening another screen.">
            {!recentComplaints.length ? (
              <StatePanel
                title="No complaints yet"
                description="When a resident logs a complaint, it will appear here for admin review."
              />
            ) : (
              <div className="space-y-3">
                {recentComplaints.map((report) => (
                  <div key={report.id} className="data-row stagger-enter rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-950">{report.title}</p>
                      <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[0.7rem] font-semibold tracking-[0.14em] text-rose-700">
                        {report.status.replace('_', ' ')}
                      </span>
                      <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[0.7rem] font-semibold tracking-[0.14em] text-white">
                        {report.priority}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{report.description}</p>
                    {report.photoUrls?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {report.photoUrls.slice(0, 3).map((url, index) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-primary-400"
                            aria-label={`Open complaint evidence ${index + 1}`}
                          >
                            <OptimizedImage
                              src={url}
                              alt={`Complaint evidence ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>{report.ticketNumber}</span>
                      <span>{report.address}</span>
                      <span>From {report.reporter ? `${report.reporter.firstName} ${report.reporter.lastName}` : 'resident'}</span>
                      <span>{formatDayTime(report.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Surface>

          <div className="xl:col-span-2">
            <Surface title="Pending service requests" subtitle="New resident requests should be visible here as soon as they are submitted.">
              {!recentRequests.length ? (
                <StatePanel
                  title="No service requests yet"
                  description="When a resident submits a request, it will appear here for scheduling and follow-up."
                />
              ) : (
                <div className="space-y-3">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="data-row stagger-enter rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-950">{request.title}</p>
                        <span className="rounded-full bg-primary-100 px-2.5 py-1 text-[0.7rem] font-semibold tracking-[0.14em] text-primary-700">
                          {request.status.replace('_', ' ')}
                        </span>
                        <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[0.7rem] font-semibold tracking-[0.14em] text-white">
                          {request.priority}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{request.description}</p>
                      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>{request.requestNumber}</span>
                        <span>{request.address}</span>
                        <span>From {request.resident ? `${request.resident.firstName} ${request.resident.lastName}` : 'resident'}</span>
                        <span>{formatDayTime(request.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Surface>

            {user?.role === 'admin' && (
              <Surface title="Staff invite issuance" subtitle="Issue single-use admin invite links instead of sharing a permanent code.">
                <div className="space-y-5">
                  <form className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr,0.6fr,1fr,auto]" onSubmit={handleCreateInvite}>
                    <Input
                      id="inviteEmail"
                      name="inviteEmail"
                      type="email"
                      label="Invite email"
                      value={inviteEmail}
                      onChange={(event) => setInviteEmail(event.target.value)}
                      required
                      loading={createInviteMutation.isPending}
                      leftIcon={<Mail className="h-4 w-4" />}
                    />
                    <Input
                      id="inviteHours"
                      name="inviteHours"
                      type="number"
                      min={1}
                      max={168}
                      label="Expires in hours"
                      value={inviteHours}
                      onChange={(event) => setInviteHours(event.target.value)}
                      required
                      loading={createInviteMutation.isPending}
                    />
                    <Input
                      id="inviteNote"
                      name="inviteNote"
                      type="text"
                      label="Internal note"
                      value={inviteNote}
                      onChange={(event) => setInviteNote(event.target.value)}
                      loading={createInviteMutation.isPending}
                      leftIcon={<ShieldCheck className="h-4 w-4" />}
                    />
                    <button
                      type="submit"
                      disabled={createInviteMutation.isPending}
                      className="btn btn-primary h-12 self-end px-4 text-sm"
                    >
                      {createInviteMutation.isPending ? 'Issuing...' : 'Issue invite'}
                    </button>
                  </form>

                  {latestInviteLink ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 ambient-pulse">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-emerald-900">
                            {latestInviteEmailSent
                              ? 'Invite email sent. Keep this link as a backup.'
                              : 'Invite created, but the system could not send the email. Share this link manually.'}
                          </p>
                          <p className="mt-1 break-all font-mono text-sm text-emerald-800">{latestInviteLink}</p>
                        </div>
                        <button type="button" onClick={handleCopyInvite} className="btn btn-secondary h-10 px-4 text-sm">
                          <span className="inline-flex items-center gap-2">
                            <Copy className="h-4 w-4" />
                            Copy link
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {isInvitesLoading ? (
                    <StatePanel tone="loading" title="Loading invites" description="Fetching recent staff invite records." />
                  ) : !recentInvites.length ? (
                    <StatePanel title="No admin invites yet" description="Issue the first one-time invite link when a new staff member needs access." />
                  ) : (
                    <div className="space-y-3">
                      {recentInvites.map((invite) => (
                        <div key={invite.id} className="data-row flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-slate-950">{invite.email}</p>
                              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[0.7rem] font-semibold tracking-[0.14em] text-white">
                                {invite.status}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                              <span>Created {formatDayTime(invite.createdAt)}</span>
                              <span>Expires {formatDayTime(invite.expiresAt)}</span>
                              {invite.note ? <span>Note: {invite.note}</span> : null}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => revokeInviteMutation.mutate(invite.id)}
                            disabled={invite.status !== 'active' || revokeInviteMutation.isPending}
                            className="btn btn-secondary h-10 px-4 text-sm"
                          >
                            <span className="inline-flex items-center gap-2">
                              <ShieldX className="h-4 w-4" />
                              Revoke invite
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Surface>
            )}

            <Surface title="Finance payout review" subtitle="Recent wallet withdrawals with Paystack references for finance reconciliation.">
              {!payoutsEnabled ? (
                <StatePanel
                  title="Payout review disabled for MVP"
                  description="Refuse operations can launch without live money movement. Enable VITE_ENABLE_PAYOUTS=true after Paystack transfers and reconciliation are production-tested."
                />
              ) : !canReviewFinance ? (
                <StatePanel
                  title="Finance review is restricted"
                  description="Only admins, supervisors, and finance officers can review payout records."
                />
              ) : isWithdrawalsError ? (
                <StatePanel
                  tone="error"
                  title="Couldn't load withdrawals"
                  description="Only admins, supervisors, and finance officers can review payout records."
                />
              ) : !recentWithdrawals.length ? (
                <StatePanel
                  title="No payout activity yet"
                  description="Resident withdrawals will appear here after Paystack transfer initiation."
                />
              ) : (
                <div className="space-y-3">
                  <div className="metric-panel bg-emerald-50/80 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">Withdrawal volume</p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-900">{formatCurrency(withdrawalTotal)}</p>
                  </div>
                  {recentWithdrawals.map((withdrawal) => (
                    <div
                      key={withdrawal.id}
                      className="data-row stagger-enter flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-950">
                            {withdrawal.user
                              ? `${withdrawal.user.firstName} ${withdrawal.user.lastName}`
                              : 'Resident payout'}
                          </p>
                          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[0.7rem] font-semibold tracking-[0.14em] text-white">
                            {formatCurrency(Number(withdrawal.amount))}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{withdrawal.description || 'Wallet withdrawal'}</p>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span>{formatDayTime(withdrawal.createdAt)}</span>
                          <span>Balance after: {formatCurrency(Number(withdrawal.balanceAfter))}</span>
                          {withdrawal.externalTransactionId ? (
                            <span>Paystack ref: {withdrawal.externalTransactionId}</span>
                          ) : null}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => statusMutation.mutate(withdrawal.id)}
                        disabled={statusMutation.isPending || !withdrawal.externalTransactionId}
                        className="btn btn-secondary h-10 px-4 text-sm"
                      >
                        {statusMutation.isPending ? 'Checking...' : 'Check Paystack status'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Surface>
          </div>
        </div>
      )}
    </div>
  )
}

const buildOperationsTrendData = (
  collections: Array<{ scheduledDate?: string }>,
  requests: Array<{ createdAt: string }>,
  reports: Array<{ createdAt: string }>,
) => {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))
    return date
  })

  return days.map((date) => {
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    const inRange = (value?: string) => {
      if (!value) return false
      const parsed = new Date(value)
      return parsed >= date && parsed < nextDate
    }

    return {
      label: date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }),
      collections: collections.filter((item) => inRange(item.scheduledDate)).length,
      requests: requests.filter((item) => inRange(item.createdAt)).length,
      complaints: reports.filter((item) => inRange(item.createdAt)).length,
    }
  })
}

export default Operations
