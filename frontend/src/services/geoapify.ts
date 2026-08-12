const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY

if (!GEOAPIFY_API_KEY) {
  console.warn('VITE_GEOAPIFY_API_KEY is not configured. Address search will be disabled.')
}

export interface GeocodingResult {
  lat: number
  lon: number
  formatted: string
  address: {
    name?: string
    house_number?: string
    street?: string
    postcode?: string
    city?: string
    county?: string
    state?: string
    country?: string
  }
}

export interface AddressValidation {
  isValid: boolean
  formattedAddress?: string
  coordinates?: { lat: number; lon: number }
  components?: any
}

const ensureKey = () => {
  if (!GEOAPIFY_API_KEY) {
    throw new Error('Geoapify is not configured.')
  }
  return GEOAPIFY_API_KEY
}

const mapFeature = (feature: any): GeocodingResult => {
  const props = feature?.properties ?? {}
  return {
    lat: props.lat,
    lon: props.lon,
    formatted: props.formatted,
    address: {
      name: props.name,
      house_number: props.house_number,
      street: props.street,
      postcode: props.postcode,
      city: props.city,
      county: props.county,
      state: props.state,
      country: props.country,
    },
  }
}

const callGeocoding = async (path: string, params: Record<string, string>): Promise<any> => {
  const apiKey = ensureKey()
  const query = new URLSearchParams({ ...params, apiKey })
  const response = await fetch(`https://api.geoapify.com/v1/${path}?${query.toString()}`)
  if (!response.ok) {
    throw new Error(`Geoapify request failed (${response.status})`)
  }
  const data = await response.json()
  return data?.features ?? []
}

export const geoapifyApi = {
  // Geocode an address to get coordinates
  geocode: async (address: string): Promise<GeocodingResult> => {
    const features = await callGeocoding('geocode/search', { text: address, format: 'json' })
    const result = features.map(mapFeature)
    return result[0]
  },

  // Reverse geocode coordinates to get address
  reverseGeocode: async (lat: number, lon: number): Promise<GeocodingResult> => {
    const features = await callGeocoding('geocode/reverse', { lat: String(lat), lon: String(lon), format: 'json' })
    const result = features.map(mapFeature)
    return result[0]
  },

  // Get address suggestions for autocomplete
  autocomplete: async (query: string, limit: number = 5): Promise<GeocodingResult[]> => {
    const features = await callGeocoding('geocode/autocomplete', { text: query, limit: String(limit), format: 'json' })
    return features.map(mapFeature)
  },

  // Validate and format an address
  validateAddress: async (address: string): Promise<AddressValidation> => {
    const features = await callGeocoding('geocode/search', { text: address, format: 'json' })
    const result = features.map(mapFeature)
    if (result.length === 0) {
      return { isValid: false }
    }
    return {
      isValid: true,
      formattedAddress: result[0].formatted,
      coordinates: { lat: result[0].lat, lon: result[0].lon },
      components: result[0].address,
    }
  },
}
