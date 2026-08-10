/**
 * Enhanced Security Service for ARMS
 * Handles automatic logout, session management, and security monitoring
 */

import { clearAuthSession } from './authSession'

interface SecurityConfig {
  sessionTimeout: number // milliseconds
  inactivityTimeout: number // milliseconds
  maxConcurrentSessions: number
  enableAutoLogoutOnClose: boolean
  enableAutoLogoutOnInactivity: boolean
  enableTabVisibilityLogout: boolean
  secureHeaders: boolean
}

interface SessionInfo {
  lastActivity: number
  sessionStart: number
  tabId: string
  isActive: boolean
}

class SecurityService {
  private config: SecurityConfig
  private inactivityTimer: NodeJS.Timeout | null = null
  private sessionTimer: NodeJS.Timeout | null = null
  private tabId: string
  private isInitialized = false
  private sessionStorageKey = 'arms_security_session'
  private activeTabsKey = 'arms_active_tabs'
  private lastActivityKey = 'arms_last_activity'
  private logoutCallbacks: Array<() => Promise<void> | void> = []
  private visibilityTimeout: NodeJS.Timeout | null = null
  private boundHandleBeforeUnload: () => void
  private boundHandleUnload: () => void
  private boundHandleUserActivity: () => void
  private boundHandleWindowFocus: () => void
  private boundHandleWindowBlur: () => void

  constructor() {
    this.config = {
      sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
      inactivityTimeout: 30 * 60 * 1000, // 30 minutes
      maxConcurrentSessions: 1, // Only allow 1 session at a time
      enableAutoLogoutOnClose: true,
      enableAutoLogoutOnInactivity: true,
      enableTabVisibilityLogout: false, // Disabled by default as it can be aggressive
      secureHeaders: true,
    }

    this.tabId = this.generateTabId()
    this.boundHandleBeforeUnload = this.handleBeforeUnload.bind(this)
    this.boundHandleUnload = this.handleUnload.bind(this)
    this.boundHandleUserActivity = this.handleUserActivity.bind(this)
    this.boundHandleWindowFocus = this.handleWindowFocus.bind(this)
    this.boundHandleWindowBlur = this.handleWindowBlur.bind(this)
    this.setupEventListeners()
  }

  /**
   * Initialize security monitoring for authenticated sessions
   */
  public initialize(logoutCallback: () => Promise<void> | void): void {
    if (this.isInitialized) {
      return
    }

    this.logoutCallbacks.push(logoutCallback)
    this.isInitialized = true
    
    // Register this tab as active
    this.registerActiveTab()
    
    // Start monitoring
    if (this.config.enableAutoLogoutOnInactivity) {
      this.startInactivityMonitoring()
    }
    
    this.startSessionTimeout()
    this.setupStorageListener()
    this.setupVisibilityListener()
    
    console.log('🔐 Security service initialized', {
      tabId: this.tabId,
      sessionTimeout: this.config.sessionTimeout / 1000 / 60,
      inactivityTimeout: this.config.inactivityTimeout / 1000 / 60
    })
  }

  /**
   * Cleanup security monitoring
   */
  public destroy(): void {
    this.clearTimers()
    this.removeEventListeners()
    this.unregisterActiveTab()
    this.isInitialized = false
    this.logoutCallbacks = []
    
    console.log('🔐 Security service destroyed')
  }

  /**
   * Update configuration
   */
  public updateConfig(updates: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...updates }
    
