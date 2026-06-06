/**
 * Dashboard Content Component
 * Main content area with timeline, activity, and status panels
 */
import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Truck, Recycle, Clock, Calendar, MapPin, Wallet } from 'lucide-react'
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
    good: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    warn: 'text-amber-600 bg-amber-50 border-amber-100', 
    neutral: 'text-slate-600 bg-slate-50 border-slate-100',
  }

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg border ${toneStyles[tone]}`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-950">{value}</span>
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
    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-white hover:border-primary-200 hover:text-slate-900 hover:-translate-y-0.5 hover:shadow-sm"
  >
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
      {icon}
    </div>
    <span className="flex-1">{label}</span>
    <ArrowRight className="h-4 w-4 text-slate-400" />
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
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.65fr]">
      {/* Main timeline */}
      <Surface
        title="Collection timeline"
        subtitle={
          isResident 
            ? 'Recent and upcoming service activity for this account.' 
            : 'Recent and upcoming refuse collection activity across resident routes.'
        }
        action={
          <Link 
            to="/app/waste-history" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800"
          >
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

      {/* Side panels */}
      <div className="space-y-5">
        {/* Activity chart */}
        <Surface
          title={isResident ? 'Recent account activity' : 'Recent operations activity'}
          subtitle="Collection and recycling activity for the last six days."
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
                  cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="activity" 
                  stroke="#3d5a36" 
                  strokeWidth={2} 
                  fill="url(#residentPulse)" 
                  animationDuration={1000} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Surface>

        {/* Service status */}
        <Surface 
          title="Service status" 
          subtitle={isResident ? "Your account activity summary." : "What needs attention now."}
        >
          <div className="space-y-1">
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
                  tone={(requestSummary?.openRequests ?? 0) > 0 ? 'warn' : 'neutral'}
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

        {/* Workload distribution */}
        <Surface
          title="Current workload mix"
          subtitle={
            isResident 
              ? 'A compact view of the queues currently attached to your account.' 
              : 'A compact view of active queues across resident operations.'
          }
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
                      strokeWidth={0}
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
              <div className="space-y-3">
                {workloadRingData.map((entry) => (
                  <div 
                    key={entry.name} 
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3"
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                      <span 
                        className="h-2.5 w-2.5 rounded-full" 
                        style={{ backgroundColor: entry.fill }} 
                      />
                      {entry.name}
                    </span>
                    <span className="text-sm font-semibold text-slate-950">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Surface>

        {/* Quick actions */}
        <Surface title="Quick actions" subtitle="Common tasks for this account.">
          <div className="grid grid-cols-1 gap-2">
            {isResident ? (
              <>
                <QuickLink 
                  to="/app/schedule-collection" 
                  icon={<Calendar className="h-4 w-4" />} 
                  label="Schedule refuse collection" 
                />
                <QuickLink 
                  to="/app/recyclables" 
                  icon={<Recycle className="h-4 w-4" />} 
                  label="Log recyclables" 
                />
                <QuickLink 
                  to="/app/locations" 
                  icon={<MapPin className="h-4 w-4" />} 
                  label="Find nearby refuse points" 
                />
                <QuickLink 
                  to="/app/wallet" 
                  icon={<Wallet className="h-4 w-4" />} 
                  label="Review wallet" 
                />
              </>
            ) : (
              <>
                <QuickLink 
                  to="/app/operations" 
                  icon={<Truck className="h-4 w-4" />} 
                  label="Open refuse operations" 
                />
                <QuickLink 
                  to="/app/reports" 
                  icon={<ArrowRight className="h-4 w-4" />} 
                  label="Review complaints" 
                />
                <QuickLink 
                  to="/app/service-requests" 
                  icon={<Clock className="h-4 w-4" />} 
                  label="Manage resident requests" 
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