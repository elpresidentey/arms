/**
 * Dashboard Content Component
 * Main content area with timeline, activity, and status panels
 */
import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Truck, Recycle, Clock, Calendar, MapPin, Wallet, AlertTriangle } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie } from 'recharts'
import Surface from '../Surface'
import StatePanel from '../StatePanel'
import WasteTimeline from '../WasteTimeline'
import { TimelineSkeleton } from '../Skeleton'
import { formatDayTime } from '../../utils/format'
import { WasteCollection } from '../../types'

interface StatusRowProps {
  icon: React.ReactNode
  label: string
  value: string
  tone?: 'good' | 'warn' | 'neutral'
}

const StatusRow: React.FC<StatusRowProps> = ({ icon, label, value, tone = 'neutral' }) => {
  const toneStyles = {
    good: {
      chip: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      value: 'text-slate-950',
    },
    warn: {
      chip: 'text-amber-600 bg-amber-50 border-amber-100',
      value: 'text-amber-700',
    },
    neutral: {
      chip: 'text-primary-700 bg-primary-50 border-primary-100',
      value: 'text-slate-950',
    },
  }

  return (
    <div className="flex items-center justify-between gap-3 py-3.5 first:pt-1 last:pb-1">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${toneStyles[tone].chip}`}>
          {icon}
        </div>
        <span className="truncate text-sm font-medium text-slate-700">{label}</span>
      </div>
      <span className={`shrink-0 text-sm font-semibold tabular-nums ${toneStyles[tone].value}`}>{value}</span>
    </div>
  )
}

interface QuickLinkProps {
  to: string
  icon: React.ReactNode
  label: string
}

const QuickLink: React.FC<QuickLinkProps> = ({ to, icon, label }) => (
  <Link
    to={to}
    className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50/40 hover:text-slate-900 hover:shadow-md hover:shadow-primary-900/5"
  >
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition-colors duration-200 group-hover:border-primary-200 group-hover:bg-white group-hover:text-primary-700">
      {icon}
    </div>
    <span className="flex-1 truncate">{label}</span>
    <ArrowRight className="h-4 w-4 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary-600" />
  </Link>
)

interface DashboardContentProps {
  isResident: boolean
  collections?: WasteCollection[]
  isCollectionsLoading?: boolean
  isCollectionsError?: boolean
  nextCollection?: WasteCollection | null
  latestCollection?: WasteCollection | null
  completedCollections: number
  pendingRecyclables: number
  requestSummary?: {
    openRequests?: number
  }
  routeSummary?: {
    dueToday: number
    disruptedRoutes: number
  }
  servicePulseData?: Array<{
    label: string
    activity: number
  }>
  workloadRingData?: Array<{
    name: string
    value: number
    fill: string
  }>
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  isResident,
  collections,
  isCollectionsLoading,
  isCollectionsError,
  nextCollection,
  latestCollection,
  completedCollections,
  pendingRecyclables,
  requestSummary,
  routeSummary,
  servicePulseData = [],
  workloadRingData = [],
}) => {
  return (
    <section className="grid grid-cols-1 gap-5 @6xl:grid-cols-[1.35fr_0.65fr]">
      {/* Main timeline */}
      <Surface
        className="stagger-enter"
        title="Recent Activity"
        subtitle="Latest collections and updates"
        action={
          <Link 
            to="/app/waste-history" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800"
          >
            View All
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

      {/* Side panels */}
      <div className="space-y-5">
        {/* Activity chart */}
        <Surface
          className="stagger-enter"
          title="Activity Trend"
          subtitle="Last 6 days"
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={servicePulseData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="residentPulse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3d5a36" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#3d5a36" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <YAxis 
                  allowDecimals={false} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip
                  contentStyle={{ 
                    borderRadius: 16, 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 18px 40px rgba(15,23,42,0.12)' 
                  }}
                  labelStyle={{ fontWeight: 600, color: '#0f172a' }}
                  cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="activity" 
                  stroke="#3d5a36" 
                  strokeWidth={2} 
                  fill="url(#residentPulse)" 
                  animationDuration={1000} 
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff', fill: '#3d5a36' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Surface>

        {/* Service status */}
        <Surface
          className="stagger-enter"
          title="Status Overview"
          subtitle="Current account status"
        >
          <div className="divide-y divide-slate-200/60">
            {isResident ? (
              <>
                <StatusRow
                  icon={<Truck className="h-4 w-4" />}
                  label="Next Collection"
                  value={nextCollection ? formatDayTime(nextCollection.scheduledDate) : 'Not Scheduled'}
                  tone={nextCollection ? 'good' : 'neutral'}
                />
                <StatusRow
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  label="Completed"
                  value={`${completedCollections} this month`}
                  tone="good"
                />
                <StatusRow
                  icon={<Recycle className="h-4 w-4" />}
                  label="Recyclables"
                  value={`${pendingRecyclables} pending`}
                  tone={pendingRecyclables > 0 ? 'warn' : 'good'}
                />
                <StatusRow
                  icon={<Clock className="h-4 w-4" />}
                  label="Requests"
                  value={`${requestSummary?.openRequests ?? 0} open`}
                  tone={(requestSummary?.openRequests ?? 0) > 0 ? 'warn' : 'good'}
                />
              </>
            ) : (
              <>
                <StatusRow
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  label="Routes"
                  value={`${routeSummary?.dueToday ?? 0} due today`}
                  tone={(routeSummary?.disruptedRoutes ?? 0) > 0 ? 'warn' : 'good'}
                />
                <StatusRow
                  icon={<Clock className="h-4 w-4" />}
                  label="Requests"
                  value={`${requestSummary?.openRequests ?? 0} open`}
                  tone={(requestSummary?.openRequests ?? 0) > 0 ? 'warn' : 'neutral'}
                />
                <StatusRow
                  icon={<Recycle className="h-4 w-4" />}
                  label="Recyclables"
                  value={`${pendingRecyclables} awaiting`}
                  tone={pendingRecyclables > 0 ? 'warn' : 'good'}
                />
                <StatusRow
                  icon={<Truck className="h-4 w-4" />}
                  label="Latest"
                  value={latestCollection ? formatDayTime(latestCollection.scheduledDate) : 'No Record'}
                  tone="neutral"
                />
              </>
            )}
          </div>
        </Surface>

        {/* Workload distribution */}
        <Surface
          className="stagger-enter"
          title="Current Workload"
          subtitle="Active items by category"
        >
          {workloadRingData.length === 0 ? (
            <StatePanel 
              title="No open workload" 
              description="New collections, requests, and recyclable actions will appear here." 
            />
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
                      cornerRadius={6}
                      stroke="#ffffff"
                      strokeWidth={2}
                      animationDuration={1100}
                    />
                    <Tooltip
                      contentStyle={{ 
                        borderRadius: 16, 
                        border: '1px solid #e2e8f0', 
                        boxShadow: '0 18px 40px rgba(15,23,42,0.12)' 
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2.5">
                {workloadRingData.map((entry) => (
                  <div
                    key={entry.name}
                    className="group flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition-colors duration-200 hover:bg-slate-50"
                  >
                    <span className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-slate-700">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white"
                        style={{ backgroundColor: entry.fill }}
                      />
                      <span className="truncate">{entry.name}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-slate-950 tabular-nums">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Surface>

        {/* Quick actions */}
        <Surface className="stagger-enter" title="Quick Actions" subtitle="Common tasks">
          <div className="grid grid-cols-1 gap-2.5">
            {isResident ? (
              <>
                <QuickLink 
                  to="/app/schedule-collection" 
                  icon={<Calendar className="h-4 w-4" />} 
                  label="Schedule Collection" 
                />
                <QuickLink 
                  to="/app/recyclables" 
                  icon={<Recycle className="h-4 w-4" />} 
                  label="Log Items" 
                />
                <QuickLink 
                  to="/app/locations" 
                  icon={<MapPin className="h-4 w-4" />} 
                  label="Find Locations" 
                />
                <QuickLink 
                  to="/app/wallet" 
                  icon={<Wallet className="h-4 w-4" />} 
                  label="View Wallet" 
                />
              </>
            ) : (
              <>
                <QuickLink 
                  to="/app/operations" 
                  icon={<Truck className="h-4 w-4" />} 
                  label="Operations" 
                />
                <QuickLink 
                  to="/app/reports" 
                  icon={<AlertTriangle className="h-4 w-4" />} 
                  label="Complaints" 
                />
                <QuickLink 
                  to="/app/service-requests" 
                  icon={<Clock className="h-4 w-4" />} 
                  label="Requests" 
                />
              </>
            )}
          </div>
        </Surface>
      </div>
    </section>
  )
}

export default DashboardContent