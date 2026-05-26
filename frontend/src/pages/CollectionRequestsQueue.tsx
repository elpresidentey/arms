import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Clock, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import StatePanel from '../components/StatePanel'
import Surface from '../components/Surface'
import { collectionRequestsApi, collectionRoutesApi } from '../services/api'
import { CollectionRequestType } from '../types'
import { getErrorMessage } from '../utils/errors'
import { formatDate } from '../utils/format'

const typeColors: Record<CollectionRequestType, string> = {
  routine: 'bg-blue-100 text-blue-800',
  urgent: 'bg-red-100 text-red-800',
  bulky: 'bg-orange-100 text-orange-800',
  special: 'bg-purple-100 text-purple-800',
}

const typeIcons: Record<CollectionRequestType, React.ReactNode> = {
  routine: <Clock className="h-4 w-4" />,
  urgent: <Zap className="h-4 w-4" />,
  bulky: <AlertCircle className="h-4 w-4" />,
  special: <AlertCircle className="h-4 w-4" />,
}

const CollectionRequestsQueue: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [scheduleData, setScheduleData] = useState<Record<string, { routeId: string; scheduledDate: string }>>({})

  const { data: requests, isLoading, isError } = useQuery({
    queryKey: ['pending-collection-requests'],
    queryFn: () => collectionRequestsApi.getAllRequests('pending'),
  })

  const { data: routes } = useQuery({
    queryKey: ['collection-routes'],
    queryFn: collectionRoutesApi.getRoutes,
  })

  const { data: stats } = useQuery({
    queryKey: ['collection-requests-stats'],
    queryFn: collectionRequestsApi.getStatistics,
  })

  const scheduleMutation = useMutation({
    mutationFn: (payload: { requestId: string; routeId: string; scheduledDate: string }) =>
      collectionRequestsApi.scheduleRequest(payload.requestId, payload.routeId, payload.scheduledDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-collection-requests'] })
      queryClient.invalidateQueries({ queryKey: ['collection-requests-stats'] })
      setSelectedRequest(null)
      setScheduleData({})
      toast.success('Request scheduled successfully')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not schedule request'))
    },
  })

  const handleSchedule = (requestId: string) => {
    const data = scheduleData[requestId]
    if (!data || !data.routeId || !data.scheduledDate) {
      toast.error('Please select a route and scheduled date')
      return
    }
    scheduleMutation.mutate({ requestId, ...data })
  }

  const urgentRequests = requests?.filter((r) => r.type === 'urgent') || []

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Collection requests queue"
        description="Review and schedule resident collection requests"
        meta={
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
              <p className="label text-slate-500">Pending</p>
              <p className="mt-2 heading-3 text-yellow-600">{stats?.pending || 0}</p>
            </div>
            <div className="rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 shadow-sm">
              <p className="label text-red-700">Urgent</p>
              <p className="mt-2 heading-3 text-red-900">{stats?.byType?.urgent || 0}</p>
            </div>
            <div className="rounded-2xl border border-orange-100 bg-orange-50/80 px-4 py-3 shadow-sm">
              <p className="label text-orange-700">Bulky</p>
              <p className="mt-2 heading-3 text-orange-900">{stats?.byType?.bulky || 0}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 shadow-sm">
              <p className="label text-emerald-700">Scheduled</p>
              <p className="mt-2 heading-3 text-emerald-900">{stats?.scheduled || 0}</p>
            </div>
          </div>
        }
      />

      {urgentRequests.length > 0 && (
        <Surface title="⚠️ Urgent requests" subtitle="These requests need immediate attention">
          <div className="space-y-3">
            {urgentRequests.map((request) => (
              <div key={request.id} className="rounded-2xl border-2 border-red-200 bg-red-50 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {request.resident.firstName} {request.resident.lastName}
                    </h3>
                    <p className="text-sm text-slate-600">{request.resident.address}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {request.resident.street}, {request.resident.ward}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1 ${typeColors[request.type]}`}>
                    {typeIcons[request.type]}
                    {request.type}
                  </span>
                </div>

                {request.description && (
                  <p className="text-sm text-slate-700 mb-3 bg-white/50 rounded p-2">{request.description}</p>
                )}

                {selectedRequest === request.id ? (
                  <div className="space-y-3 bg-white rounded-lg p-3">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">Select route</label>
                        <select
                          value={scheduleData[request.id]?.routeId || ''}
                          onChange={(e) =>
                            setScheduleData({
                              ...scheduleData,
                              [request.id]: { ...scheduleData[request.id], routeId: e.target.value },
                            })
                          }
                          className="input"
                        >
                          <option value="">Choose a route...</option>
                          {routes?.map((route) => (
                            <option key={route.id} value={route.id}>
                              {route.name} - {route.street}, {route.ward}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">Scheduled date</label>
                        <input
                          type="datetime-local"
                          value={scheduleData[request.id]?.scheduledDate || ''}
                          onChange={(e) =>
                            setScheduleData({
                              ...scheduleData,
                              [request.id]: { ...scheduleData[request.id], scheduledDate: e.target.value },
                            })
                          }
                          className="input"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSchedule(request.id)}
                        disabled={scheduleMutation.isPending}
                        className="btn btn-primary flex-1"
                      >
                        {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule request'}
                      </button>
                      <button
                        onClick={() => setSelectedRequest(null)}
                        className="btn btn-secondary flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedRequest(request.id)}
                    className="btn btn-primary w-full"
                  >
                    Schedule this request
                  </button>
                )}
              </div>
            ))}
          </div>
        </Surface>
      )}

      <Surface title="Pending requests" subtitle="Review and schedule collection requests">
        {isError ? (
          <StatePanel tone="error" title="Couldn't load requests" description="Collection requests are temporarily unavailable." />
        ) : isLoading ? (
          <StatePanel tone="loading" title="Loading requests" description="Fetching pending collection requests." />
        ) : !requests?.length ? (
          <StatePanel tone="empty" title="No pending requests" description="All collection requests have been scheduled or completed." />
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {request.resident.firstName} {request.resident.lastName}
                        </h3>
                        <p className="text-sm text-slate-600">{request.resident.address}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {request.resident.street}, {request.resident.ward}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1 ${typeColors[request.type]}`}>
                        {typeIcons[request.type]}
                        {request.type}
                      </span>
                    </div>

                    {request.description && (
                      <p className="text-sm text-slate-600 mt-2">{request.description}</p>
                    )}

                    {request.preferredDate && (
                      <p className="text-xs text-slate-500 mt-2">
                        Preferred date: <span className="font-medium">{formatDate(request.preferredDate)}</span>
                      </p>
                    )}
                  </div>

                  {selectedRequest === request.id ? (
                    <div className="w-full lg:w-auto space-y-2">
                      <select
                        value={scheduleData[request.id]?.routeId || ''}
                        onChange={(e) =>
                          setScheduleData({
                            ...scheduleData,
                            [request.id]: { ...scheduleData[request.id], routeId: e.target.value },
                          })
                        }
                        className="input w-full"
                      >
                        <option value="">Select route...</option>
                        {routes?.map((route) => (
                          <option key={route.id} value={route.id}>
                            {route.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="datetime-local"
                        value={scheduleData[request.id]?.scheduledDate || ''}
                        onChange={(e) =>
                          setScheduleData({
                            ...scheduleData,
                            [request.id]: { ...scheduleData[request.id], scheduledDate: e.target.value },
                          })
                        }
                        className="input w-full"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSchedule(request.id)}
                          disabled={scheduleMutation.isPending}
                          className="btn btn-primary flex-1"
                        >
                          Schedule
                        </button>
                        <button
                          onClick={() => setSelectedRequest(null)}
                          className="btn btn-secondary flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedRequest(request.id)}
                      className="btn btn-primary h-11 px-4"
                    >
                      Schedule
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Surface>
    </div>
  )
}

export default CollectionRequestsQueue
