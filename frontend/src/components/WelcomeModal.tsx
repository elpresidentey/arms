import React, { useState } from 'react'
import { X, CheckCircle2, Truck, FileText, Recycle, Wallet, ArrowRight } from 'lucide-react'
import Button from './Button'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, userName }) => {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      icon: Truck,
      title: `Welcome to ARMS${userName ? `, ${userName}` : ''}!`,
      description: 'Your automated refuse management system is ready. Let\'s take a quick tour of what you can do.',
      color: 'bg-primary-50 text-primary-700',
    },
    {
      icon: FileText,
      title: 'Track Your Collections',
      description: 'View scheduled pickups, track collection history, and stay updated on service activity from your dashboard.',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      icon: Recycle,
      title: 'Manage Recyclables',
      description: 'Log recyclable items, request pickups, and track your recycling activity. Earn rewards for your contributions!',
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      icon: Wallet,
      title: 'Monitor Your Wallet',
      description: 'Check your recycling earnings, view transaction history, and request withdrawals from your dashboard.',
      color: 'bg-amber-50 text-amber-700',
    },
  ]

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onClose()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close welcome modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${currentStepData.color}`}>
            <Icon className="h-8 w-8" />
          </div>

          {/* Title & Description */}
          <div className="mt-6 space-y-3">
            <h2 className="text-2xl font-bold text-slate-950">{currentStepData.title}</h2>
            <p className="text-base leading-7 text-slate-600">{currentStepData.description}</p>
          </div>

          {/* Progress Indicators */}
          <div className="mt-8 flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-primary-600'
                    : index < currentStep
                      ? 'bg-primary-300'
                      : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              onClick={handleSkip}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Skip tour
            </button>
            <Button onClick={handleNext} size="lg" className="inline-flex items-center gap-2">
              {isLastStep ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Get started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Step Counter */}
          <p className="mt-4 text-center text-xs text-slate-500">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </div>
    </div>
  )
}

export default WelcomeModal
