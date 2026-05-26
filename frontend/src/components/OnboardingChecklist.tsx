import React from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  User,
  Calendar,
  Recycle,
  FileText,
  Wallet,
  Receipt,
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

  return (
    <div className="rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-950">Getting Started</h3>
          <p className="mt-1 text-sm text-slate-600">
            Complete these steps to get the most out of ARMS
          </p>
        </div>
        {onDismiss && completedCount === totalCount && (
          <button
            onClick={onDismiss}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Dismiss
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">
            {completedCount} of {totalCount} completed
          </span>
          <span className="text-slate-600">{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-primary-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="mt-6 space-y-3">
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
              className={`group flex items-start gap-4 rounded-xl border p-4 transition-all ${
                isCompleted
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-slate-200 bg-white hover:border-primary-200 hover:bg-primary-50/30'
              }`}
            >
              {/* Icon/Checkbox */}
              <div className="flex-shrink-0 pt-0.5">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-400 transition group-hover:text-primary-600" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${isCompleted ? 'text-emerald-600' : 'text-slate-600'}`} />
                    <h4
                      className={`text-sm font-semibold ${
                        isCompleted ? 'text-emerald-900' : 'text-slate-900'
                      }`}
                    >
                      {item.title}
                    </h4>
                  </div>
                  {!isCompleted && (
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary-600" />
                  )}
                </div>
                <p className={`mt-1 text-xs ${isCompleted ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {isCompleted ? 'Completed!' : item.description}
                </p>
                {!isCompleted && (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-700 group-hover:text-primary-800">
                    {item.linkText}
                    <ChevronRight className="h-3 w-3" />
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Completion Message */}
      {completedCount === totalCount && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">All set!</p>
              <p className="text-xs text-emerald-700">
                You've completed the onboarding checklist. You're ready to use ARMS!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OnboardingChecklist
