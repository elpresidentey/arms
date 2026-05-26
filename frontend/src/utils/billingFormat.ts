export const formatBillingDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

export const formatBillingPeriod = (period: string) => {
  const [year, month] = period.split('-')
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1)
  return date.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
  })
}

export const propertyTypeLabel = (type: 'residential' | 'commercial') =>
  type === 'residential' ? 'Residential' : 'Commercial'

export const monthlyRateLabel = (type: 'residential' | 'commercial') =>
  type === 'residential' ? '₦2,000 / month' : '₦3,500 / month'

export const billServiceLabel = (type: 'residential' | 'commercial') =>
  type === 'residential'
    ? 'Residential refuse collection'
    : 'Commercial refuse collection'

export const profilePropertyType = (propertyType?: string): 'residential' | 'commercial' =>
  propertyType === 'commercial' ? 'commercial' : 'residential'
