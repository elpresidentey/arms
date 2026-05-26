import React, { useEffect, useId, useState } from 'react'
import { Crosshair, Loader2, MapPinned } from 'lucide-react'
import toast from 'react-hot-toast'
import { geoapifyApi } from '../services/geoapify'
import {
  LocationSelection,
  reverseGeocodeCoordinates,
  searchGeoapifyAddresses,
} from '../utils/geoapify'

interface LocationFieldProps {
  value: string
  streetValue: string
  wardValue: string
  latitude?: number
  longitude?: number
  required?: boolean
  onAddressChange: (value: string) => void
  onLocationSelect: (value: LocationSelection) => void
}

const LocationField: React.FC<LocationFieldProps> = ({
  value,
  streetValue,
  wardValue,
  latitude,
  longitude,
  required = false,
  onAddressChange,
  onLocationSelect,
}) => {
  const geoapifyApiKey = import.meta.env.VITE_GEOAPIFY_API_KEY
  const helperId = useId()
  const [isDetecting, setIsDetecting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<LocationSelection[]>([])

  useEffect(() => {
    if (value.trim().length < 3) {
      setSuggestions([])
      setIsSearching(false)
      return
    }

    let isCancelled = false
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true)

      try {
        const nextSuggestions = geoapifyApiKey
          ? await searchGeoapifyAddresses(value, geoapifyApiKey)
          : (await geoapifyApi.autocomplete(value, 5)).map((item) => ({
              address: item.formatted || value,
              street: item.address.street || item.address.name || '',
              ward:
                item.address.city ||
                item.address.county ||
                item.address.state ||
                item.address.country ||
                '',
              latitude: item.lat,
              longitude: item.lon,
            }))

        if (!isCancelled) {
          setSuggestions(nextSuggestions)
        }
      } catch {
        if (!isCancelled) {
          setSuggestions([])
        }
      } finally {
        if (!isCancelled) {
          setIsSearching(false)
        }
      }
    }, 250)

    return () => {
      isCancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [geoapifyApiKey, value])

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported in this browser.')
      return
    }

    setIsDetecting(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextLatitude = position.coords.latitude
        const nextLongitude = position.coords.longitude

        try {
          const reverseGeocoded = geoapifyApiKey
            ? await reverseGeocodeCoordinates(nextLatitude, nextLongitude, geoapifyApiKey)
            : await geoapifyApi.reverseGeocode(nextLatitude, nextLongitude).then((result) => ({
                address: result.formatted,
                street: result.address.street || result.address.name || '',
                ward:
                  result.address.city ||
                  result.address.county ||
                  result.address.state ||
                  result.address.country ||
                  '',
                latitude: result.lat,
                longitude: result.lon,
              }))

          if (reverseGeocoded) {
            onLocationSelect(reverseGeocoded)
            setSuggestions([])
            toast.success('Current location captured.')
          } else {
            onLocationSelect({
              address: value,
              street: streetValue,
              ward: wardValue,
              latitude: nextLatitude,
              longitude: nextLongitude,
            })
            toast.success('Coordinates captured. Add the address details if needed.')
          }
        } catch {
          onLocationSelect({
            address: value,
            street: streetValue,
            ward: wardValue,
            latitude: nextLatitude,
            longitude: nextLongitude,
          })
          toast.success('Coordinates captured. Add the address details if needed.')
        } finally {
          setIsDetecting(false)
        }
      },
      () => {
        setIsDetecting(false)
        toast.error('We could not access your current location.')
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
      },
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <label htmlFor="location-address" className="block text-sm font-medium text-slate-700">
          Address
        </label>
        <input
          id="location-address"
          type="text"
          className="input mt-1"
          value={value}
          required={required}
          onChange={(event) => {
            onAddressChange(event.target.value)
          }}
          placeholder={geoapifyApiKey ? 'Search address or use current location' : 'Enter your address'}
          aria-describedby={helperId}
          autoComplete="off"
        />
        <p id={helperId} className="mt-1 text-xs text-slate-500">
          {geoapifyApiKey
            ? 'Geoapify suggestions are available. You can also use your current location.'
            : 'Using backend-assisted lookup when available. Current GPS capture still works even without a browser key.'}
        </p>

        {(isSearching || suggestions.length > 0) && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.10)]">
            {isSearching && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching addresses...
              </div>
            )}
            {!isSearching &&
              suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.latitude}-${suggestion.longitude}-${suggestion.address}`}
                  type="button"
                  className="flex w-full flex-col px-4 py-3 text-left transition-colors hover:bg-slate-50"
                  onClick={() => {
                    onLocationSelect(suggestion)
                    setSuggestions([])
                  }}
                >
                  <span className="text-sm font-medium text-slate-900">{suggestion.address}</span>
                  <span className="mt-0.5 text-xs text-slate-500">
                    {suggestion.street || 'Unknown street'} | {suggestion.ward || 'Unknown area'}
                  </span>
                </button>
              ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <MapPinned className="h-4 w-4 text-primary-700" />
            <span>
              {latitude && longitude && typeof latitude === 'number' && typeof longitude === 'number'
                ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
                : 'No coordinates captured yet'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Live GPS makes reports, pickups, and route verification more reliable.
          </p>
          {latitude && longitude && typeof latitude === 'number' && typeof longitude === 'number' && (
            <a
              href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-xs font-medium text-primary-700 hover:text-primary-800"
            >
              Preview coordinates on a map
            </a>
          )}
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isDetecting}
          className="btn btn-secondary h-11 px-4"
        >
          <Crosshair className="mr-2 h-4 w-4" />
          {isDetecting ? 'Detecting...' : 'Use current location'}
        </button>
      </div>
    </div>
  )
}

export default LocationField
