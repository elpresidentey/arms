import React from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Recycle,
  FileText,
  Wallet,
  Receipt,
  Minimize2,
} from 'lucide-react'

interface OnboardingChecklistProps {
  completedSteps: string[]
  onStepClick?: (stepId: string) => void
  onDismiss?: () => void
}

interface ChecklistItem {
  id: string
  icon: React.ElementType
  title: string
  description: string
  link: string
  linkText: string
  completesOnClick?: boolean
}

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Recycle,
  FileText,
  Wallet,
  Receipt,
  Minimize2,
} from 'lucide-react'

interface OnboardingChecklistProps {
  completedSteps: string[]
  onStepClick?: (stepId: string) => void
  onDismiss?: () => void
}

interface ChecklistItem {
  id: string
  icon: React.ElementType
  title: string
  description: string
  link: string
  linkText: string
  completesOnClick?: boolean
}

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({ completedSteps, onStepClick, onDismiss }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const checklistItems: ChecklistItem[] = [
    {
      id: 'profile',
      icon: User,
      title: 'Complete your profile',
      description: 'Add your contact details and verify your address',
      link: '/app/profile',
      linkText: 'Update profile',
    },
    {
      id: 'schedule',
      icon: Calendar,
      title: 'Schedule your first collection',
      description: 'Set up a waste collection for your address',
      link: '/app/schedule-collection',
      linkText: 'Schedule now',
    },
    {
      id: 'recyclables',
      icon: Recycle,
      title: 'Log recyclable items',
      description: 'Start earning by logging your recyclables',
      link: '/app/recyclables',
      linkText: 'Add recyclables',
    },
    {
      id: 'report',
      icon: FileText,
      title: 'Know how to report issues',
      description: 'Learn how to report missed pickups or other problems',
      link: '/app/reports',
      linkText: 'View reports',
      completesOnClick: true,
    },
    {
      id: 'wallet',
      icon: Wallet,
      title: 'Check your wallet',
      description: 'See how you can earn and withdraw from recycling',
      link: '/app/wallet',
      linkText: 'View wallet',
      completesOnClick: true,
    },
    {
      id: 'bills',
      icon: Receipt,
      title: 'Pay your refuse bill',
      description: 'View monthly waste collection fees and pay securely online',
      link: '/app/bills',
      linkText: 'Pay my bills',
      completesOnClick: true,
    },
  ]

  const completedCount = completedSteps.length
  const totalCount = checklistItems.length
  const progress = (completedCount / totalCount) * 100
  const allCompleted = completedCount === totalCount

  return (
    <div className="rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white shadow-sm">
      {/* Minimized Header - Always Visible */}
      <div
        className="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-primary-50/50 transition-colors rounded-t-2xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-primary-600" />
              </div>
              {/* Progress ring */}
              <svg className="absolute inset-0 h-8 w-8 -rotate-90" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="rgb(236 254 255)"
                  strokeWidth="2"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="rgb(37 99 235)"
                  strokeWidth="2"
                  strokeDasharray={`${(progress / 100) * 62.8} 62.8`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-950">Getting Started</h3>
              <p className="text-xs text-slate-600">
                {completedCount}/{totalCount} tasks • {Math.round(progress)}% complete
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Show next incomplete task */}
          {!allCompleted && !isExpanded && (
            <div className="text-right mr-2">
              <p className="text-xs font-medium text-slate-700">
                Next: {checklistItems.find(item => !completedSteps.includes(item.id))?.title}
              </p>
            </div>
          )}
          
          {/* Dismiss button for completed checklist */}
          {allCompleted && onDismiss && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDismiss()
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2 py-1 rounded-md hover:bg-white/50"
            >
              Dismiss
            </button>
          )}

          {/* Expand/Collapse button */}
          <button className="p-1 rounded-md hover:bg-white/50">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-slate-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-primary-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2">
            {checklistItems.map((item) => {
              const Icon = item.icon
              const isCompleted = completedSteps.includes(item.id)

              return (
                <Link
                  key={item.id}
                  to={item.link}
                  onClick={() => {
                    if (item.completesOnClick) {
                      onStepClick?.(item.id)
                    }
                  }}
                  className={`group flex items-center gap-3 rounded-lg border p-3 transition-all text-sm ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-slate-200 bg-white hover:border-primary-200 hover:bg-primary-50/30'
                  }`}
                >
                  {/* Icon/Checkbox */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-400 transition group-hover:text-primary-600" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-3.5 w-3.5 ${isCompleted ? 'text-emerald-600' : 'text-slate-600'}`} />
                        <span
                          className={`text-sm font-medium ${
                            isCompleted ? 'text-emerald-900 line-through' : 'text-slate-900'
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                      {!isCompleted && (
                        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary-600" />
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Completion Message */}
          {allCompleted && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">All set!</p>
                  <p className="text-xs text-emerald-700">
                    You've completed the onboarding checklist.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
}

export default OnboardingChecklist
