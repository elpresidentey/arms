import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
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
  socket: Socket | null
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

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const { token, user } = useAuth()

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

  const isRelevantToCurrentUser = (payload: unknown) => {
    if (!user || typeof payload !== 'object' || payload === null) return true
    const data = payload as { userId?: string | null; residentId?: string | null }
    if (user.role !== 'resident') return true
    return !data.userId && !data.residentId ? true : data.userId === user.id || data.residentId === user.id
  }

  useEffect(() => {
    if (!token || !user) {
      return
    }

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      auth: {
        token,
      },
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    newSocket.on('waste-collection-update', (data) => {
      if (!isRelevantToCurrentUser(data)) return
      const status = formatStatus(data?.status)
      pushNotification({
        event: 'waste-collection-update',
        title: 'Collection update',
        message: status ? `Status changed to ${status}` : 'Collection status updated',
        payload: data,
      })
      if (['completed', 'verified'].includes(String(data?.status ?? ''))) {
        toast.success(status === 'verified' ? 'Refuse collection verified for your area.' : 'Refuse collection completed for your area.')
      }
    })

    newSocket.on('recyclable-update', (data) => {
      if (!isRelevantToCurrentUser(data)) return
      const status = formatStatus(data?.status)
      pushNotification({
        event: 'recyclable-update',
        title: 'Recyclable update',
        message: status ? `Status changed to ${status}` : 'Recyclable status updated',
        payload: data,
      })
      toast.success(`Recyclable update: ${status || 'updated'}`)
    })

    newSocket.on('wallet-update', (data) => {
      if (!isRelevantToCurrentUser(data)) return
      const amount = Number(data?.amount || 0)
      const isDebit = data?.type === 'debit'
      const amountText = `${isDebit ? '-' : '+'}${formatCurrency(amount)}`
      pushNotification({
        event: 'wallet-update',
        title: 'Wallet update',
        message: `Transaction ${amountText}`,
        payload: data,
      })
      toast.success(`Wallet updated: ${amountText}`)
    })

    newSocket.on('service-request-update', (data) => {
      if (!isRelevantToCurrentUser(data)) return
      const status = formatStatus(data?.status)
      pushNotification({
        event: 'service-request-update',
        title: 'Service request update',
        message: status ? `Status changed to ${status}` : 'Service request updated',
        payload: data,
      })
    })

    newSocket.on('report-update', (data) => {
      if (!isRelevantToCurrentUser(data)) return
      const status = formatStatus(data?.status)
      pushNotification({
        event: 'report-update',
        title: 'Report update',
        message: status ? `Status changed to ${status}` : 'Report updated',
        payload: data,
      })
    })

    newSocket.on('collection-route-update', (data) => {
      if (
        user.role === 'resident' &&
        (data?.ward !== user.ward || data?.street !== user.street)
      ) {
        return
      }
      const status = formatStatus(data?.status)
      pushNotification({
        event: 'collection-route-update',
        title: 'Route update',
        message: status ? `Route status changed to ${status}` : 'Collection route updated',
        payload: data,
      })
    })

    newSocket.on('notification', (data) => {
      if (!isRelevantToCurrentUser(data)) return
      const title = String(data?.title || 'Notification')
      const message = String(data?.message || 'A service update is available.')

      pushNotification({
        event: String(data?.type || 'notification'),
        title,
        message,
        payload: data?.data ?? data,
      })
      toast.success(message, { duration: 6500 })
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
      setSocket(null)
      setIsConnected(false)
    }
  }, [token, user])

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
