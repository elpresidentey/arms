import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, History, Recycle, Wallet, FileText, LogOut, Menu, X, CalendarClock, ClipboardList, Activity, ChevronRight, User, Bell, MapPin, Truck, DollarSign, Receipt } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import BrandLogo from './BrandLogo'
import { getWorkspaceLoginPath } from '../services/authSession'
import { billingApi } from '../services/api'
import { useQuery } from '@tanstack/react-query'
import { hasRole, BILLING_ADMIN_ROLES, FINANCE_ROLES } from '../routes/roles'
import { PATHS } from '../routes/paths'

const Layout: React.FC = () => {
  const { user, logout } = useAuth()
  const { notifications, unreadCount, markAllRead, clearAll, markRead } = useSocket()
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
      ['Operations', 'Bill Payments', 'Finance', 'Collections', 'Resident Requests', 'Route Schedules', 'Service Schedules', 'Collection Requests', 'Locations', 'Recycling Oversight', 'Withdrawal Approvals'].includes(item.name),
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(61,90,54,0.07),_transparent_20%),radial-gradient(circle_at_top_right,_rgba(194,120,59,0.06),_transparent_22%),linear-gradient(180deg,#f8fafc_0%,#f4f6f2_52%,#eef1ec_100%)] text-slate-900">
      <div className="fixed left-3 top-3 z-50 lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-md transition-colors hover:bg-slate-50"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
        </button>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-40 w-[min(82vw,280px)] border-r border-white/10 bg-[linear-gradient(180deg,#10190f_0%,#172315_54%,#0f172a_100%)] shadow-2xl shadow-slate-950/20 backdrop-blur-xl transform transition-transform duration-300 ease-smooth-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="border-b border-white/10 px-5 py-5">
            <BrandLogo
              to="/app"
              variant="dark"
              className="w-full"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3 shadow-sm">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs capitalize text-slate-400">{user?.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
            {navigationSections.map((section, sectionIndex) => (
              <div key={section.title} className={sectionIndex > 0 ? 'mt-5 pt-5 border-t border-white/10' : ''}>
                <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all duration-200 ease-smooth-out ${
                          active
                            ? 'bg-white text-slate-950 shadow-lg shadow-slate-950/20'
                            : 'text-slate-300 hover:bg-white/[0.08] hover:text-white active:scale-[0.99]'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        {active && (
                          <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary-600" />
                        )}
                        <span className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                          active ? 'bg-primary-100 text-primary-700' : 'bg-white/[0.08] text-slate-400 group-hover:bg-white/[0.12] group-hover:text-white'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1 truncate">{item.name}</span>
                        {'badge' in item && typeof item.badge === 'number' && item.badge > 0 ? (
                          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            {item.badge}
                          </span>
                        ) : null}
                        {active && <ChevronRight className="h-4 w-4 text-primary-600" />}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-white/10 px-3 py-4">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-rose-500/10 hover:text-rose-100"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.08] text-slate-400 transition-colors group-hover:bg-rose-500/15 group-hover:text-rose-100">
                <LogOut className="h-4 w-4" />
              </span>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[280px]">
        <main className="px-3 pb-6 pt-14 sm:px-6 lg:px-8 lg:pt-7">
          <div className="mx-auto w-full max-w-[1280px]">
            <div className="panel-shell sticky top-2 z-30 mb-4 overflow-visible rounded-xl px-3 py-2.5 sm:relative sm:top-auto sm:mb-5 sm:px-5 sm:py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="ml-12 flex min-w-0 items-center gap-3 lg:ml-0">
                  <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700 sm:flex">
                    {React.createElement(currentIcon, { className: 'h-5 w-5' })}
                  </div>
                  <div className="min-w-0">
                    <p className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 sm:block">Workspace</p>
                    <p className="truncate font-display text-base font-semibold tracking-tight text-slate-900 sm:text-lg">{currentSection}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <div className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-white/76 px-3 py-1.5 text-sm text-slate-600 backdrop-blur-sm sm:flex">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="truncate max-w-[200px]">{user?.street || 'Street unavailable'}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500">{user?.ward || 'Ward unavailable'}</span>
                  </div>

                  <div ref={notificationsRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsNotificationsOpen((prev) => !prev)}
                      className="relative inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/85 px-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md"
                      aria-label="Open updates"
                    >
                      <Bell className="h-4 w-4 text-slate-500" />
                      <span className="hidden sm:inline">Updates</span>
                      {unreadCount > 0 ? (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-600 px-1.5 text-[10px] font-bold text-white">
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
    </div>
  )
}

export default Layout