    if (this.isInitialized) {
      // Restart monitoring with new config
      this.destroy()
      if (this.logoutCallbacks.length > 0) {
        this.initialize(this.logoutCallbacks[0])
      }
    }
  }

  /**
   * Manually trigger user activity update
   */
  public recordActivity(): void {
    if (!this.isInitialized) return
    
    const now = Date.now()
    localStorage.setItem(this.lastActivityKey, now.toString())

    // Update the stored session's activity timestamp so validity checks stay accurate
    const sessionInfo = this.getSessionInfo()
    if (sessionInfo) {
      sessionInfo.lastActivity = now
      localStorage.setItem(this.sessionStorageKey, JSON.stringify(sessionInfo))
    }
    
    // Reset inactivity timer
    if (this.config.enableAutoLogoutOnInactivity) {
      this.resetInactivityTimer()
    }
  }

  /**
   * Force logout from all tabs
   */
  public async forceLogout(reason: string = 'Security logout'): Promise<void> {
    console.log('🚨 Force logout triggered:', reason)
    
    // Clear all security data
    this.clearSecurityData()
    
    // Execute logout callbacks
    for (const callback of this.logoutCallbacks) {
      try {
        await callback()
      } catch (error) {
        console.error('Logout callback error:', error)
      }
    }
    
    this.destroy()
  }

  /**
   * Check if current session is valid
   */
  public isSessionValid(): boolean {
    const sessionInfo = this.getSessionInfo()
    if (!sessionInfo) return false
    
    const now = Date.now()
    const sessionAge = now - sessionInfo.sessionStart
    const timeSinceActivity = now - sessionInfo.lastActivity
    
    // Check session timeout
    if (sessionAge > this.config.sessionTimeout) {
      console.log('🕐 Session expired due to timeout')
      return false
    }
    
    // Check inactivity timeout
    if (this.config.enableAutoLogoutOnInactivity && 
        timeSinceActivity > this.config.inactivityTimeout) {
      console.log('😴 Session expired due to inactivity')
      return false
    }
    
    return true
  }

  /**
   * Get current session information
   */
  public getSessionInfo(): SessionInfo | null {
    try {
      const stored = localStorage.getItem(this.sessionStorageKey)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  private generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substring(2)}`
  }

  private registerActiveTab(): void {
    const activeTabs = this.getActiveTabs()
    const now = Date.now()
    
    // Prune stale tab entries (e.g. from crashed tabs or reloads) so they
    // don't count against the concurrent session limit
    const freshTabs = activeTabs.filter(tab => now - tab.timestamp < 5 * 60 * 1000)
    if (freshTabs.length !== activeTabs.length) {
      localStorage.setItem(this.activeTabsKey, JSON.stringify(freshTabs))
    }
    
    // Check for concurrent session limit
    if (freshTabs.length >= this.config.maxConcurrentSessions) {
      console.log('🚫 Maximum concurrent sessions reached')
      // Force logout other tabs
      this.forceLogoutOtherTabs()
    }
    
    freshTabs.push({
      tabId: this.tabId,
      timestamp: now,
      userAgent: navigator.userAgent
    })
    
    localStorage.setItem(this.activeTabsKey, JSON.stringify(freshTabs))
    
    // Create session info
    const sessionInfo: SessionInfo = {
      lastActivity: now,
      sessionStart: now,
      tabId: this.tabId,
      isActive: true
    }
    
    localStorage.setItem(this.sessionStorageKey, JSON.stringify(sessionInfo))
    this.recordActivity()
  }

  private unregisterActiveTab(): void {
    const activeTabs = this.getActiveTabs()
    const filteredTabs = activeTabs.filter(tab => tab.tabId !== this.tabId)
    localStorage.setItem(this.activeTabsKey, JSON.stringify(filteredTabs))
  }

  private getActiveTabs(): Array<{ tabId: string; timestamp: number; userAgent: string }> {
    try {
      const stored = localStorage.getItem(this.activeTabsKey)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  private forceLogoutOtherTabs(): void {
    // Trigger logout signal for other tabs
    localStorage.setItem('arms_force_logout', Date.now().toString())
    localStorage.removeItem('arms_force_logout')
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return

    // Handle page unload - clear session
    window.addEventListener('beforeunload', this.boundHandleBeforeUnload)
    window.addEventListener('unload', this.boundHandleUnload)

    // Handle user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    activityEvents.forEach(event => {
      window.addEventListener(event, this.boundHandleUserActivity, { passive: true })
    })

    // Handle focus/blur for tab switching
    window.addEventListener('focus', this.boundHandleWindowFocus)
    window.addEventListener('blur', this.boundHandleWindowBlur)
  }

  private removeEventListeners(): void {
    if (typeof window === 'undefined') return

    window.removeEventListener('beforeunload', this.boundHandleBeforeUnload)
    window.removeEventListener('unload', this.boundHandleUnload)

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    activityEvents.forEach(event => {
      window.removeEventListener(event, this.boundHandleUserActivity)
    })

    window.removeEventListener('focus', this.boundHandleWindowFocus)
    window.removeEventListener('blur', this.boundHandleWindowBlur)
  }

  private setupStorageListener(): void {
    if (typeof window === 'undefined') return

    // Listen for logout signals from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'arms_force_logout') {
        this.forceLogout('Logged out by another session')
      }
      
      // Check for auth session removal
      if (event.key === 'arms_token' && !event.newValue) {
        this.forceLogout('Authentication token removed')
      }
    })
  }

  private setupVisibilityListener(): void {
    if (typeof window === 'undefined' || !this.config.enableTabVisibilityLogout) return

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Tab became hidden - start visibility timeout
        this.visibilityTimeout = setTimeout(() => {
          this.forceLogout('Tab was hidden too long')
        }, 10 * 60 * 1000) // 10 minutes
      } else {
        // Tab became visible - clear timeout
        if (this.visibilityTimeout) {
          clearTimeout(this.visibilityTimeout)
          this.visibilityTimeout = null
        }
        this.recordActivity()
      }
    })
  }

  private handleBeforeUnload(): void {
    if (this.config.enableAutoLogoutOnClose) {
      this.clearSecurityData()
    }
  }

  private handleUnload(): void {
    if (this.config.enableAutoLogoutOnClose) {
      this.unregisterActiveTab()
    }
  }

  private handleUserActivity(): void {
    this.recordActivity()
  }

  private handleWindowFocus(): void {
    // Check session validity when window gains focus
    if (!this.isSessionValid()) {
      this.forceLogout('Session invalid on focus')
    } else {
      this.recordActivity()
    }
  }

  private handleWindowBlur(): void {
    // Optional: Record when user leaves the tab
    this.recordActivity()
  }

  private startInactivityMonitoring(): void {
    this.resetInactivityTimer()
  }

  private resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer)
    }
    
    this.inactivityTimer = setTimeout(() => {
      this.forceLogout('Session expired due to inactivity')
    }, this.config.inactivityTimeout)
  }

  private startSessionTimeout(): void {
    this.sessionTimer = setTimeout(() => {
      this.forceLogout('Session expired due to timeout')
    }, this.config.sessionTimeout)
  }

  private clearTimers(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer)
      this.inactivityTimer = null
    }
    
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer)
      this.sessionTimer = null
    }
    
    if (this.visibilityTimeout) {
      clearTimeout(this.visibilityTimeout)
      this.visibilityTimeout = null
    }
  }

  private clearSecurityData(): void {
    localStorage.removeItem(this.sessionStorageKey)
    localStorage.removeItem(this.activeTabsKey)
    localStorage.removeItem(this.lastActivityKey)
    clearAuthSession()
  }
}

// Create singleton instance
export const securityService = new SecurityService()

// Enhanced logout hook for components
export const useSecureLogout = () => {
  const forceLogout = (reason?: string) => {
    return securityService.forceLogout(reason)
  }
  
  const isSessionValid = () => {
    return securityService.isSessionValid()
  }
  
  const recordActivity = () => {
    securityService.recordActivity()
  }
  
  return {
    forceLogout,
    isSessionValid,
    recordActivity,
    sessionInfo: securityService.getSessionInfo()
  }
}

export default securityService