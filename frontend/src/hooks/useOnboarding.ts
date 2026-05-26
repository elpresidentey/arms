import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { wasteCollectionsApi, recyclablesApi, walletApi, reportsApi, billingApi } from '../services/api'

interface OnboardingState {
  hasSeenWelcome: boolean
  completedSteps: string[]
  isDismissed: boolean
}

const ONBOARDING_STORAGE_KEY = 'arms_onboarding_state'

export const useOnboarding = () => {
  const { user } = useAuth()
  const [state, setState] = useState<OnboardingState>({
    hasSeenWelcome: false,
    completedSteps: [],
    isDismissed: false,
  })

  // Fetch data to auto-detect completed steps
  const { data: collections } = useQuery({
    queryKey: ['my-waste-collections'],
    queryFn: wasteCollectionsApi.getMyCollections,
    enabled: !!user && user.role === 'resident',
  })

  const { data: recyclables } = useQuery({
    queryKey: ['my-recyclables'],
    queryFn: recyclablesApi.getMyRecyclables,
    enabled: !!user && user.role === 'resident',
  })

  const { data: walletSummary } = useQuery({
    queryKey: ['wallet-summary'],
    queryFn: walletApi.getSummary,
    enabled: !!user && user.role === 'resident',
  })

  const { data: reports } = useQuery({
    queryKey: ['reports'],
    queryFn: reportsApi.getReports,
    enabled: !!user && user.role === 'resident',
  })

  const { data: bills } = useQuery({
    queryKey: ['my-bills'],
    queryFn: billingApi.getMyBills,
    enabled: !!user && user.role === 'resident',
  })

  // Save onboarding state to localStorage
  const saveState = useCallback((newState: Partial<OnboardingState>) => {
    if (!user) return

    const storageKey = `${ONBOARDING_STORAGE_KEY}_${user.id}`
    setState((current) => {
      const updated = { ...current, ...newState }
      localStorage.setItem(storageKey, JSON.stringify(updated))
      return updated
    })
  }, [user])

  // Load onboarding state from localStorage
  useEffect(() => {
    if (!user) return

    const storageKey = `${ONBOARDING_STORAGE_KEY}_${user.id}`
    const stored = localStorage.getItem(storageKey)

    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setState(parsed)
      } catch (error) {
        console.error('Failed to parse onboarding state:', error)
      }
    }
  }, [user])

  // Auto-detect completed steps based on user activity
  useEffect(() => {
    if (!user) return

    const autoCompletedSteps: string[] = []

    // Profile step: Check if user has filled in key profile fields
    if (user.phoneNumber && user.street && user.houseNumber) {
      autoCompletedSteps.push('profile')
    }

    // Schedule step: Check if user has any collections
    if (collections && collections.length > 0) {
      autoCompletedSteps.push('schedule')
    }

    // Recyclables step: Check if user has logged any recyclables
    if (recyclables && recyclables.length > 0) {
      autoCompletedSteps.push('recyclables')
    }

    // Wallet step: Check if user has checked their wallet (has transactions)
    if (walletSummary && walletSummary.transactionCount > 0) {
      autoCompletedSteps.push('wallet')
    }

    // Report step: Check if user has submitted any reports.
    if (reports && reports.length > 0) {
      autoCompletedSteps.push('report')
    }

    if (bills && bills.some((bill) => bill.status === 'paid')) {
      autoCompletedSteps.push('bills')
    }

    // Merge auto-detected steps with manually completed steps
    const allCompletedSteps = Array.from(new Set([...state.completedSteps, ...autoCompletedSteps]))

    // Only update if there are new completed steps
    if (allCompletedSteps.length > state.completedSteps.length) {
      saveState({ completedSteps: allCompletedSteps })
    }
  }, [user, collections, recyclables, walletSummary, reports, bills, state.completedSteps, saveState])

  const markWelcomeSeen = () => {
    saveState({ hasSeenWelcome: true })
  }

  const completeStep = (stepId: string) => {
    if (state.completedSteps.includes(stepId)) return

    saveState({
      completedSteps: [...state.completedSteps, stepId],
    })
  }

  const dismissChecklist = () => {
    saveState({ isDismissed: true })
  }

  const resetOnboarding = () => {
    if (!user) return

    const storageKey = `${ONBOARDING_STORAGE_KEY}_${user.id}`
    localStorage.removeItem(storageKey)
    setState({
      hasSeenWelcome: false,
      completedSteps: [],
      isDismissed: false,
    })
  }

  // Only show onboarding to resident users, not admin/staff
  const isResident = user?.role === 'resident'
  const shouldShowWelcome = isResident && !state.hasSeenWelcome
  const shouldShowChecklist = isResident && !state.isDismissed

  return {
    state,
    shouldShowWelcome,
    shouldShowChecklist,
    markWelcomeSeen,
    completeStep,
    dismissChecklist,
    resetOnboarding,
  }
}
