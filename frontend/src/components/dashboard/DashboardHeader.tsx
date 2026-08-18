/**
 * Dashboard Header — clean service snapshot with next-action panel
 */
import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ClipboardList,
  AlertCircle,
  RouteIcon,
  Receipt,
  MapPin,
  Radio,
  CalendarClock,
} from 'lucide-react'
import { User, Bill, WasteCollection } from '../../types'
import Button from '../Button'
import PayBillButton from '../billing/PayBillButton'
import { getResidentDashboardGreeting } from '../../utils/greeting'
import { formatCurrency, formatShortDate } from '../../utils/format'
import { CHART_COLORS } from '../../utils/chartColors'

interface DashboardHeaderProps {
  user: User
  isResident: boolean
  nextBill?: Bill | null
  payableBillsCount: number
  nextCollection?: WasteCollection | null
  openRequests?: number
  pendingItems?: number
  serviceRhythm?: number
  completedThisMonth?: number
  isConnected?: boolean
}

const SnapshotStat: React.FC<{
  label: string
  value: string | number
  detail: string
  accent?: string
}> = ({ label, value, detail, accent = CHART_COLORS.primary }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-md">
    <span
      className="absolute inset-x-0 top-0 h-[3px] opacity-70 transition-opacity duration-200 group-hover:opacity-100"
      style={{ background: `linear-gradient(90deg, ${accent}, transparent 85%)` }}
      aria-hidden="true"
    />
    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
      {label}
    </p>
    <p className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-950 tabular-nums">
      {value}
    </p>
    <p className="mt-1 text-xs text-slate-500">{detail}</p>
  </div>
)

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  isResident,
  nextBill,
  payableBillsCount,
  nextCollection,
  openRequests = 0,
  pendingItems = 0,
  serviceRhythm = 0,
  completedThisMonth = 0,
  isConnected = false,
}) => {
  const firstName = user?.firstName?.trim()
  const snapshotTitle = isResident
    ? firstName
      ? `${firstName}'s service snapshot`
      : 'Your service snapshot'
    : 'Operations overview'

  const daysUntil = (target?: string | null) => {
    if (!target) return null
    const targetDate = new Date(target)
    if (isNaN(targetDate.getTime())) return null
    const diff = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return null
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Tomorrow'
    return `${diff} days`
  }

  const countdown = isResident
    ? daysUntil(nextCollection?.scheduledDate)
    : null

  const nextActionPrimary = isResident
    ? nextCollection
      ? {
          title: formatShortDate(nextCollection.scheduledDate),
          detail: `Scheduled collection for ${nextCollection.street || user?.street || 'your address'}.`,
        }
      : nextBill
        ? {
            title: formatCurrency(nextBill.totalAmount),
            detail:
              nextBill.status === 'overdue'
                ? 'Overdue refuse bill — settle to keep service active.'
                : `Refuse bill due ${formatShortDate(nextBill.dueDate)}.`,
          }
        : {
            title: 'All clear',
            detail: 'No upcoming collection or bill action right now.',
          }
    : {
        title: `${openRequests}`,
        detail:
          openRequests > 0
            ? 'Open resident requests waiting for attention.'
            : 'No open resident requests in the queue.',
      }

  return (
    <section className="panel-shell relative overflow-hidden rounded-2xl">
      {/* Soft grid texture on main pane */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45] [mask-image:linear-gradient(120deg,black_40%,transparent_88%)]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative grid gap-0 @4xl:grid-cols-[1.55fr_0.45fr]">
        {/* Main content */}
        <div className="p-5 sm:p-6 lg:p-7">
          <div className="mb-5 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary-800">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{user?.street || user?.address || 'Address pending'}</span>
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                isConnected
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}
            >
              <Radio className={`h-3 w-3 ${isConnected ? 'text-emerald-600' : 'text-slate-400'}`} />
              {isConnected ? 'Live updates on' : 'Live updates off'}
            </span>
            {countdown && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600">
                <CalendarClock className="h-3 w-3 text-slate-400" />
                {countdown}
              </span>
            )}
          </div>

          <div className="max-w-2xl">
            <p className="caption text-slate-400">
              {isResident ? 'Resident dashboard' : 'Staff dashboard'}
            </p>
            <h1 className="heading-1 mt-2 text-balance">
              {isResident ? snapshotTitle : 'Operations overview'}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {isResident
                ? `${getResidentDashboardGreeting(user)} — here's your service at a glance`
                : getResidentDashboardGreeting(user)}
            </p>
            <p className="body mt-2.5 max-w-xl text-slate-600">
              {isResident
                ? 'Track refuse collection status, household requests, complaint updates, wallet activity, and recycling value from one account.'
                : 'Monitor refuse routes, resident complaints, service requests, truck readiness, and payout activity from one command view.'}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {isResident ? (
              <>
                <Link to="/app/service-requests">
                  <Button size="lg" className="shadow-md shadow-primary-600/15" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    <ClipboardList className="h-4 w-4" />
                    New refuse request
                  </Button>
                </Link>
                <Link to="/app/reports">
                  <Button size="lg" variant="outline">
                    <AlertCircle className="h-4 w-4" />
                    Report refuse issue
                  </Button>
                </Link>
                <Link to="/app/schedules">
                  <Button size="lg" variant="outline">
                    <RouteIcon className="h-4 w-4" />
                    View refuse schedule
                  </Button>
                </Link>
                {nextBill && <PayBillButton bill={nextBill} size="lg" showAmount />}
                {payableBillsCount > 1 && (
                  <Link to="/app/bills">
                    <Button size="lg" variant="outline">
                      <Receipt className="h-4 w-4" />
                      All bills ({payableBillsCount})
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/app/operations">
                  <Button size="lg" className="shadow-md shadow-primary-600/15" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    <RouteIcon className="h-4 w-4" />
                    Open operations
                  </Button>
                </Link>
                <Link to="/app/reports">
                  <Button size="lg" variant="outline">
                    <AlertCircle className="h-4 w-4" />
                    Review complaints
                  </Button>
                </Link>
                <Link to="/app/service-requests">
                  <Button size="lg" variant="outline">
                    <ClipboardList className="h-4 w-4" />
                    Manage requests
                  </Button>
                </Link>
              </>
            )}
          </div>

          {isResident && (
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <SnapshotStat
                label="Service rhythm"
                value={serviceRhythm}
                detail="Scheduled or active stops"
                accent="#4a6b41"
              />
              <SnapshotStat
                label="Completed this month"
                value={completedThisMonth}
                detail="Verified stop records"
                accent="#059669"
              />
              <SnapshotStat
                label="Open requests"
                value={openRequests}
                detail="Items waiting for response"
                accent={CHART_COLORS.warning}
              />
            </div>
          )}
        </div>

        {/* Next action side panel */}
        <aside className="relative border-t border-slate-200/70 bg-[linear-gradient(165deg,#0f1a12_0%,#1f2e1d_48%,#243528_100%)] p-5 text-white sm:p-6 @4xl:border-l @4xl:border-t-0">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(420px 180px at 80% 0%, rgba(109,143,98,0.28), transparent 60%)',
            }}
          />
          <div className="relative z-10 flex h-full flex-col">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Next action
            </p>
            <p className="mt-3 font-display text-3xl font-bold tracking-tight text-white">
              {nextActionPrimary.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {nextActionPrimary.detail}
            </p>

            {isResident && nextBill && !nextCollection && (
              <div className="mt-5">
                <PayBillButton bill={nextBill} size="md" showAmount fullWidth />
              </div>
            )}

            <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
              {isResident ? (
                <>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 backdrop-blur-sm">
                    <p className="text-[11px] text-slate-400">
                      Bills due
                    </p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
                      {payableBillsCount}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 backdrop-blur-sm">
                    <p className="text-[11px] text-slate-400">
                      Recycling queue
                    </p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
                      {pendingItems}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 backdrop-blur-sm">
                    <p className="text-[11px] text-slate-400">
                      Open requests
                    </p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
                      {openRequests}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 backdrop-blur-sm">
                    <p className="text-[11px] text-slate-400">
                      Pending items
                    </p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
                      {pendingItems}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default DashboardHeader
