import React from 'react'
import { AlertCircle, Inbox, Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface StatePanelProps {
  title: string
  description: string
  tone?: 'loading' | 'empty' | 'error'
  action?: React.ReactNode
}

const toneConfig = {
  loading: {
    icon: Loader2,
    chip: 'border-slate-200 bg-white text-primary-700 shadow-sm',
    panel: 'border-primary-100 bg-primary-50/40',
    spin: true,
  },
  empty: {
    icon: Inbox,
    chip: 'border-slate-200 bg-white text-slate-400 shadow-sm',
    panel: 'border-slate-200 bg-slate-50/60',
    spin: false,
  },
  error: {
    icon: AlertCircle,
    chip: 'border-rose-100 bg-white text-rose-600 shadow-sm',
    panel: 'border-rose-200 bg-rose-50/50',
    spin: false,
  },
}

const StatePanel: React.FC<StatePanelProps> = ({
  title,
  description,
  tone = 'empty',
  action,
}) => {
  const { icon: Icon, chip, panel, spin } = toneConfig[tone]

  return (
    <div
      className={clsx(
        'rounded-2xl border px-5 py-12 text-center transition-colors duration-200',
        panel,
      )}
    >
      <div
        className={clsx(
          'mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border',
          chip,
        )}
      >
        <Icon className={clsx('h-6 w-6', spin && 'animate-spin')} />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export default StatePanel