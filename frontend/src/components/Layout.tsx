import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, History, Recycle, Wallet, FileText, LogOut, Menu, X, CalendarClock, ClipboardList, Activity, ChevronRight, User, Bell, MapPin, Truck, DollarSign, Receipt, TruckIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import BrandLogo from './BrandLogo'
import SecurityMonitor from './SecurityMonitor'
import { getWorkspaceLoginPath } from '../services/authSession'
import { billingApi } from '../services/api'
import { useQuery } from '@tanstack/react-query'
import { hasRole, BILLING_ADMIN_ROLES, FINANCE_ROLES } from '../routes/roles'
import { PATHS } from '../routes/paths'

const Layout: React.FC = () => {
  const { user, logout } = useAuth()
  const { notifications, unreadCount, markAllRead, clearAll, markRead, isConnected } = useSocket()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement | null>(null)

  const isResident = user?.role === 'resident'
  const showBillingAdmin = hasRole(user?.role, BILLING_ADMIN_ROLES)
  const showFinance = hasRole(user?.role, FINANCE_ROLES)

  const { data: myBills } = useQuery({
    queryKey: ['my-bills'],
    queryFn: billingApi.getMyBills,
    enabled: isResident,
    staleTime: 60_000,
  })
  const pendingBillCount =
    myBills?.filter((b) => b.status === 'pending' || b.status === 'overdue').length ?? 0

  const navigation = isResident
    ? [
        { name: 'Dashboard', href: '/app', icon: Home },
        { name: 'Pay Bills', href: '/app/bills', icon: Receipt, badge: pendingBillCount },
        { name: 'Collection History', href: '/app/waste-history', icon: History },
        { name: 'My Recyclables', href: '/app/recyclables', icon: Recycle },
        { name: 'Wallet', href: '/app/wallet', icon: Wallet },
        { name: 'Complaints', href: '/app/reports', icon: FileText },
        { name: 'Nearby Points', href: '/app/locations', icon: MapPin },
        { name: 'Schedules', href: '/app/schedules', icon: CalendarClock },
        { name: 'Service schedules', href: '/app/service-schedules', icon: CalendarClock },
        { name: 'Request Collection', href: '/app/collection-requests', icon: Truck },
        { name: 'My Requests', href: '/app/service-requests', icon: ClipboardList },
        { name: 'Edit Profile', href: '/app/profile', icon: User },
      ]
    : [
        { name: 'Dashboard', href: PATHS.app, icon: Home },
        { name: 'Operations', href: PATHS.appOperations, icon: Activity },
        { name: 'Fleet Management', href: PATHS.appFleet, icon: TruckIcon },
        ...(showBillingAdmin
          ? [{ name: 'Bill Payments', href: PATHS.appBillingAdmin, icon: Receipt }]
          : []),
        ...(showFinance
          ? [{ name: 'Finance', href: PATHS.appFinance, icon: DollarSign }]
          : []),
        { name: 'Collections', href: '/app/waste-history', icon: History },
        { name: 'Complaints', href: '/app/reports', icon: FileText },
        { name: 'Resident Requests', href: '/app/service-requests', icon: ClipboardList },
        { name: 'Route Schedules', href: '/app/schedules', icon: CalendarClock },
        { name: 'Service Schedules', href: '/app/service-schedules', icon: CalendarClock },
        { name: 'Collection Requests', href: '/app/collection-requests-queue', icon: Truck },
        { name: 'Locations', href: '/app/locations', icon: MapPin },
        { name: 'Recycling Oversight', href: '/app/recyclables', icon: Recycle },
        { name: 'Withdrawal Approvals', href: '/app/withdrawal-approvals', icon: DollarSign },
        { name: 'Edit Profile', href: '/app/profile', icon: User },
      ]

  const isActive = (path: string) => {
    if (path === PATHS.app) {
      return location.pathname === PATHS.app
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const currentSection = useMemo(() => {
    return navigation.find((item) => isActive(item.href))?.name || 'Workspace'
  }, [location.pathname])

  const currentIcon = useMemo(() => {
    return navigation.find((item) => isActive(item.href))?.icon || Home
  }, [location.pathname])
  const hasNotifications = notifications.length > 0

  const navigationSections = useMemo(() => {
    const essentials = navigation.filter((item) =>
      ['Dashboard', 'Pay Bills', 'Collection History', 'Schedules', 'Service Schedules', 'Nearby Points', 'Request Collection'].includes(item.name),
    )
    const residentServices = navigation.filter((item) =>
      ['Complaints', 'My Requests', 'My Recyclables', 'Wallet'].includes(item.name),
    )
    const operations = navigation.filter((item) =>
      ['Operations', 'Fleet Management', 'Bill Payments', 'Finance', 'Collections', 'Resident Requests', 'Route Schedules', 'Service Schedules', 'Collection Requests', 'Locations', 'Recycling Oversight', 'Withdrawal Approvals'].includes(item.name),
    )
    const adminQueues = navigation.filter((item) => ['Complaints'].includes(item.name) && !isResident)
    const account = navigation.filter((item) => ['Edit Profile'].includes(item.name))

    return isResident
      ? [
          { title: 'Resident tools', items: essentials },
          { title: 'My services', items: residentServices },
          { title: 'Account', items: account },
        ]
      : [
          { title: 'Admin command', items: operations },
          { title: 'Queues', items: adminQueues },
          { title: 'Account', items: account },
        ]
  }, [isResident, navigation])

  useEffect(() => {
    setIsNotificationsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isNotificationsOpen) return

    const handlePointerDown = (event: MouseEvent | PointerEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (!notificationsRef.current?.contains(target)) {
        setIsNotificationsOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [isNotificationsOpen])

  const handleLogout = async () => {
    const loginPath = getWorkspaceLoginPath(isResident ? 'resident' : 'admin')
    await logout()
    navigate(loginPath, { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="fixed left-3 top-3 z-50 lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="rounded-lg border border-white/15 bg-slate-900/85 p-2.5 text-white shadow-lg shadow-black/20 backdrop-blur-sm transition-colors hover:bg-slate-800"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
        </button>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-40 w-[min(82vw,260px)] border-r border-white/10 bg-[linear-gradient(180deg,#1c2b1f_0%,#122019_46%,#0c1610_100%)] shadow-[0_0_48px_rgba(6,12,8,0.35)] transform transition-transform duration-300 ease-smooth-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Ambient glow + grid texture */}
        <div
          className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(180deg,black,transparent_78%)]"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(300px 200px at 15% -5%, rgba(109,143,98,0.28), transparent 62%), radial-gradient(260px 220px at 110% 45%, rgba(61,90,54,0.22), transparent 60%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] [mask-image:linear-gradient(180deg,black_6%,transparent_70%)]"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />

        <div className="relative flex flex-col h-full">
          <div className="border-b border-white/[0.08] px-4 py-4">
            <BrandLogo
              to="/app"
              variant="dark"
              className="w-full"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-2.5 shadow-inner shadow-black/10 backdrop-blur-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-primary-700 text-xs font-bold text-white shadow-md shadow-primary-900/40">
                {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium capitalize text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                  {user?.role?.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-sidebar">
            {navigationSections.map((section, sectionIndex) => (
              <div key={section.title} className={sectionIndex > 0 ? 'mt-5 pt-4 border-t border-white/[0.07]' : ''}>
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 ${
                          active
                            ? 'bg-gradient-to-r from-primary-500/[0.22] to-primary-500/[0.06] text-white ring-1 ring-inset ring-primary-400/25 shadow-[0_0_18px_rgba(61,90,54,0.28)]'
                            : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary-300 to-primary-500 shadow-[0_0_8px_rgba(158,181,146,0.8)]" />
                        )}
                        <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-primary-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
                        <span className="min-w-0 flex-1 truncate">{item.name}</span>
                        {'badge' in item && typeof item.badge === 'number' && item.badge > 0 ? (
                          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm shadow-rose-500/50">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-white/[0.08] px-3 py-3">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-300"
            >
              <LogOut className="h-4 w-4 text-slate-500 group-hover:text-rose-400" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        <main className="px-4 pb-8 pt-16 sm:px-6 lg:px-8 lg:pt-6">
          <div className="mx-auto w-full max-w-[1280px] @container">
            <div className="sticky top-3 z-30 mb-5 rounded-lg border border-slate-200/80 bg-white/80 px-5 py-3.5 shadow-sm backdrop-blur-md sm:relative sm:top-auto sm:-mx-6 sm:rounded-none sm:border-x-0 sm:border-t-0 sm:border-b sm:bg-white/70 sm:px-6 sm:py-3 sm:shadow-none lg:-mx-8 lg:px-8">
              <div className="flex items-center justify-between gap-3">
                <div className="ml-12 flex min-w-0 items-center gap-3 lg:ml-0">
                  <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-700 shadow-sm sm:flex">
                    {React.createElement(currentIcon, { className: 'h-5 w-5' })}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-slate-900">{currentSection}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 sm:flex">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate max-w-[160px] font-medium">{user?.street || 'N/A'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-medium">{user?.ward || 'N/A'}</span>
                  </div>

                  <div
                    className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold md:flex ${
                      isConnected
                        ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-slate-100 text-slate-500'
                    }`}
                    title={isConnected ? 'Live updates connected' : 'Live updates unavailable'}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'animate-pulse bg-emerald-500' : 'bg-slate-400'}`} />
                    {isConnected ? 'Live' : 'Offline'}
                  </div>

                  <div ref={notificationsRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsNotificationsOpen((prev) => !prev)}
                      className={`relative inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-all ${
                        isConnected 
                          ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50' 
                          : 'border-slate-200 bg-slate-50 text-slate-500'
                      }`}
                      aria-label="Open updates"
                    >
                      <Bell className={`h-4 w-4 ${isConnected ? 'text-slate-600' : 'text-slate-400'}`} />
                      <span className="hidden sm:inline">Notifications</span>
                      {unreadCount > 0 ? (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-600 px-1.5 text-[10px] font-bold text-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      ) : null}
                    </button>

                    {isNotificationsOpen ? (
                      <div className="fixed inset-x-4 top-20 z-[9999] max-h-[70vh] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[380px]">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">Updates</p>
                            <p className="text-xs text-slate-500">{unreadCount} unread</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={markAllRead}
                              disabled={unreadCount === 0}
                            >
                              Mark read
                            </button>
                            <button
                              type="button"
                              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={clearAll}
                              disabled={!hasNotifications}
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <div className="max-h-[calc(70vh-58px)] divide-y divide-slate-100 overflow-y-auto">
                          {hasNotifications ? (
                            notifications.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                className="grid w-full grid-cols-[auto_1fr] gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                                onClick={() => markRead(item.id)}
                              >
                                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.read ? 'bg-slate-300' : 'bg-primary-600'}`} />
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-semibold text-slate-950">{item.title}</span>
                                  <span className="mt-1 block break-words text-xs leading-5 text-slate-600">{item.message}</span>
                                  <span className="mt-1.5 block text-[11px] font-medium text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-3">
                                <Bell className="h-8 w-8 text-slate-400" />
                              </div>
                              <p className="text-sm font-semibold text-slate-900 mb-1">No updates yet</p>
                              <p className="text-xs text-slate-500 max-w-[240px]">
                                You'll see real-time notifications here when there are updates to your collections, payments, or requests.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div key={location.pathname} className="page-enter">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Security Monitor - only shows in development or when explicitly enabled */}
      <SecurityMonitor 
        showSessionInfo={process.env.NODE_ENV === 'development' || localStorage.getItem('arms_show_security_info') === 'true'} 
        enableWarnings={true} 
      />
    </div>
  )
}

export default Layout
