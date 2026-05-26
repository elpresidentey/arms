import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import StatePanel from '../components/StatePanel'
import Surface from '../components/Surface'
import { useAuth } from '../contexts/AuthContext'
import { collectionRoutesApi } from '../services/api'
import { CollectionRoute } from '../types'
import { getErrorMessage } from '../utils/errors'
import { formatDayTime } from '../utils/format'
import { buildGoogleMapsSearchUrl } from '../utils/maps'

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  disrupted: 'bg-amber-50 text-amber-800',
  inactive: 'bg-slate-100 text-slate-600',
}

const frequencyOptions: CollectionRoute['frequency'][] = ['daily', 'weekly', 'biweekly', 'monthly']
const routeStatusOptions: CollectionRoute['status'][] = ['active', 'disrupted', 'inactive']

type RouteFormState = {
  name: string
  ward: string
  street: string
  zone: string
  frequency: CollectionRoute['frequency']
  serviceDay: string
  startTimeWindow: string
  endTimeWindow: string
  nextCollectionDate: string
  truckCode: string
  notes: string
}

const emptyRouteForm: RouteFormState = {
  name: '',
  ward: '',
  street: '',
  zone: '',
  frequency: 'weekly',
  serviceDay: '',
  startTimeWindow: '07:00',
  endTimeWindow: '11:00',
  nextCollectionDate: '',
  truckCode: '',
  notes: '',
}

