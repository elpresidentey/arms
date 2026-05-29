import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink, LocateFixed, Navigation, Recycle, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatePanel from '../components/StatePanel'
import Surface from '../components/Surface'
import { useAuth } from '../contexts/AuthContext'
import { collectionRoutesApi, locationsApi } from '../services/api'
import { CollectionRoute, LocationPoi } from '../types'
import { formatDayTime } from '../utils/format'
import { buildGoogleMapsUrl } from '../utils/maps'

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

const routeStatusStyles: Record<string, string> = {
  live: 'bg-emerald-50 text-emerald-700',
  upcoming: 'bg-primary-50 text-primary-700',
  delayed: 'bg-amber-50 text-amber-800',
  inactive: 'bg-slate-100 text-slate-600',
}

const formatDistance = (meters: number) => {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
  return `${Math.round(meters)} m`
}

const getLocationStatusLabel = (status?: LocationPoi['liveStatus']) => {
  if (!status) return 'listed'
  return status.replace(/_/g, ' ')
}

const getRouteTrackingState = (route: CollectionRoute) => {
  if (route.status !== 'active') return 'inactive'

  const now = new Date()
  const nextCollection = new Date(route.nextCollectionDate)
  const [startHour = 0, startMinute = 0] = route.startTimeWindow.split(':').map(Number)
  const [endHour = 23, endMinute = 59] = route.endTimeWindow.split(':').map(Number)
  const start = new Date(nextCollection)
  start.setHours(startHour, startMinute, 0, 0)
  const end = new Date(nextCollection)
  end.setHours(endHour, endMinute, 0, 0)

  if (now >= start && now <= end) return 'live'
  if (now > end && !route.lastCompletedAt) return 'delayed'
  return 'upcoming'
}

const Locations: React.FC = () => {
  const { user } = useAuth()
  const [locationType, setLocationType] = useState<'all' | LocationPoi['category']>('all')

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

  const {
    data: routes,
    isLoading: isRoutesLoading,
    isError: isRoutesError,
  } = useQuery({
    queryKey: ['collection-routes-live', user?.role],
    queryFn: user?.role === 'resident' ? collectionRoutesApi.getMyRoutes : collectionRoutesApi.getRoutes,
    refetchInterval: 15000,
  })

  const filteredLocations = useMemo(() => {
    const results = nearby?.results || []
    if (locationType === 'all') return results
    return results.filter((location) => location.category === locationType)
  }, [nearby?.results, locationType])

  const largeCollectionPoints = filteredLocations.filter(
    (location) => location.category === 'collection_point' && location.capacity === 'large',
  )
  const binLocations = filteredLocations.filter((location) => location.category === 'bin')
  const liveRoutes = routes?.map((route) => ({ route, trackingState: getRouteTrackingState(route) })) || []

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Amuwo Odofin services"
        title="Nearby bins and collection points"
        description="Find public bins and drop-off points close to Amuwo Odofin, with directions and current status."
        meta={
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Area</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{center.label}</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">Nearby bins</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-900">{binLocations.length}</p>
            </div>
            <div className="rounded-xl border border-primary-100 bg-primary-50/80 px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary-700">Updates</p>
              <p className="mt-2 text-sm font-semibold text-primary-900">Auto-refresh</p>
            </div>
          </div>
        }
      />

      <Surface title="Location finder" subtitle="Filter public bins and larger drop-off points near Amuwo Odofin.">
        <div className="mb-4 flex flex-wrap gap-2">
          {(['all', 'bin', 'collection_point'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setLocationType(filter)}
              className={`btn h-9 px-3 ${locationType === filter ? 'btn-primary' : 'btn-secondary'}`}
            >
              {filter === 'all' ? 'All locations' : filter.replace('_', ' ')}
            </button>
          ))}
          <a
            href={buildGoogleMapsUrl(center.latitude, center.longitude, center.label)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary h-9 px-3"
          >
            <LocateFixed className="mr-2 h-4 w-4" />
            Open area map
          </a>
        </div>

        {isLocationsError ? (
          <StatePanel tone="error" title="Couldn't load locations" description="Bin and collection point data is temporarily unavailable." />
        ) : isLocationsLoading ? (
          <StatePanel tone="loading" title="Loading locations" description="Checking nearby bins and collection points." />
        ) : !filteredLocations.length ? (
          <StatePanel tone="empty" title="No locations found" description="Try widening the area or completing your profile location." />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr,0.85fr]">
            <div className="space-y-3">
              {filteredLocations.map((location) => (
                <article key={location.id} className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5">
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
                          {formatDistance(location.distanceMeters)} away - {location.capacity || 'listed'} capacity
                        </p>
                        {location.acceptedWaste?.length ? (
                          <p className="mt-2 text-xs text-slate-500">Accepts: {location.acceptedWaste.join(', ')}</p>
                        ) : null}
                      </div>
                    </div>
                    <a
                      href={buildGoogleMapsUrl(location.latitude, location.longitude, location.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-sm font-medium text-primary-700 hover:text-primary-800"
                    >
                      Directions
                      <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </a>
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary-700" />
                <h3 className="text-sm font-semibold text-slate-950">Large collection points</h3>
              </div>
              <div className="mt-4 space-y-3">
                {largeCollectionPoints.length ? (
                  largeCollectionPoints.map((point) => (
                    <a
                      key={point.id}
                      href={buildGoogleMapsUrl(point.latitude, point.longitude, point.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 transition hover:border-primary-200 hover:bg-primary-50/30"
                    >
                      <p className="text-sm font-semibold text-slate-950">{point.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{point.address || point.area}</p>
                      <p className="mt-2 text-xs font-medium text-primary-700">{formatDistance(point.distanceMeters)} away - open map</p>
                    </a>
                  ))
                ) : (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                    No large collection point is listed in this filter. Switch to all locations or update your profile area.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Surface>

      <Surface title="Route updates" subtitle="Current collection routes refresh automatically.">
        {isRoutesError ? (
          <StatePanel tone="error" title="Couldn't load live routes" description="Route tracking is temporarily unavailable." />
        ) : isRoutesLoading ? (
          <StatePanel tone="loading" title="Loading live tracking" description="Checking current route windows and truck assignments." />
        ) : !liveRoutes.length ? (
          <StatePanel tone="empty" title="No active route assigned" description="No collection route is currently attached to this area." />
        ) : (
          <div className="space-y-3">
            {liveRoutes.map(({ route, trackingState }) => (
              <article key={route.id} className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${routeStatusStyles[trackingState]}`}>
                        {trackingState}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                        {route.routeCode}
                      </span>
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-slate-950">{route.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{route.street}, {route.ward}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3 lg:min-w-[520px]">
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Truck</p>
                      <p className="mt-2 font-semibold text-slate-950">{route.truckCode || 'Pending'}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Window</p>
                      <p className="mt-2 font-semibold text-slate-950">{route.startTimeWindow} - {route.endTimeWindow}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Next stop</p>
                      <p className="mt-2 font-semibold text-slate-950">{formatDayTime(route.nextCollectionDate)}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${
                      trackingState === 'live'
                        ? 'w-2/3 bg-emerald-500'
                        : trackingState === 'delayed'
                          ? 'w-full bg-amber-500'
                          : trackingState === 'inactive'
                            ? 'w-1/4 bg-slate-400'
                            : 'w-1/3 bg-primary-500'
                    }`}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </Surface>
    </div>
  )
}

export default Locations
