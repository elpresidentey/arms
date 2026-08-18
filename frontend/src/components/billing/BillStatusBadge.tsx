import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Bill } from '../../types'

const statusConfig: Record<
  Bill['status'],
  { bg: string; text: string; label: string; icon: JSX.Element }
> = {
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    label: 'Pending',
    icon: <Clock className="w-4 h-4" />,
  },
  paid: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    label: 'Paid',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  overdue: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    label: 'Overdue',
    icon: <AlertCircle className="w-4 h-4" />,
  },
  cancelled: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    label: 'Cancelled',
    icon: <XCircle className="w-4 h-4" />,
  },
}

const BillStatusBadge = ({ status }: { status: Bill['status'] }) => {
  const config = statusConfig[status]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}
    >
      {config.icon}
      {config.label}
    </span>
  )
}

export default BillStatusBadge
