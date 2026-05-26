import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, History, Recycle, Wallet, FileText, LogOut, Menu, X, CalendarClock, ClipboardList, Activity, ChevronRight, User, Bell, MapPin, Truck, DollarSign, Receipt } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import Footer from './Footer'
import BrandLogo from './BrandLogo'
import { getWorkspaceLoginPath } from '../services/authSession'
import { billingApi } from '../services/api'
import { useQuery } from '@tanstack/react-query'
import { hasRole, BILLING_ADMIN_ROLES, FINANCE_ROLES } from '../routes/roles'
import { PATHS } from '../routes/paths'

const Layout: React.FC = () => {
  const { user, logout } = useAuth()
  const { isConnected, notifications, unreadCount, markAllRead, clearAll, markRead } = useSocket()
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
        { name: 'Pay bills', href: '/app/bills', icon: Receipt, badge: pendingBillCount },
        { name: 'Collection history', href: '/app/waste-history', icon: History },
        { name: 'My recyclables', href: '/app/recyclables', icon: Recycle },
        { name: 'Wallet', href: '/app/wallet', icon: Wallet },
        { name: 'Complaints', href: '/app/reports', icon: FileText },
        { name: 'Nearby points', href: '/app/locations', icon: MapPin },
        { name: 'Schedules', href: '/app/schedules', icon: CalendarClock },
        { name: 'Service schedules', href: '/app/service-schedules', icon: CalendarClock },
        { name: 'Request collection', href: '/app/collection-requests', icon: Truck },
        { name: 'My requests', href: '/app/service-requests', icon: ClipboardList },
        { name: 'Edit Profile', href: '/app/profile', icon: User },
      ]
    : [
        { name: 'Dashboard', href: PATHS.app, icon: Home },
        { name: 'Operations', href: PATHS.appOperations, icon: Activity },
        ...(showBillingAdmin
          ? [{ name: 'Bill payments', href: PATHS.appBillingAdmin, icon: Receipt }]
          : []),
        ...(showFinance
          ? [{ name: 'Finance', href: PATHS.appFinance, icon: DollarSign }]
          : []),
        { name: 'Collections', href: '/app/waste-history', icon: History },
        { name: 'Complaints', href: '/app/reports', icon: FileText },
        { name: 'Resident requests', href: '/app/service-requests', icon: ClipboardList },
        { name: 'Route schedules', href: '/app/schedules', icon: CalendarClock },
        { name: 'Service schedules', href: '/app/service-schedules', icon: CalendarClock },
        { name: 'Collection requests', href: '/app/collection-requests-queue', icon: Truck },
        { name: 'Locations', href: '/app/locations', icon: MapPin },
        { name: 'Recycling oversight', href: '/app/recyclables', icon: Recycle },
        { name: 'Withdrawal approvals', href: '/app/withdrawal-approvals', icon: DollarSign },
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

  const navigationSections = useMemo(() => {
    const essentials = navigation.filter((item) =>
      ['Dashboard', 'Pay bills', 'Collection history', 'Schedules', 'Service schedules', 'Nearby points', 'Request collection'].includes(item.name),
    )
    const residentServices = navigation.filter((item) =>
      ['Complaints', 'My requests', 'My recyclables', 'Wallet'].includes(item.name),
    )
    const operations = navigation.filter((item) =>
      ['Operations', 'Bill payments', 'Finance', 'Collections', 'Resident requests', 'Route schedules', 'Service schedules', 'Collection requests', 'Locations', 'Recycling oversight', 'Withdrawal approvals'].includes(item.name),
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
      <div className="lg:hidden fixed left-4 top-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="rounded-xl border border-slate-200 bg-white p-3 shadow-md transition-colors hover:bg-slate-50"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
        </button>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-40 w-[252px] border-r border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] shadow-soft backdrop-blur-xl transform transition-transform duration-300 ease-smooth-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70 px-4 py-4">
            <BrandLogo to="/app" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="mt-4 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                </div>
                <div className={`rounded-full px-2 py-0.5 text-[10px] font-semibold flex-shrink-0 ${
                  isConnected ? 'bg-primary-100 text-primary-800' : 'bg-amber-100 text-amber-700'
                }`}>
                  {isConnected ? 'Live' : 'Offline'}
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {navigationSections.map((section, sectionIndex) => (
              <div key={section.title} className={sectionIndex > 0 ? 'mt-5 pt-5 border-t border-slate-100' : ''}>
                <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                        className={`group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-200 ease-smooth-out ${
                          active
                            ? 'bg-primary-50/95 text-primary-800 shadow-sm'
                            : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm active:scale-[0.99]'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        {active && (
                          <span className="absolute inset-y-1 left-0 w-0.5 rounded-r-full bg-primary-600" />
                        )}
                        <span className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                          active ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex-1">{item.name}</span>
                        {'badge' in item && typeof item.badge === 'number' && item.badge > 0 ? (
                          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            {item.badge}
                          </span>
                        ) : null}
                        {active && <ChevronRight className="h-4 w-4 text-primary-500" />}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-slate-200/80 bg-slate-50/50 px-3 py-4">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-rose-50 hover:text-rose-700"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-rose-100 group-hover:text-rose-600">
                <LogOut className="h-4 w-4" />
              </span>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[252px]">
        <main className="px-4 pb-8 pt-16 sm:px-6 lg:px-8 lg:pt-7">
          <div className="mx-auto w-full max-w-[1280px]">
            <div className="panel-shell relative z-30 mb-5 overflow-visible rounded-xl px-4 py-3 sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700 sm:flex">
                    {React.createElement(currentIcon, { className: 'h-5 w-5' })}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
                    <p className="font-display text-base font-semibold tracking-tight text-slate-900 sm:text-lg">{currentSection}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/76 px-3 py-1.5 text-sm text-slate-600 backdrop-blur-sm">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="truncate max-w-[200px]">{user?.street || 'Street unavailable'}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500">{user?.ward || 'Ward unavailable'}</span>
                  </div>

                  <div ref={notificationsRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsNotificationsOpen((prev) => !prev)}
                      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md"
                      aria-label="Open notifications"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 ? (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-bold text-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      ) : null}
                    </button>

                    {isNotificationsOpen ? (
                      <div className="fixed right-4 top-20 z-[9999] w-[calc(100vw-2rem)] max-w-[420px] rounded-2xl border border-slate-200 bg-white shadow-2xl sm:absolute sm:right-0 sm:top-12 sm:w-[420px]">
                        <div className="border-b border-slate-100 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900">Notifications</p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="btn btn-secondary h-8 px-3 text-xs"
                                onClick={markAllRead}
                                disabled={notifications.length === 0}
                              >
                                Mark read
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary h-8 px-3 text-xs"
                                onClick={clearAll}
                                disabled={notifications.length === 0}
                              >
                                Clear
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="max-h-[420px] space-y-2 overflow-y-auto p-3">
                          {notifications.length === 0 ? (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center">
                              <Bell className="mx-auto h-8 w-8 text-slate-300" />
                              <p className="mt-2 text-sm font-medium text-slate-600">No notifications yet</p>
                              <p className="mt-1 text-xs text-slate-500">We'll notify you when something important happens</p>
                            </div>
                          ) : (
                            notifications.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                className={`w-full rounded-xl border px-3 py-3 text-left transition-colors hover:bg-slate-50 ${
                                  item.read ? 'border-slate-200 bg-white' : 'border-primary-200 bg-primary-50/40'
                                }`}
                                onClick={() => markRead(item.id)}
                              >
                                <p className="break-words text-sm font-semibold text-slate-900">{item.title}</p>
                                <p className="mt-1 whitespace-normal break-words text-sm leading-5 text-slate-600">{item.message}</p>
                                <p className="mt-2 text-[11px] font-medium text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                              </button>
                            ))
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
        <Footer />
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
