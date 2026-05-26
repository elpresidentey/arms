import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, X, AlertCircle, CheckCircle2, Clock, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import StatePanel from '../components/StatePanel'
import Surface from '../components/Surface'
import { collectionRequestsApi } from '../services/api'
import { CollectionRequestStatus, CollectionRequestType } from '../types'
import { getErrorMessage } from '../utils/errors'
import { formatDate } from '../utils/format'

const typeColors: Record<CollectionRequestType, string> = {
  routine: 'bg-blue-100 text-blue-800',
  urgent: 'bg-red-100 text-red-800',
  bulky: 'bg-orange-100 text-orange-800',
  special: 'bg-purple-100 text-purple-800',
}

const statusColors: Record<CollectionRequestStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

const statusIcons: Record<CollectionRequestStatus, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  scheduled: <AlertCircle className="h-4 w-4" />,
  completed: <CheckCircle2 className="h-4 w-4" />,
  cancelled: <X className="h-4 w-4" />,
}

const CollectionRequests: React.FC = () => {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'routine' as CollectionRequestType,
    preferredDate: '',
    description: '',
  })

  const { data: requests, isLoading, isError } = useQuery({
    queryKey: ['my-collection-requests'],
    queryFn: collectionRequestsApi.getMyRequests,
  })

  const createMutation = useMutation({
    mutationFn: collectionRequestsApi.createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-collection-requests'] })
      setShowForm(false)
      setFormData({ type: 'routine', preferredDate: '', description: '' })
      toast.success('Collection request submitted successfully')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not submit collection request'))
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => collectionRequestsApi.cancelRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-collection-requests'] })
      toast.success('Collection request cancelled')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not cancel request'))
    },
  })

  const handleCreateRequest = (event: React.FormEvent) => {
    event.preventDefault()
    createMutation.mutate({
      type: formData.type,
      preferredDate: formData.preferredDate ? new Date(formData.preferredDate).toISOString() : undefined,
      description: formData.description || undefined,
    })
  }

  const handleCancelRequest = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      cancelMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Collections"
        title="Request collection service"
        description="Submit a collection request for your area and track its status"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary h-11 px-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            {showForm ? 'Close form' : 'Request collection'}
          </button>
        }
      />

      {showForm && (
        <Surface title="Submit collection request" subtitle="Tell us what you need collected and when you prefer it">
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <label htmlFor="request-type" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Collection type
                </label>
                <select
                  id="request-type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as CollectionRequestType })}
                  className="input"
                >
                  <option value="routine">Routine collection</option>
                  <option value="urgent">Urgent collection</option>
                  <option value="bulky">Bulky waste pickup</option>
                  <option value="special">Special request</option>
                </select>
              </div>

              <div>
                <label htmlFor="request-date" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Preferred date
                </label>
                <input
                  id="request-date"
                  type="datetime-local"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="request-description" className="mb-1.5 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                id="request-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input min-h-[100px]"
                placeholder="Describe your collection needs (e.g., amount of waste, special items, access instructions)..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary h-11 px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn btn-primary h-11 px-4"
              >
                {createMutation.isPending ? 'Submitting...' : 'Submit request'}
              </button>
            </div>
          </form>
        </Surface>
      )}

      <Surface title="Your requests" subtitle="Track the status of all your collection requests">
        {isError ? (
          <StatePanel tone="error" title="Couldn't load requests" description="Your collection requests are temporarily unavailable." />
        ) : isLoading ? (
          <StatePanel tone="loading" title="Loading requests" description="Fetching your collection requests." />
        ) : !requests?.length ? (
          <StatePanel tone="empty" title="No requests yet" description="Submit a collection request to get started." />
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${typeColors[request.type]}`}>
                        {request.type.replace('_', ' ')}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1 ${statusColors[request.status]}`}>
                        {statusIcons[request.status]}
                        {request.status.replace('_', ' ')}
                      </span>
                    </div>

                    {request.description && (
                      <p className="text-sm text-slate-600 mb-2">{request.description}</p>
                    )}

                    <div className="grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-3">
                      <div>
                        <p className="font-medium text-slate-700">Submitted</p>
                        <p>{formatDate(request.createdAt)}</p>
                      </div>
                      {request.preferredDate && (
                        <div>
                          <p className="font-medium text-slate-700">Preferred date</p>
                          <p>{formatDate(request.preferredDate)}</p>
                        </div>
                      )}
                      {request.scheduledDate && (
                        <div>
                          <p className="font-medium text-slate-700">Scheduled for</p>
                          <p>{formatDate(request.scheduledDate)}</p>
                        </div>
                      )}
                      {request.completedAt && (
                        <div>
                          <p className="font-medium text-slate-700">Completed</p>
                          <p>{formatDate(request.completedAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {(request.status === 'pending' || request.status === 'scheduled') && (
                    <button
                      onClick={() => handleCancelRequest(request.id)}
                      disabled={cancelMutation.isPending}
                      className="btn btn-secondary h-11 px-4 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Cancel
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

export default CollectionRequests
