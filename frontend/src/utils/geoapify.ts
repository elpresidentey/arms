export interface LocationSelection {
  address: string
  street: string
  ward: string
  latitude: number
  longitude: number
}

interface GeoapifyFeature {
  properties?: {
    formatted?: string
    address_line1?: string
    address_line2?: string
    street?: string
    suburb?: string
    district?: string
    county?: string
    city?: string
    state?: string
    lat?: number
    lon?: number
  }
}

const GEOAPIFY_BASE_URL = 'https://api.geoapify.com/v1/geocode'

const toLocationSelection = (feature?: GeoapifyFeature | null): LocationSelection | null => {
  const properties = feature?.properties

  if (!properties) {
    return null
  }

  return {
    address: properties.formatted || properties.address_line1 || '',
    street: properties.street || properties.address_line1 || '',
    ward:
      properties.suburb ||
      properties.district ||
      properties.county ||
      properties.city ||
      properties.state ||
      '',
    latitude: Number(properties.lat || 0),
    longitude: Number(properties.lon || 0),
  }
}

export const searchGeoapifyAddresses = async (query: string, apiKey?: string) => {
  if (!apiKey || query.trim().length < 3) {
    return []
  }

  const url = new URL(`${GEOAPIFY_BASE_URL}/autocomplete`)
  url.searchParams.set('text', query)
  url.searchParams.set('limit', '5')
  url.searchParams.set('apiKey', apiKey)

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error('Geoapify autocomplete failed.')
  }

  const data = await response.json()
  const features = Array.isArray(data.features) ? data.features : []

  return features
    .map((feature: GeoapifyFeature) => toLocationSelection(feature))
    .filter((item: LocationSelection | null): item is LocationSelection => Boolean(item))
}

export const reverseGeocodeCoordinates = async (
  latitude: number,
  longitude: number,
  apiKey?: string,
) => {
  if (!apiKey) {
    return null
  }

  const url = new URL(`${GEOAPIFY_BASE_URL}/reverse`)
  url.searchParams.set('lat', String(latitude))
  url.searchParams.set('lon', String(longitude))
  url.searchParams.set('apiKey', apiKey)

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error('Geoapify reverse geocoding failed.')
  }

  const data = await response.json()
  const firstFeature = Array.isArray(data.features) ? data.features[0] : null
  const selection = toLocationSelection(firstFeature)

  if (!selection) {
    return null
  }

  return {
    ...selection,
    latitude,
    longitude,
  }
}
