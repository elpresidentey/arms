import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Bill } from '../../types'

const statusConfig: Record<
  Bill['status'],
  { bg: string; text: string; label: string; icon: JSX.Element }
> = {
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    label: 'Pending',
    icon: <Clock className="w-4 h-4" />,
  },
  paid: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: 'Paid',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  overdue: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: 'Overdue',
    icon: <AlertCircle className="w-4 h-4" />,
  },
  cancelled: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
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
