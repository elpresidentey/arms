import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Recycle, Wallet, FileText, Truck, ClipboardList, AlertCircle, Route as RouteIcon, Radio } from 'lucide-react'
import { walletApi } from '../services/api'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'
import StatePanel from './StatePanel'
import { formatCurrency } from '../utils/format'

const eventIcon = (event: string) => {
  switch (event) {
    case 'waste-collection-update':
      return <Truck className="w-4 h-4 text-primary-600" />
    case 'recyclable-update':
      return <Recycle className="w-4 h-4 text-emerald-600" />
    case 'wallet-update':
      return <Wallet className="w-4 h-4 text-primary-700" />
    case 'service-request-update':
      return <ClipboardList className="w-4 h-4 text-amber-600" />
    case 'report-update':
      return <AlertCircle className="w-4 h-4 text-rose-600" />
    case 'collection-route-update':
      return <RouteIcon className="w-4 h-4 text-violet-600" />
    default:
      return <FileText className="w-4 h-4 text-slate-600" />
  }
}

const RecentActivity: React.FC = () => {
  const { user } = useAuth()
  const { notifications, isConnected } = useSocket()
  const isResident = user?.role === 'resident'
  const { data: transactions, isLoading, isError } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: walletApi.getTransactions,
    enabled: isResident,
  })

  const liveNotifications = notifications.slice(0, 8)

  if (!isConnected && liveNotifications.length === 0 && isLoading) {
    return (
      <StatePanel
        tone="loading"
        title="Loading activity"
        description={isResident ? 'Pulling your latest wallet and recycling events.' : 'Pulling the latest operations events.'}
      />
    )
  }

  if (!isConnected && liveNotifications.length === 0 && isError) {
    return (
      <StatePanel
        tone="error"
        title="Couldn't load activity"
        description="Recent activity is temporarily unavailable."
      />
    )
  }

  if (liveNotifications.length === 0 && (!transactions || transactions.length === 0)) {
    return (
      <StatePanel
        title="No activity yet"
        description="Complete a service action to see live updates here."
      />
    )
  }

  return (
    <div className="space-y-3">
      {liveNotifications.length > 0 && (
        <div className="mb-2 flex items-center gap-2">
          <span className="ambient-pulse inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50">
            <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
          </span>
          <span className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Live</span>
        </div>
      )}

      {liveNotifications.map((notification) => (
        <div
          key={notification.id}
          className="data-row stagger-enter flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
            {eventIcon(notification.event)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {notification.title}
            </p>
            <p className="text-xs text-slate-500">
              {notification.message}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {format(new Date(notification.createdAt), 'MMM d, h:mm:ss a')}
            </p>
          </div>
          {!notification.read && (
            <span className="inline-block w-2 h-2 rounded-full bg-primary-500 shrink-0" />
          )}
        </div>
      ))}

      {liveNotifications.length === 0 && transactions && transactions.length > 0 && (
        <div className="space-y-3">
          {transactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="data-row stagger-enter flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                {transaction.source === 'recyclables' ? (
                  <Recycle className="w-4 h-4 text-emerald-600" />
                ) : transaction.source === 'withdrawal' ? (
                  <Wallet className="w-4 h-4 text-rose-600" />
                ) : (
                  <Wallet className="w-4 h-4 text-primary-700" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {transaction.source === 'recyclables'
                    ? 'Earned from recyclables'
                    : transaction.source === 'withdrawal'
                    ? 'Wallet withdrawal'
                    : transaction.description || 'Transaction'}
                </p>
                <p className="text-xs text-slate-500">
                  {format(new Date(transaction.createdAt), 'MMM d, h:mm a')}
                </p>
              </div>
              <div className="shrink-0">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    transaction.type === 'credit'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {transaction.type === 'credit' ? '+' : '-'}
                  {formatCurrency(Number(transaction.amount || 0), 2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecentActivity
