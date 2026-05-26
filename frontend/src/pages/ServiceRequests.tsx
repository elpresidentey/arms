import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import LocationField from '../components/LocationField'
import PageHeader from '../components/PageHeader'
import StatePanel from '../components/StatePanel'
import Surface from '../components/Surface'
import { useAuth } from '../contexts/AuthContext'
import { serviceRequestsApi } from '../services/api'
import { ServiceRequest } from '../types'
import { getErrorMessage } from '../utils/errors'
import { formatDayTime } from '../utils/format'

const requestTypes = [
  { value: 'bin_replacement', label: 'Bin replacement' },
  { value: 'new_bin', label: 'New bin request' },
  { value: 'bulky_pickup', label: 'Bulky waste pickup' },
  { value: 'missed_pickup_follow_up', label: 'Missed pickup follow-up' },
  { value: 'service_transfer', label: 'Service transfer' },
  { value: 'property_onboarding', label: 'Property onboarding' },
] as const

const priorityOptions = ['low', 'medium', 'high', 'urgent'] as const

const updateStatusOptions: ServiceRequest['status'][] = [
  'submitted',
  'triaged',
  'scheduled',
  'in_progress',
  'completed',
  'escalated',
  'cancelled',
]

const statusStyles: Record<string, string> = {
  submitted: 'bg-slate-100 text-slate-700',
  triaged: 'bg-primary-50 text-primary-700',
  scheduled: 'bg-amber-50 text-amber-700',
  in_progress: 'bg-orange-50 text-orange-700',
  completed: 'bg-emerald-50 text-emerald-700',
  escalated: 'bg-rose-50 text-rose-700',
  cancelled: 'bg-slate-200 text-slate-600',
}

type ServiceRequestFormState = {
  type: ServiceRequest['type']
  title: string
  description: string
  address: string
  ward: string
  street: string
  latitude?: number
  longitude?: number
  priority: ServiceRequest['priority']
  preferredDate: string
}

