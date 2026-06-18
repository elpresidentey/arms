/**
 * Dashboard Header Component
 * Modern header with glassmorphism and smooth animations
 */
import React from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, AlertCircle, RouteIcon, Receipt, MapPin, Sparkles, TrendingUp } from 'lucide-react'
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
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-8 shadow-2xl">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
      
      {/* Floating orbs */}
      <div className="absolute top-10 right-20 h-32 w-32 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 left-20 h-40 w-40 rounded-full bg-primary-300/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.6fr_0.4fr]">
        {/* Main content */}
        <div>
          {/* Location badge with animation */}
          <div className="mb-6 inline-flex animate-fade-in-down">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2 text-xs font-semibold text-white shadow-lg">
              <MapPin className="h-3.5 w-3.5 animate-pulse" />
              <span className="truncate">{user?.street || 'Address pending'}</span>
            </span>
          </div>

          {/* Greeting section */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
                {isResident ? getResidentDashboardGreeting(user) : 'Operations Dashboard'}
              </h1>
              <Sparkles className="h-6 w-6 text-amber-300 animate-pulse" />
            </div>
            <p className="text-primary-50 text-base flex items-center gap-2">
              {isResident ? (
                <>
                  <TrendingUp className="h-4 w-4" />
                  Your waste management at a glance
                </>
              ) : (
                'Monitor and control all operations'
              )}
            </p>
          </div>

          {/* Action buttons with stagger animation */}
          <div className="flex flex-wrap gap-3">
            {isResident ? (
              <>
                <Link to="/app/service-requests" className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <button className="group relative overflow-hidden rounded-xl bg-white px-6 py-3 font-semibold text-primary-700 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-primary-100 opacity-0 transition-opacity group-hover:opacity-100"></div>
                    <span className="relative flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      New Request
                    </span>
                  </button>
                </Link>
                
                <Link to="/app/reports" className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <button className="group relative overflow-hidden rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3 font-semibold text-white shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95">
                    <span className="relative flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Report Issue
                    </span>
                  </button>
                </Link>

                <Link to="/app/schedules" className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <button className="group relative overflow-hidden rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3 font-semibold text-white shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95">
                    <span className="relative flex items-center gap-2">
                      <RouteIcon className="h-5 w-5" />
                      Schedule
                    </span>
                  </button>
                </Link>

                {nextBill && (
                  <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <PayBillButton bill={nextBill} size="lg" showAmount />
                  </div>
                )}

                {payableBillsCount > 0 && (
                  <Link to="/app/bills" className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <button className="group relative overflow-hidden rounded-xl border-2 border-amber-300/50 bg-amber-400/20 backdrop-blur-sm px-6 py-3 font-semibold text-white shadow-xl transition-all duration-300 hover:bg-amber-400/30 hover:scale-105 active:scale-95">
                      <span className="relative flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Bills ({payableBillsCount})
                      </span>
                    </button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/app/operations" className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <button className="group relative overflow-hidden rounded-xl bg-white px-6 py-3 font-semibold text-primary-700 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-primary-100 opacity-0 transition-opacity group-hover:opacity-100"></div>
                    <span className="relative flex items-center gap-2">
                      <RouteIcon className="h-5 w-5" />
                      Operations
                    </span>
                  </button>
                </Link>
                
                <Link to="/app/reports" className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <button className="group relative overflow-hidden rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3 font-semibold text-white shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95">
                    <span className="relative flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Complaints
                    </span>
                  </button>
                </Link>

                <Link to="/app/service-requests" className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <button className="group relative overflow-hidden rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3 font-semibold text-white shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95">
                    <span className="relative flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      Requests
                    </span>
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Side panel with glassmorphism */}
        <div className="relative z-10">
          {isResident && nextBill ? (
            <div className={`rounded-2xl backdrop-blur-md p-6 shadow-2xl border-2 animate-fade-in ${
              nextBill.status === 'overdue'
                ? 'bg-red-500/20 border-red-300/50'
                : 'bg-amber-500/20 border-amber-300/50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`h-2 w-2 rounded-full animate-pulse ${
                  nextBill.status === 'overdue' ? 'bg-red-300' : 'bg-amber-300'
                }`}></div>
                <p className="text-xs font-semibold text-white uppercase tracking-wide">
                  {nextBill.status === 'overdue' ? 'Overdue Payment' : 'Due Soon'}
                </p>
              </div>
              <p className="text-2xl font-bold text-white mb-4">
                {/* Format currency here */}
              </p>
              <PayBillButton bill={nextBill} size="sm" fullWidth />
            </div>
          ) : (
            <div className="rounded-2xl backdrop-blur-md bg-white/10 border-2 border-white/20 p-6 text-center shadow-2xl animate-fade-in">
              <div className="w-16 h-16 bg-emerald-400/30 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
                <svg className="w-8 h-8 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">All Caught Up!</p>
              <p className="text-xs text-primary-100 mt-1">No pending actions</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default DashboardHeader