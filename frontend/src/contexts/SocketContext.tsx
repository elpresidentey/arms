import React, { createContext, useContext, useEffect, useState } from 'react'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'
import { formatCurrency } from '../utils/format'

export type AppNotification = {
  id: string
  event: string
  title: string
  message: string
  createdAt: string
  read: boolean
  payload?: unknown
}

interface SocketContextType {
  socket: RealtimeChannel | null
  isConnected: boolean
  notifications: AppNotification[]
  unreadCount: number
  markAllRead: () => void
  markRead: (id: string) => void
  clearAll: () => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

type Row = Record<string, unknown>

const TABLE_EVENTS = [
  { table: 'waste_collections', event: 'waste-collection-update' },
  { table: 'recyclables', event: 'recyclable-update' },
  { table: 'wallet_transactions', event: 'wallet-update' },
  { table: 'service_requests', event: 'service-request-update' },
  { table: 'reports', event: 'report-update' },
  { table: 'collection_routes', event: 'collection-route-update' },
] as const

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<RealtimeChannel | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const { user } = useAuth()

  const unreadCount = notifications.reduce((count, item) => (item.read ? count : count + 1), 0)

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
  }

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const pushNotification = (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const createdAt = new Date().toISOString()
    const id = `${createdAt}-${Math.random().toString(16).slice(2)}`
    const entry: AppNotification = {
      ...notification,
      id,
      createdAt,
      read: false,
    }

    setNotifications((prev) => [entry, ...prev].slice(0, 50))
  }

  const formatStatus = (value: unknown) => String(value ?? '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  const isRelevantToCurrentUser = (data: Row) => {
    if (!user) return true
    if (user.role !== 'resident') return true
    const userId = data.userId as string | null | undefined
    const residentId = data.residentId as string | null | undefined
    const reporterId = data.reporterId as string | null | undefined
    return [userId, residentId, reporterId].every((id) => !id || id === user.id)
  }

  const rowFromPayload = (payload: RealtimePostgresChangesPayload<Row>): Row => {
    return (payload.new ?? payload.old ?? {}) as Row
  }

  const handleTableEvent = (payload: RealtimePostgresChangesPayload<Row>) => {
    const event = TABLE_EVENTS.find((entry) => entry.table === payload.table)
    if (!event) return

    const data = rowFromPayload(payload)
    if (!data || typeof data !== 'object') return
    if (!isRelevantToCurrentUser(data)) return

    switch (event.event) {
      case 'waste-collection-update': {
        const status = formatStatus(data.status)
        pushNotification({
          event: event.event,
          title: 'Collection update',
          message: status ? `Status changed to ${status}` : 'Collection status updated',
          payload: data,
        })
        if (['completed', 'verified'].includes(String(data.status ?? ''))) {
          toast.success(status === 'verified' ? 'Refuse collection verified for your area.' : 'Refuse collection completed for your area.')
        }
        break
      }
      case 'recyclable-update': {
        const status = formatStatus(data.status)
        pushNotification({
          event: event.event,
          title: 'Recyclable update',
          message: status ? `Status changed to ${status}` : 'Recyclable status updated',
          payload: data,
        })
        toast.success(`Recyclable update: ${status || 'updated'}`)
        break
      }
      case 'wallet-update': {
        const amount = Number(data.amount || 0)
        const isDebit = data.type === 'debit'
        const amountText = `${isDebit ? '-' : '+'}${formatCurrency(amount)}`
        pushNotification({
          event: event.event,
          title: 'Wallet update',
          message: `Transaction ${amountText}`,
          payload: data,
        })
        toast.success(`Wallet updated: ${amountText}`)
        break
      }
      case 'service-request-update': {
        const status = formatStatus(data.status)
        pushNotification({
          event: event.event,
          title: 'Service request update',
          message: status ? `Status changed to ${status}` : 'Service request updated',
          payload: data,
        })
        break
      }
      case 'report-update': {
        const status = formatStatus(data.status)
        pushNotification({
          event: event.event,
          title: 'Report update',
          message: status ? `Status changed to ${status}` : 'Report updated',
          payload: data,
        })
        break
      }
      case 'collection-route-update': {
        if (
          user?.role === 'resident' &&
          (data.ward !== (user as { ward?: string | null }).ward || data.street !== (user as { street?: string | null }).street)
        ) {
          return
        }
        const status = formatStatus(data.status)
        pushNotification({
          event: event.event,
          title: 'Route update',
          message: status ? `Route status changed to ${status}` : 'Collection route updated',
          payload: data,
        })
        break
      }
    }
  }

  useEffect(() => {
    if (!user) {
      setIsConnected(false)
      return
    }

    const channel = supabase.channel('dashboard-live')

    for (const entry of TABLE_EVENTS) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: entry.table },
        handleTableEvent,
      )
    }

    setSocket(channel)

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true)
        console.log('Supabase Realtime connected')
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        setIsConnected(false)
        console.warn('Supabase Realtime unavailable:', status)
      }
    })

    return () => {
      supabase.removeChannel(channel)
      setSocket(null)
      setIsConnected(false)
    }
  }, [user])

  const value = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    markAllRead,
    markRead,
    clearAll,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}