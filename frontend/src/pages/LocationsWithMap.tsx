import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon, LatLngExpression } from 'leaflet'
import { ExternalLink, LocateFixed, Navigation, Recycle, Trash2, MapPin } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatePanel from '../components/StatePanel'
import Surface from '../components/Surface'
import { useAuth } from '../contexts/AuthContext'
import { collectionRoutesApi, locationsApi } from '../services/api'
import { CollectionRoute, LocationPoi } from '../types'
import { formatDayTime } from '../utils/format'
import { buildGoogleMapsUrl } from '../utils/maps'
import 'leaflet/dist/leaflet.css'

// Import marker images
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix Leaflet default icon
const defaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

Icon.Default.prototype.options.iconUrl = markerIcon
Icon.Default.prototype.options.iconRetinaUrl = markerIcon2x
Icon.Default.prototype.options.shadowUrl = markerShadow

const defaultCenter = {
  latitude: 6.4478,
  longitude: 3.2945,
  label: 'Amuwo Odofin',
}

const statusStyles: Record<string, string> = {
  available: 'bg-emerald-50 text-emerald-700',
  near_capacity: 'bg-amber-50 text-amber-800',
  closed: 'bg-rose-50 text-rose-700',
  scheduled_pickup: 'bg-primary-50 text-primary-700',
}

const formatDistance = (meters: number) => {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
  return `${Math.round(meters)} m`
}

