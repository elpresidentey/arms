import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Calendar, Clock, AlertCircle } from 'lucide-react'
import { wasteCollectionsApi } from '../services/api'
import Button from '../components/Button'
import Input from '../components/Input'
import Surface from '../components/Surface'
import ErrorBoundary from '../components/ErrorBoundary'

const ScheduleCollection: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [scheduledDate, setScheduledDate] = useState('')
  const [notes, setNotes] = useState('')

  // Get user's collections to show upcoming ones
  const { data: myCollections } = useQuery({
    queryKey: ['my-waste-collections'],
    queryFn: wasteCollectionsApi.getMyCollections,
  })

  // Schedule collection mutation
  const scheduleMutation = useMutation({
    mutationFn: wasteCollectionsApi.scheduleCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-waste-collections'] })
      queryClient.invalidateQueries({ queryKey: ['waste-stats'] })
      navigate('/app/waste-history', { 
        state: { message: 'Collection scheduled successfully!' } 
      })
    },
    onError: (error: any) => {
      console.error('Schedule error:', error.response?.data?.message || error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!scheduledDate) {
      return
    }

    // Validate date is in the future
    const selectedDate = new Date(`${scheduledDate}T12:00:00`)
    const now = new Date()
    if (selectedDate <= now) {
      return
    }

    scheduleMutation.mutate({
      scheduledDate: selectedDate.toISOString(),
      notes: notes.trim() || undefined,
    })
  }

  const upcomingCollections = myCollections?.filter(
    collection => collection.status === 'scheduled' && new Date(collection.scheduledDate) > new Date()
  ) || []

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30) // Allow scheduling up to 30 days in advance
    return maxDate.toISOString().split('T')[0]
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/app')}
              className="mb-4 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Schedule Collection</h1>
                <p className="text-slate-600">Request a waste collection pickup</p>
              </div>
            </div>
          </div>

          {/* Upcoming Collections */}
          {upcomingCollections.length > 0 && (
            <div className="mb-6">
              <Surface title="Upcoming Collections" subtitle="You already have collections scheduled">
                <div className="space-y-3">
                  {upcomingCollections.map((collection) => (
                    <div key={collection.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary-600" />
                        <div>
                          <p className="font-medium text-slate-900">
                            {new Date(collection.scheduledDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-sm text-slate-600">{collection.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                          {collection.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Surface>
            </div>
          )}

          {/* Schedule Form */}
          <Surface title="Schedule New Collection" subtitle="Choose a date for your waste pickup">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="date"
                  label="Collection Date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  required
                  leftIcon={<Calendar className="h-4 w-4" />}
                />
                <p className="mt-2 text-sm text-slate-500">
                  Schedule your collection for tomorrow or up to 30 days in advance
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0"
                  placeholder="Add any special instructions for the collection team..."
                />
              </div>

              {scheduleMutation.error && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-rose-600" />
                    <p className="text-sm text-rose-700">
                      {scheduleMutation.error.response?.data?.message || 'Failed to schedule collection. Please try again.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={!scheduledDate || scheduleMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {scheduleMutation.isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" />
                      Schedule Collection
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/app')}
                  disabled={scheduleMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Surface>

          {/* Info Section */}
          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 mt-0.5">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Collection Information</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Collections are typically scheduled between 8:00 AM - 5:00 PM</li>
                  <li>• Please ensure your waste is properly sorted and placed at the curb</li>
                  <li>• You'll receive notifications when the collection is on the way</li>
                  <li>• Confirm collection when the truck arrives using the provided code</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default ScheduleCollection
