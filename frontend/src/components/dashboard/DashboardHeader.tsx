/**
 * Dashboard Header Component
 * Provides consistent header with user context and key actions
 */
import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardList, AlertCircle, RouteIcon, Receipt, MapPin } from 'lucide-react'
import { User } from '../../types'
import Button from '../Button'
import PayBillButton from '../billing/PayBillButton'
import { getResidentDashboardGreeting } from '../../utils/greeting'
import { Bill } from '../../types'

interface DashboardHeaderProps {
  user: User
  isResident: boolean
  nextBill?: Bill | null
  payableBillsCount: number
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  isResident,
  nextBill,
  payableBillsCount,
}) => {
  return (
    <section className="panel-shell rounded-xl relative overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[1.45fr_0.55fr]">
        {/* Main content */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-primary-700">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{user?.street || user?.address || 'Address pending'}</span>
            </span>
          </div>

          <div className="max-w-3xl">
            <p className="caption text-slate-500 mb-2">
              {isResident ? 'Your dashboard' : 'Staff dashboard'}
            </p>
            <h1 className="heading-1 mb-3">
              {isResident ? getResidentDashboardGreeting(user) : 'Operations summary'}
            </h1>
            <p className="body text-slate-600 max-w-2xl">
              {isResident
                ? 'Track refuse collection, household requests, complaints, wallet activity, and recycling from one place.'
                : 'Monitor refuse routes, resident complaints, service requests, truck readiness, and payout activity from one view.'}
            </p>
          </div>

          {/* Primary Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            {isResident ? (
              <>
                <Link to="/app/service-requests">
                  <Button 
                    size="lg" 
                    className="inline-flex items-center gap-2 shadow-lg shadow-primary-600/15"
                  >
                    <ClipboardList className="h-4 w-4" />
                    New refuse request
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                
                <Link to="/app/reports">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="inline-flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Report issue
                  </Button>
                </Link>

                <Link to="/app/schedules">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="inline-flex items-center gap-2"
                  >
                    <RouteIcon className="h-4 w-4" />
                    View schedule
                  </Button>
                </Link>

                {nextBill && (
                  <PayBillButton bill={nextBill} size="lg" showAmount />
                )}

                {payableBillsCount > 0 && (
                  <Link to="/app/bills">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="inline-flex items-center gap-2"
                    >
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
                  <Button 
                    size="lg" 
                    className="inline-flex items-center gap-2 shadow-lg shadow-primary-600/15"
                  >
                    <RouteIcon className="h-4 w-4" />
                    Open operations
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                
                <Link to="/app/reports">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="inline-flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Review complaints
                  </Button>
                </Link>

                <Link to="/app/service-requests">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="inline-flex items-center gap-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Manage requests
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Side panel with urgent info */}
        <div className="relative z-10 border-t border-slate-200/80 bg-[linear-gradient(180deg,#1f2e1d_0%,#2a3d28_100%)] p-4 text-white sm:p-5 lg:border-l lg:border-t-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-4">
            Next action
          </p>
          
          {isResident && nextBill ? (
            <div className={`rounded-xl border p-4 mb-5 ${
              nextBill.status === 'overdue'
                ? 'border-red-400/50 bg-red-500/15'
                : 'border-amber-400/40 bg-amber-500/10'
            }`}>
              <p className="text-xs text-amber-200/90 mb-1">
                {nextBill.status === 'overdue' ? 'Overdue refuse bill' : 'Refuse bill due'}
              </p>
              <p className="text-xl font-semibold mb-1">
                {/* Format currency here */}
              </p>
              <p className="text-sm text-slate-300">
                {nextBill.status === 'overdue' ? 'Expired' : 'Due'} {/* Format date */}
              </p>
              <div className="mt-4">
                <PayBillButton bill={nextBill} size="md" showAmount fullWidth />
              </div>
            </div>
          ) : null}

          {/* Quick stats in the side panel */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
              <p className="text-xs text-slate-400">Open requests</p>
              <p className="mt-1 text-2xl font-semibold">-</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
              <p className="text-xs text-slate-400">Pending items</p>
              <p className="mt-1 text-2xl font-semibold">-</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DashboardHeader