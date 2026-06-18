import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, History, Recycle, Wallet, FileText, LogOut, Menu, X, CalendarClock, ClipboardList, Activity, ChevronRight, User, Bell, MapPin, Truck, DollarSign, Receipt, TruckIcon } from 'lucide-react'
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
          className="rounded-lg border border-slate-300 bg-white p-2.5 shadow-sm transition-colors hover:bg-slate-50"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
        </button>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-40 w-[min(82vw,260px)] border-r border-slate-200 bg-white shadow-sm transform transition-transform duration-300 ease-smooth-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="border-b border-slate-200 px-4 py-4">
            <BrandLogo
              to="/app"
              variant="light"
              className="w-full"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs capitalize text-slate-600 mt-0.5">{user?.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin">
            {navigationSections.map((section, sectionIndex) => (
              <div key={section.title} className={sectionIndex > 0 ? 'mt-5 pt-4 border-t border-slate-200' : ''}>
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
                        className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 ${
                          active
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="min-w-0 flex-1 truncate">{item.name}</span>
                        {'badge' in item && typeof item.badge === 'number' && item.badge > 0 ? (
                          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
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

          <div className="border-t border-slate-200 px-3 py-3">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        <main className="px-4 pb-8 pt-16 sm:px-6 lg:px-8 lg:pt-6">
          <div className="mx-auto w-full max-w-[1280px]">
            <div className="sticky top-3 z-30 mb-5 rounded-lg border border-slate-200 bg-white shadow-sm px-5 py-3.5 sm:relative sm:top-auto">
              <div className="flex items-center justify-between gap-3">
                <div className="ml-12 flex min-w-0 items-center gap-3 lg:ml-0">
                  <div className="hidden h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 sm:flex">
                    {React.createElement(currentIcon, { className: 'h-5 w-5' })}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-slate-900">{currentSection}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 sm:flex">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate max-w-[160px] font-medium">{user?.street || 'N/A'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-medium">{user?.ward || 'N/A'}</span>
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
    </div>
  )
}

export default Layout