const getLocationStatusLabel = (status?: LocationPoi['liveStatus']) => {
  if (!status) return 'Listed'
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const LocationsWithMap: React.FC = () => {
  const { user } = useAuth()
  const [locationType, setLocationType] = useState<'all' | LocationPoi['category']>('all')
  const [selectedLocation, setSelectedLocation] = useState<LocationPoi | null>(null)

  const center = {
    latitude: Number(user?.latitude ?? defaultCenter.latitude),
    longitude: Number(user?.longitude ?? defaultCenter.longitude),
    label: user?.street && user?.ward ? `${user.street}, ${user.ward}` : defaultCenter.label,
  }

  const {
    data: nearby,
    isLoading: isLocationsLoading,
    isError: isLocationsError,
  } = useQuery({
    queryKey: ['nearby-locations', center.latitude, center.longitude],
    queryFn: () =>
      locationsApi.getNearby({
        latitude: center.latitude,
        longitude: center.longitude,
        radius: 6000,
      }),
    refetchInterval: 30000,
  })

  const filteredLocations = useMemo(() => {
    const results = nearby?.results || []
    if (locationType === 'all') return results
    return results.filter((location) => location.category === locationType)
  }, [nearby?.results, locationType])

  const binLocations = filteredLocations.filter((location) => location.category === 'bin')
  const collectionPoints = filteredLocations.filter((location) => location.category === 'collection_point')

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Amuwo Odofin services"
        title="Nearby bins and collection points"
        description="Find public bins and drop-off points close to you with an interactive map."
        meta={
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Your Area</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{center.label}</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">Nearby bins</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-900">{binLocations.length}</p>
            </div>
            <div className="rounded-xl border border-primary-100 bg-primary-50/80 px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary-700">Collection points</p>
              <p className="mt-2 text-2xl font-semibold text-primary-900">{collectionPoints.length}</p>
            </div>
          </div>
        }
      />

      {/* Interactive Map */}
      <Surface title="Location map" subtitle="Click markers to see details. Zoom and pan to explore.">
        {isLocationsError ? (
          <StatePanel tone="error" title="Couldn't load map" description="Location data is temporarily unavailable." />
        ) : isLocationsLoading ? (
          <StatePanel tone="loading" title="Loading map" description="Fetching nearby locations..." />
        ) : !filteredLocations.length ? (
          <StatePanel tone="empty" title="No locations found" description="No bins or collection points within range." />
        ) : (
          <div className="rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm" style={{ height: '500px' }}>
            <MapContainer
              center={[center.latitude, center.longitude] as LatLngExpression}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* User location marker */}
              <Marker position={[center.latitude, center.longitude] as LatLngExpression} icon={defaultIcon}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-primary-700">Your Location</p>
                    <p className="text-slate-600">{center.label}</p>
                  </div>
                </Popup>
              </Marker>

              {/* Location markers */}
              {filteredLocations.map((location) => (
                <Marker
                  key={location.id}
                  position={[location.latitude, location.longitude] as LatLngExpression}
                  icon={defaultIcon}
                  eventHandlers={{
                    click: () => setSelectedLocation(location),
                  }}
                >
                  <Popup>
                    <div className="text-sm space-y-2 min-w-[200px]">
                      <div className="flex items-start gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                          {location.category === 'bin' ? <Trash2 className="h-4 w-4" /> : <Recycle className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{location.name}</p>
                          <p className="text-xs text-slate-600 capitalize">{location.category.replace('_', ' ')}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs text-slate-600">{location.address || location.area || 'Address details pending'}</p>
                        <p className="text-xs font-medium text-primary-600">{formatDistance(location.distanceMeters)} away</p>
                        {location.capacity && (
                          <p className="text-xs text-slate-600">Capacity: {location.capacity}</p>
                        )}
                      </div>

                      {location.liveStatus && (
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[location.liveStatus]}`}>
                          {getLocationStatusLabel(location.liveStatus)}
                        </span>
                      )}

                      <a
                        href={buildGoogleMapsUrl(location.latitude, location.longitude, location.name)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs font-medium text-primary-700 hover:text-primary-800 mt-2"
                      >
                        Get Directions
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {(['all', 'bin', 'collection_point'] as const).map((filter) => {
            const getFilterLabel = (filterType: string) => {
              switch (filterType) {
                case 'all': return 'All Locations'
                case 'bin': return 'Bins'
                case 'collection_point': return 'Collection Points'
                default: return filterType
              }
            }
            
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setLocationType(filter)}
                className={`btn h-9 px-3 ${locationType === filter ? 'btn-primary' : 'btn-secondary'}`}
              >
                {getFilterLabel(filter)}
              </button>
            )
          })}
          <a
            href={buildGoogleMapsUrl(center.latitude, center.longitude, center.label)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary h-9 px-3"
          >
            <LocateFixed className="mr-2 h-4 w-4" />
            Open in Google Maps
          </a>
        </div>
      </Surface>

      {/* Selected Location Details */}
      {selectedLocation && (
        <Surface title="Selected location" subtitle="Details for the location you clicked on the map">
          <article className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary-700 shadow-sm">
                  {selectedLocation.category === 'bin' ? <Trash2 className="h-5 w-5" /> : <Recycle className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-950">{selectedLocation.name}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[selectedLocation.liveStatus || 'available']}`}>
                      {getLocationStatusLabel(selectedLocation.liveStatus)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{selectedLocation.address || selectedLocation.area || 'Address details pending'}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDistance(selectedLocation.distanceMeters)} away • {selectedLocation.capacity || 'listed'} capacity
                  </p>
                  {selectedLocation.acceptedWaste?.length ? (
                    <p className="mt-2 text-xs text-slate-500">Accepts: {selectedLocation.acceptedWaste.join(', ')}</p>
                  ) : null}
                </div>
              </div>
              <a
                href={buildGoogleMapsUrl(selectedLocation.latitude, selectedLocation.longitude, selectedLocation.name)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-sm font-medium text-primary-700 hover:text-primary-800"
              >
                Get Directions
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </div>
          </article>
        </Surface>
      )}

      {/* List of All Locations */}
      <Surface title="All locations" subtitle="Complete list of bins and collection points near you">
        {isLocationsLoading ? (
          <StatePanel tone="loading" title="Loading locations" description="Checking nearby bins and collection points." />
        ) : !filteredLocations.length ? (
          <StatePanel tone="empty" title="No locations found" description="Try widening the area or updating your profile location." />
        ) : (
          <div className="space-y-3">
            {filteredLocations.map((location) => (
              <article 
                key={location.id} 
                className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 hover:border-primary-200 hover:bg-primary-50/30 cursor-pointer transition-colors"
                onClick={() => setSelectedLocation(location)}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary-700 shadow-sm">
                      {location.category === 'bin' ? <Trash2 className="h-5 w-5" /> : <Recycle className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-950">{location.name}</h3>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[location.liveStatus || 'available']}`}>
                          {getLocationStatusLabel(location.liveStatus)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{location.address || location.area || 'Address details pending'}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDistance(location.distanceMeters)} away • {location.capacity || 'listed'} capacity
                      </p>
                    </div>
                  </div>
                  <a
                    href={buildGoogleMapsUrl(location.latitude, location.longitude, location.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-sm font-medium text-primary-700 hover:text-primary-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Directions
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </Surface>
    </div>
  )
}

export default LocationsWithMap