const ServiceRequests: React.FC = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const isResident = user?.role === 'resident'
  const [formData, setFormData] = useState<ServiceRequestFormState>({
    type: 'bin_replacement',
    title: '',
    description: '',
    address: user?.address || '',
    ward: user?.ward || '',
    street: user?.street || '',
    latitude: user?.latitude,
    longitude: user?.longitude,
    priority: 'medium',
    preferredDate: '',
  })

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: Partial<ServiceRequest> }) =>
      serviceRequestsApi.updateRequest(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] })
      queryClient.invalidateQueries({ queryKey: ['service-requests-summary'] })
      toast.success('Request updated.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not update request.'))
    },
  })

  const { data: requests, isLoading, isError } = useQuery({
    queryKey: ['service-requests', user?.role],
    queryFn: user?.role === 'resident' ? serviceRequestsApi.getMyRequests : serviceRequestsApi.getRequests,
  })

  const { data: summary } = useQuery({
    queryKey: ['service-requests-summary'],
    queryFn: serviceRequestsApi.getSummary,
  })

  const createMutation = useMutation({
    mutationFn: serviceRequestsApi.createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] })
      queryClient.invalidateQueries({ queryKey: ['service-requests-summary'] })
      setShowForm(false)
      setFormData({
        type: 'bin_replacement',
        title: '',
        description: '',
        address: user?.address || '',
        ward: user?.ward || '',
        street: user?.street || '',
        latitude: user?.latitude,
        longitude: user?.longitude,
        priority: 'medium',
        preferredDate: '',
      })
      toast.success('Service request submitted successfully.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not submit service request.'))
    },
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    createMutation.mutate({
      ...formData,
      preferredDate: formData.preferredDate ? new Date(formData.preferredDate).toISOString() : undefined,
    })
  }

  const handleUpdate = (id: string, next: Partial<ServiceRequest>) => {
    const payload: Partial<ServiceRequest> = {
      status: next.status,
      priority: next.priority,
      scheduledFor: next.scheduledFor,
      resolutionNotes: next.resolutionNotes,
    }

    if (payload.scheduledFor) {
      payload.scheduledFor = new Date(payload.scheduledFor).toISOString()
    }

    updateMutation.mutate({ id, data: payload })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Requests"
        title={isResident ? 'Refuse service requests' : 'Resident refuse request queue'}
        description={
          isResident
            ? 'Request bin replacement, bulky refuse pickup, missed-collection follow-up, or other household refuse support.'
            : 'Review, schedule, and close refuse service requests submitted by residents.'
        }
        action={
          isResident ? (
            <button type="button" onClick={() => setShowForm((current) => !current)} className="btn btn-primary h-11 px-4">
              <Plus className="mr-2 h-4 w-4" />
              {showForm ? 'Close form' : 'New request'}
            </button>
          ) : undefined
        }
        meta={
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
              <p className="label text-slate-500">Total requests</p>
              <p className="mt-2 heading-3 text-slate-950">{summary?.totalRequests ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-primary-100 bg-primary-50/80 px-4 py-3 shadow-sm">
              <p className="label text-primary-700">Open</p>
              <p className="mt-2 heading-3 text-primary-900">{summary?.openRequests ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3 shadow-sm">
              <p className="label text-amber-700">Overdue</p>
              <p className="mt-2 heading-3 text-amber-900">{summary?.overdueRequests ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-3 shadow-sm">
              <p className="label text-rose-700">Urgent</p>
              <p className="mt-2 heading-3 text-rose-900">{summary?.urgentRequests ?? 0}</p>
            </div>
          </div>
        }
      />

      {!isResident ? (
        <Surface title="Operations oversight" subtitle="Requests are submitted by residents. Staff accounts manage scheduling, priority, and resolution.">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="metric-panel px-4 py-4">
              <p className="label text-slate-500">Request creation</p>
              <p className="mt-2 heading-4 text-slate-950">Resident only</p>
              <p className="mt-2 body-small text-slate-500">Admin and staff accounts cannot create household refuse requests.</p>
            </div>
            <div className="metric-panel px-4 py-4">
              <p className="label text-slate-500">Staff action</p>
              <p className="mt-2 heading-4 text-slate-950">Schedule and resolve</p>
              <p className="mt-2 body-small text-slate-500">Use each row to update status, priority, schedule, and field notes.</p>
            </div>
            <div className="metric-panel px-4 py-4">
              <p className="label text-slate-500">Refuse requests</p>
              <p className="mt-2 heading-4 text-slate-950">Field queue</p>
              <p className="mt-2 body-small text-slate-500">Every request remains tied to a resident address, ward, and street.</p>
            </div>
          </div>
        </Surface>
      ) : null}

      {isResident && showForm && (
        <Surface title="Create refuse service request" subtitle="Use this for bin replacement, bulky pickup, or missed refuse collection follow-up.">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="request-type" className="mb-1.5 block text-sm font-medium text-slate-700">Request type</label>
                <select
                  id="request-type"
                  className="input"
                  value={formData.type}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, type: event.target.value as ServiceRequest['type'] }))
                  }
                >
                  {requestTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="request-priority" className="mb-1.5 block text-sm font-medium text-slate-700">Priority</label>
                <select
                  id="request-priority"
                  className="input"
                  value={formData.priority}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, priority: event.target.value as ServiceRequest['priority'] }))
                  }
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>{priority[0].toUpperCase() + priority.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="request-title" className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
              <input
                id="request-title"
                type="text"
                className="input"
                placeholder="Short summary of what you need"
                value={formData.title}
                onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
            </div>
            <div>
              <label htmlFor="request-description" className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                id="request-description"
                className="input min-h-[120px] resize-none py-3"
                placeholder="Explain the service issue or request in enough detail for field teams to act."
                value={formData.description}
                onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                required
              />
            </div>
            <div>
              <label htmlFor="preferred-date" className="mb-1.5 block text-sm font-medium text-slate-700">Preferred date</label>
              <input
                id="preferred-date"
                type="datetime-local"
                className="input"
                value={formData.preferredDate}
                onChange={(event) => setFormData((prev) => ({ ...prev, preferredDate: event.target.value }))}
              />
            </div>
            <LocationField
              value={formData.address}
              streetValue={formData.street}
              wardValue={formData.ward}
              latitude={formData.latitude}
              longitude={formData.longitude}
              required
              onAddressChange={(value) => setFormData((prev) => ({ ...prev, address: value }))}
              onLocationSelect={(location) =>
                setFormData((prev) => ({
                  ...prev,
                  address: location.address || prev.address,
                  street: location.street || prev.street,
                  ward: location.ward || prev.ward,
                  latitude: location.latitude,
                  longitude: location.longitude,
                }))
              }
            />
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">Requests create trackable due dates so refuse operations teams can manage backlog and escalations.</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary h-11 px-4">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="btn btn-primary h-11 px-4">
                  {createMutation.isPending ? 'Submitting...' : 'Submit request'}
                </button>
              </div>
            </div>
          </form>
        </Surface>
      )}

      <Surface title="Tracked requests" subtitle="Each request carries its own number, status, and due date.">
        {isError ? (
          <StatePanel tone="error" title="Couldn't load requests" description="Refuse service requests are temporarily unavailable." />
        ) : isLoading ? (
          <StatePanel tone="loading" title="Loading requests" description="Fetching resident refuse requests." />
        ) : !requests?.length ? (
          <StatePanel
            tone="empty"
            title="No requests yet"
            description={isResident ? 'Submit the first refuse request to begin tracking household support actions.' : 'Resident refuse requests will appear here for operations review.'}
          />
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <article key={request.id} className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-white">
                        {request.requestNumber}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[request.status] ?? statusStyles.submitted}`}>
                        {request.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-950">{request.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{request.description}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    <p><span className="font-semibold text-slate-900">Priority:</span> {request.priority}</p>
                    <p className="mt-1"><span className="font-semibold text-slate-900">Due:</span> {formatDayTime(request.slaDueAt)}</p>
                    <p className="mt-1"><span className="font-semibold text-slate-900">Preferred:</span> {formatDayTime(request.preferredDate)}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                  <p className="font-medium text-slate-900">{request.type.replace(/_/g, ' ')}</p>
                  <p className="mt-1">{request.address}</p>
                  {request.resolutionNotes ? <p className="mt-2 text-slate-500">Resolution: {request.resolutionNotes}</p> : null}
                </div>

                {user?.role !== 'resident' ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Status
                        </label>
                        <select
                          className="input"
                          defaultValue={request.status}
                          onChange={(event) =>
                            handleUpdate(request.id, {
                              status: event.target.value as ServiceRequest['status'],
                              priority: request.priority,
                              scheduledFor: request.scheduledFor,
                              resolutionNotes: request.resolutionNotes,
                            })
                          }
                        >
                          {updateStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Priority
                        </label>
                        <select
                          className="input"
                          defaultValue={request.priority}
                          onChange={(event) =>
                            handleUpdate(request.id, {
                              status: request.status,
                              priority: event.target.value as ServiceRequest['priority'],
                              scheduledFor: request.scheduledFor,
                              resolutionNotes: request.resolutionNotes,
                            })
                          }
                        >
                          {priorityOptions.map((priority) => (
                            <option key={priority} value={priority}>
                              {priority[0].toUpperCase() + priority.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Scheduled for
                        </label>
                        <input
                          className="input"
                          type="datetime-local"
                          defaultValue={request.scheduledFor ? request.scheduledFor.slice(0, 16) : ''}
                          onBlur={(event) =>
                            handleUpdate(request.id, {
                              status: request.status,
                              priority: request.priority,
                              scheduledFor: event.target.value || undefined,
                              resolutionNotes: request.resolutionNotes,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Resolution notes
                        </label>
                        <input
                          className="input"
                          type="text"
                          placeholder="Optional"
                          defaultValue={request.resolutionNotes || ''}
                          onBlur={(event) =>
                            handleUpdate(request.id, {
                              status: request.status,
                              priority: request.priority,
                              scheduledFor: request.scheduledFor,
                              resolutionNotes: event.target.value || undefined,
                            })
                          }
                        />
                      </div>
                    </div>
                    {updateMutation.isPending ? (
                      <p className="mt-3 text-xs text-slate-500">Saving changes...</p>
                    ) : null}
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

export default ServiceRequests
