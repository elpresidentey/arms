import axios from 'axios'
import { getStoredAuthToken } from './authSession'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getStoredAuthToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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

export const geoapifyApi = {
  // Geocode an address to get coordinates
  geocode: async (address: string): Promise<GeocodingResult> => {
    const response = await api.get('/geoapify/geocode', {
      params: { address }
    })
    return response.data
  },

  // Reverse geocode coordinates to get address
  reverseGeocode: async (lat: number, lon: number): Promise<GeocodingResult> => {
    const response = await api.get('/geoapify/reverse-geocode', {
      params: { lat: lat.toString(), lon: lon.toString() }
    })
    return response.data
  },

  // Get address suggestions for autocomplete
  autocomplete: async (query: string, limit: number = 5): Promise<GeocodingResult[]> => {
    const response = await api.get('/geoapify/autocomplete', {
      params: { query, limit: limit.toString() }
    })
    return response.data
  },

  // Validate and format an address
  validateAddress: async (address: string): Promise<AddressValidation> => {
    const response = await api.get('/geoapify/validate', {
      params: { address }
    })
    return response.data
  }
}
