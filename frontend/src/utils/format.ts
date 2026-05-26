export const formatCurrency = (amount: number, maximumFractionDigits = 0) => {
  return `NGN ${new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(amount)}`
}

export const formatShortDate = (value?: string | null) => {
  if (!value) {
    return 'No record'
  }

  return new Intl.DateTimeFormat('en-NG', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export const formatDayTime = (value?: string | null) => {
  if (!value) {
    return 'No schedule'
  }

  return new Intl.DateTimeFormat('en-NG', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export const formatDate = (value?: string | null) => {
  if (!value) {
    return 'N/A'
  }

  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}
