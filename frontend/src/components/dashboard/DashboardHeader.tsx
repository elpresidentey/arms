/**
 * Dashboard Header Component
 * Clean header with essential user context and key actions
 */
import React from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, AlertCircle, RouteIcon, Receipt, MapPin } from 'lucide-react'
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
      <div className="grid gap-0 lg:grid-cols-[1.6fr_0.4fr]">
        {/* Main content */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{user?.street || 'Address pending'}</span>
            </span>
          </div>

          <div className="max-w-3xl mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-950 mb-2">
              {isResident ? getResidentDashboardGreeting(user) : 'Operations'}
            </h1>
            <p className="text-slate-600 text-sm">
              {isResident ? 'Manage your services' : 'Monitor operations'}
            </p>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-wrap gap-3">
            {isResident ? (
              <>
                <Link to="/app/service-requests">
                  <Button 
                    size="lg" 
                    className="inline-flex items-center gap-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    New Request
                  </Button>
                </Link>
                
                <Link to="/app/reports">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="inline-flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Report Issue
                  </Button>
                </Link>

                <Link to="/app/schedules">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="inline-flex items-center gap-2"
                  >
                    <RouteIcon className="h-4 w-4" />
                    Schedule
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
                      Bills ({payableBillsCount})
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/app/operations">
                  <Button 
                    size="lg" 
                    className="inline-flex items-center gap-2"
                  >
                    <RouteIcon className="h-4 w-4" />
                    Operations
                  </Button>
                </Link>
                
                <Link to="/app/reports">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="inline-flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Complaints
                  </Button>
                </Link>

                <Link to="/app/service-requests">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="inline-flex items-center gap-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Requests
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Minimal side panel */}
        <div className="relative z-10 border-t border-slate-200/80 bg-gradient-to-b from-slate-50 to-slate-100 p-4 lg:border-l lg:border-t-0">
          {isResident && nextBill ? (
            <div className={`rounded-lg p-3 ${
              nextBill.status === 'overdue'
                ? 'bg-red-50 border border-red-200'
                : 'bg-amber-50 border border-amber-200'
            }`}>
              <p className="text-xs font-medium text-slate-600 mb-1">
                {nextBill.status === 'overdue' ? 'Overdue' : 'Due Soon'}
              </p>
              <p className="text-lg font-bold text-slate-900 mb-2">
                {/* Format currency here */}
              </p>
              <PayBillButton bill={nextBill} size="sm" fullWidth />
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                ✓
              </div>
              <p className="text-xs text-slate-600">All caught up</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default DashboardHeader