const CollectionSchedules: React.FC = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [truckInputs, setTruckInputs] = useState<Record<string, string>>({})
  const [showRouteForm, setShowRouteForm] = useState(false)
  const [routeForm, setRouteForm] = useState<RouteFormState>(emptyRouteForm)
  const isResident = user?.role === 'resident'

  const { data: routes, isLoading, isError } = useQuery({
    queryKey: ['collection-routes', user?.role],
    queryFn: isResident ? collectionRoutesApi.getMyRoutes : collectionRoutesApi.getRoutes,
  })

  const { data: summary } = useQuery({
    queryKey: ['collection-routes-summary'],
    queryFn: collectionRoutesApi.getSummary,
  })

  const createRouteMutation = useMutation({
    mutationFn: collectionRoutesApi.createRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-routes'] })
      queryClient.invalidateQueries({ queryKey: ['collection-routes-summary'] })
      setRouteForm(emptyRouteForm)
      setShowRouteForm(false)
      toast.success('Route created and published.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not create this route.'))
    },
  })

  const updateRouteMutation = useMutation({
    mutationFn: (payload: { id: string; data: Partial<CollectionRoute> }) =>
      collectionRoutesApi.updateRoute(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-routes'] })
      queryClient.invalidateQueries({ queryKey: ['collection-routes-summary'] })
      toast.success('Route updated.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not update this route.'))
    },
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => collectionRoutesApi.completeRoute(id, { notes: 'Marked complete from operations console.' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-routes'] })
      queryClient.invalidateQueries({ queryKey: ['collection-routes-summary'] })
      queryClient.invalidateQueries({ queryKey: ['waste-collections'] })
      toast.success('Route completed and collection records generated.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not complete this route.'))
    },
  })

  const residentConfirmationMutation = useMutation({
    mutationFn: ({ id, observedTruckCode }: { id: string; observedTruckCode: string }) =>
      collectionRoutesApi.confirmResidentCollection(id, { observedTruckCode }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collection-routes'] })
      queryClient.invalidateQueries({ queryKey: ['waste-collections'] })
      setTruckInputs((current) => ({ ...current, [variables.id]: '' }))
      toast.success('Refuse collection confirmed for your area.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'The arriving truck does not match the scheduled truck for this route.'))
    },
  })

  const handleResidentConfirmation = (routeId: string) => {
    residentConfirmationMutation.mutate({
      id: routeId,
      observedTruckCode: truckInputs[routeId] || '',
    })
  }

  const handleCreateRoute = (event: React.FormEvent) => {
    event.preventDefault()
    createRouteMutation.mutate({
      ...routeForm,
      zone: routeForm.zone || undefined,
      truckCode: routeForm.truckCode.trim().toUpperCase() || undefined,
      notes: routeForm.notes || undefined,
      nextCollectionDate: new Date(routeForm.nextCollectionDate).toISOString(),
    })
  }

  const handleRouteUpdate = (id: string, data: Partial<CollectionRoute>) => {
    const payload = { ...data }
    if (typeof payload.truckCode === 'string') {
      payload.truckCode = payload.truckCode.trim().toUpperCase() || undefined
    }
    if (payload.nextCollectionDate) {
      payload.nextCollectionDate = new Date(payload.nextCollectionDate).toISOString()
    }
    updateRouteMutation.mutate({ id, data: payload })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Schedules"
        title="Collection schedules"
        description="Track active ward and street routes, see the next service window, and close completed runs into collection history."
        action={
          !isResident ? (
            <button type="button" onClick={() => setShowRouteForm((current) => !current)} className="btn btn-primary h-11 px-4">
              <Plus className="mr-2 h-4 w-4" />
              {showRouteForm ? 'Close form' : 'New route'}
            </button>
          ) : undefined
        }
        meta={
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
              <p className="label text-slate-500">Total routes</p>
              <p className="mt-2 heading-3 text-slate-950">{summary?.totalRoutes ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 shadow-sm">
              <p className="label text-emerald-700">Active</p>
              <p className="mt-2 heading-3 text-emerald-900">{summary?.activeRoutes ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3 shadow-sm">
              <p className="label text-amber-700">Due today</p>
              <p className="mt-2 heading-3 text-amber-900">{summary?.dueToday ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-3 shadow-sm">
              <p className="label text-rose-700">Disrupted</p>
              <p className="mt-2 heading-3 text-rose-900">{summary?.disruptedRoutes ?? 0}</p>
            </div>
          </div>
        }
      />

      {!isResident && showRouteForm ? (
        <Surface title="Create collection route" subtitle="Publish a real ward and street schedule, assign a truck when one is available, and make it visible to matching residents.">
          <form onSubmit={handleCreateRoute} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div>
                <label htmlFor="route-name" className="mb-1.5 block text-sm font-medium text-slate-700">Route name</label>
                <input
                  id="route-name"
                  className="input"
                  value={routeForm.name}
                  onChange={(event) => setRouteForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="route-ward" className="mb-1.5 block text-sm font-medium text-slate-700">Ward</label>
                <input
                  id="route-ward"
                  className="input"
                  value={routeForm.ward}
                  onChange={(event) => setRouteForm((prev) => ({ ...prev, ward: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="route-street" className="mb-1.5 block text-sm font-medium text-slate-700">Street</label>
                <input
                  id="route-street"
                  className="input"
                  value={routeForm.street}
                  onChange={(event) => setRouteForm((prev) => ({ ...prev, street: event.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              <div>
                <label htmlFor="route-zone" className="mb-1.5 block text-sm font-medium text-slate-700">Zone</label>
                <input
                  id="route-zone"
                  className="input"
                  value={routeForm.zone}
                  onChange={(event) => setRouteForm((prev) => ({ ...prev, zone: event.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="route-frequency" className="mb-1.5 block text-sm font-medium text-slate-700">Frequency</label>
                <select
                  id="route-frequency"
                  className="input"
                  value={routeForm.frequency}
                  onChange={(event) => setRouteForm((prev) => ({ ...prev, frequency: event.target.value as CollectionRoute['frequency'] }))}
                >
                  {frequencyOptions.map((frequency) => (
                    <option key={frequency} value={frequency}>{frequency.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="route-day" className="mb-1.5 block text-sm font-medium text-slate-700">Service day</label>
                <input
                  id="route-day"
                  className="input"
                  value={routeForm.serviceDay}
                  onChange={(event) => setRouteForm((prev) => ({ ...prev, serviceDay: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="route-next" className="mb-1.5 block text-sm font-medium text-slate-700">Next collection</label>
                <input
                  id="route-next"
                  type="datetime-local"
                  className="input"
                  value={routeForm.nextCollectionDate}
                  onChange={(event) => setRouteForm((prev) => ({ ...prev, nextCollectionDate: event.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              <div>
                <label htmlFor="route-start" className="mb-1.5 block text-sm font-medium text-slate-700">Starts</label>
                <input
                  id="route-start"
                  type="time"
                  className="input"
                  value={routeForm.startTimeWindow}
                  onChange={(event) => setRouteForm((prev) => ({ ...prev, startTimeWindow: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="route-end" className="mb-1.5 block text-sm font-medium text-slate-700">Ends</label>
                <input
                  id="route-end"
                  type="time"
                  className="input"
                  value={routeForm.endTimeWindow}
                  onChange={(event) => setRouteForm((prev) => ({ ...prev, endTimeWindow: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="route-truck" className="mb-1.5 block text-sm font-medium text-slate-700">Truck code</label>
                <input
                  id="route-truck"
                  className="input"
                  value={routeForm.truckCode}
                  onChange={(event) => setRouteForm((prev) => ({ ...prev, truckCode: event.target.value.toUpperCase() }))}
                />
              </div>
              <div>
                <label htmlFor="route-notes" className="mb-1.5 block text-sm font-medium text-slate-700">Notes</label>
                <input
                  id="route-notes"
                  className="input"
                  value={routeForm.notes}
                  onChange={(event) => setRouteForm((prev) => ({ ...prev, notes: event.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowRouteForm(false)} className="btn btn-secondary h-11 px-4">Cancel</button>
              <button type="submit" disabled={createRouteMutation.isPending} className="btn btn-primary h-11 px-4">
                {createRouteMutation.isPending ? 'Publishing...' : 'Publish route'}
              </button>
            </div>
          </form>
        </Surface>
      ) : null}

      <Surface title="Route board" subtitle="Residents can confirm their next collection window while operations staff can close serviced routes.">
        {isError ? (
          <StatePanel tone="error" title="Couldn't load schedules" description="Route schedules are temporarily unavailable." />
        ) : isLoading ? (
          <StatePanel tone="loading" title="Loading schedules" description="Fetching street and ward route assignments." />
        ) : !routes?.length ? (
          <StatePanel tone="empty" title="No schedules yet" description="Add routes to begin publishing service timetables." />
        ) : (
          <div className="space-y-4">
            {routes.map((route) => (
              <article key={route.id} className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-primary-700">
                        {route.routeCode}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[route.status] ?? statusStyles.inactive}`}>
                        {route.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-950">{route.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {route.street}, {route.ward}{route.zone ? `, ${route.zone}` : ''}
                    </p>
                    <a
                      href={buildGoogleMapsSearchUrl(`${route.street}, ${route.ward}${route.zone ? `, ${route.zone}` : ''}`)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-sm font-medium text-primary-700 hover:text-primary-800"
                    >
                      Open in Maps
                    </a>
                  </div>
                  {user?.role !== 'resident' && route.status === 'active' ? (
                    <button
                      type="button"
                      disabled={completeMutation.isPending}
                      onClick={() => completeMutation.mutate(route.id)}
                      className="btn btn-primary h-11 px-4"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark route complete
                    </button>
                  ) : null}
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Next collection</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatDayTime(route.nextCollectionDate)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Service window</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {route.serviceDay}, {route.startTimeWindow} - {route.endTimeWindow}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Truck and notes</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{route.truckCode || 'Truck pending assignment'}</p>
                    <p className="mt-1 text-xs text-slate-500">{route.notes || 'No operations notes yet.'}</p>
                  </div>
                </div>
                {user?.role !== 'resident' ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Route status
                        </label>
                        <select
                          className="input"
                          defaultValue={route.status}
                          onChange={(event) => handleRouteUpdate(route.id, { status: event.target.value as CollectionRoute['status'] })}
                        >
                          {routeStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Truck code
                        </label>
                        <input
                          className="input"
                          defaultValue={route.truckCode || ''}
                          onBlur={(event) => handleRouteUpdate(route.id, { truckCode: event.target.value })}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Next collection
                        </label>
                        <input
                          className="input"
                          type="datetime-local"
                          defaultValue={route.nextCollectionDate ? route.nextCollectionDate.slice(0, 16) : ''}
                          onBlur={(event) =>
                            event.target.value
                              ? handleRouteUpdate(route.id, { nextCollectionDate: event.target.value })
                              : undefined
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Notes
                        </label>
                        <input
                          className="input"
                          defaultValue={route.notes || ''}
                          onBlur={(event) => handleRouteUpdate(route.id, { notes: event.target.value || undefined })}
                        />
                      </div>
                    </div>
                    {updateRouteMutation.isPending ? (
                      <p className="mt-3 text-xs text-slate-500">Saving route changes...</p>
                    ) : null}
                  </div>
                ) : null}
                {user?.role === 'resident' ? (
                  <div className="mt-4 rounded-2xl border border-primary-100 bg-primary-50/60 px-4 py-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                      <div className="max-w-2xl">
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary-700">
                          Resident confirmation
                        </p>
                        <p className="mt-2 text-sm text-slate-700">
                          When the truck arrives, enter the truck code shown on it. The app will only mark refuse as
                          collected if it matches the truck scheduled for your street.
                        </p>
                      </div>
                      <div className="w-full max-w-md space-y-2">
                        <label htmlFor={`truck-code-${route.id}`} className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                          Observed truck code
                        </label>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            id={`truck-code-${route.id}`}
                            type="text"
                            className="input"
                            placeholder={route.truckCode ? `Expected: ${route.truckCode}` : 'Truck code pending assignment'}
                            value={truckInputs[route.id] || ''}
                            onChange={(event) =>
                              setTruckInputs((current) => ({
                                ...current,
                                [route.id]: event.target.value.toUpperCase(),
                              }))
                            }
                            disabled={!route.truckCode}
                          />
                          <button
                            type="button"
                            className="btn btn-primary h-11 px-4"
                            disabled={!route.truckCode || residentConfirmationMutation.isPending}
                            onClick={() => handleResidentConfirmation(route.id)}
                          >
                            Refuse collected
                          </button>
                        </div>
                        <p className="text-xs text-slate-500">
                          Scheduled truck for this area: <span className="font-semibold text-slate-700">{route.truckCode || 'Not assigned yet'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </Surface>
    </div>
  )
}

export default CollectionSchedules
