import React from 'react'
import { AlertCircle, Inbox, Loader2 } from 'lucide-react'

interface StatePanelProps {
  title: string
  description: string
  tone?: 'loading' | 'empty' | 'error'
  action?: React.ReactNode
}

const toneConfig = {
  loading: {
    icon: Loader2,
    iconClassName: 'text-primary-700 animate-spin',
    panelClassName: 'border-slate-200 bg-slate-50',
  },
  empty: {
    icon: Inbox,
    iconClassName: 'text-slate-400',
    panelClassName: 'border-slate-200 bg-slate-50',
  },
  error: {
    icon: AlertCircle,
    iconClassName: 'text-rose-600',
    panelClassName: 'border-rose-200 bg-rose-50',
  },
}

const StatePanel: React.FC<StatePanelProps> = ({
  title,
  description,
  tone = 'empty',
  action,
}) => {
  const { icon: Icon, iconClassName, panelClassName } = toneConfig[tone]

  return (
    <div className={`rounded-xl border px-4 py-12 text-center ${panelClassName} transition-colors duration-200`}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
        <Icon className={`h-6 w-6 ${iconClassName}`} />
      </div>
      <p className="mt-4 text-base font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-slate-600">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export default StatePanel
