/**
 * Security Monitor Component
 * Provides real-time session monitoring and security alerts
 */

import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { securityService } from '../services/securityService'
import toast from 'react-hot-toast'

interface SecurityMonitorProps {
  showSessionInfo?: boolean
  enableWarnings?: boolean
}

const SecurityMonitor: React.FC<SecurityMonitorProps> = ({ 
  showSessionInfo = false, 
  enableWarnings = true 
}) => {
  const { user, forceLogout } = useAuth()
  const [sessionInfo, setSessionInfo] = useState(securityService.getSessionInfo())
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<string>('')

  useEffect(() => {
    if (!user) return

    const updateSessionInfo = () => {
      const info = securityService.getSessionInfo()
      setSessionInfo(info)
      
      if (info) {
        const now = Date.now()
        const sessionAge = now - info.sessionStart
        const timeSinceActivity = now - info.lastActivity
        const sessionTimeout = 8 * 60 * 60 * 1000 // 8 hours
        const inactivityTimeout = 30 * 60 * 1000 // 30 minutes
        
        // Calculate time until session expires
        const timeUntilSessionExpiry = sessionTimeout - sessionAge
        const timeUntilInactivityExpiry = inactivityTimeout - timeSinceActivity
        
        const nextExpiry = Math.min(timeUntilSessionExpiry, timeUntilInactivityExpiry)
        
        if (nextExpiry > 0) {
          const hours = Math.floor(nextExpiry / (1000 * 60 * 60))
          const minutes = Math.floor((nextExpiry % (1000 * 60 * 60)) / (1000 * 60))
          setTimeUntilExpiry(`${hours}h ${minutes}m`)
          
          // Show warnings
          if (enableWarnings) {
            if (nextExpiry <= 5 * 60 * 1000) { // 5 minutes
              toast.error('⏰ Your session will expire in 5 minutes', { 
                id: 'session-warning-5min',
                duration: 10000 
              })
            } else if (nextExpiry <= 15 * 60 * 1000) { // 15 minutes
              toast.error('⏰ Your session will expire in 15 minutes', { 
                id: 'session-warning-15min',
                duration: 8000 
              })
            }
          }
        } else {
          setTimeUntilExpiry('Expired')
        }
      }
    }

    // Update immediately
    updateSessionInfo()
    
    // Update every 30 seconds
    const interval = setInterval(updateSessionInfo, 30000)

    return () => {
      clearInterval(interval)
    }
  }, [user, enableWarnings, forceLogout])

  // Auto-logout on session expiry
  useEffect(() => {
    if (!user) return

    const checkSession = async () => {
      if (!securityService.isSessionValid()) {
        await forceLogout('Session expired')
      }
    }

    // Check every minute
    const interval = setInterval(checkSession, 60000)

    return () => {
      clearInterval(interval)
    }
  }, [user, forceLogout])

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Page became visible - check session validity
        if (!securityService.isSessionValid()) {
          forceLogout('Session expired while page was hidden')
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, forceLogout])

  // Extend session functionality
  const extendSession = () => {
    securityService.recordActivity()
    toast.success('Session extended', { duration: 3000 })
  }

  if (!user || !showSessionInfo) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-700">Session Info</span>
          <button
            onClick={extendSession}
            className="text-blue-600 hover:text-blue-800 text-xs"
            title="Extend session"
          >
            🔄 Extend
          </button>
        </div>
        
        <div className="space-y-1 text-gray-600">
          {sessionInfo && (
            <>
              <div>Started: {new Date(sessionInfo.sessionStart).toLocaleTimeString()}</div>
              <div>Last Activity: {new Date(sessionInfo.lastActivity).toLocaleTimeString()}</div>
              <div>Expires in: {timeUntilExpiry}</div>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-700">Secure Session</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SecurityMonitor