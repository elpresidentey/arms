import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, MapPin, Plus, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import LocationField from '../components/LocationField'
import OptimizedImage from '../components/OptimizedImage'
import PageHeader from '../components/PageHeader'
import StatePanel from '../components/StatePanel'
import Surface from '../components/Surface'
import { reportsApi, uploadApi } from '../services/api'
import { Report } from '../types'
import { getErrorMessage } from '../utils/errors'
import { formatDayTime } from '../utils/format'
import { buildGoogleMapsUrl, hasCoordinates } from '../utils/maps'

const reportTypes = [
  { value: 'missed_pickup', label: 'Missed Pickup' },
  { value: 'illegal_dumping', label: 'Illegal Dumping' },
  { value: 'damaged_bins', label: 'Damaged Bins' },
  { value: 'truck_issue', label: 'Truck Issue' },
  { value: 'other', label: 'Other' },
] as const

const priorityOptions = ['low', 'medium', 'high', 'urgent'] as const

const statusStyles: Record<string, string> = {
  submitted: 'bg-slate-100 text-slate-700',
  under_review: 'bg-primary-50 text-primary-700',
  in_progress: 'bg-amber-50 text-amber-700',
  resolved: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-slate-200 text-slate-600',
}

const priorityStyles: Record<string, string> = {
  low: 'text-slate-600',
  medium: 'text-primary-700',
  high: 'text-amber-700',
  urgent: 'text-rose-700',
}

type ReportFormState = {
  type: Report['type']
  title: string
  description: string
  address: string
  ward: string
  street: string
  latitude?: number
  longitude?: number
  priority: Report['priority']
  photoUrls?: string[]
}

const Reports: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const isResident = user?.role === 'resident'
  const [formData, setFormData] = useState<ReportFormState>({
    type: 'missed_pickup',
    title: '',
    description: '',
    address: '',
    ward: '',
    street: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    priority: 'medium',
    photoUrls: [],
  })

  const {
    data: reports,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['reports'],
    queryFn: reportsApi.getReports,
  })

  const createMutation = useMutation({
    mutationFn: reportsApi.createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      setShowForm(false)
      setSelectedFiles([])
      setFormData({
        type: 'missed_pickup',
        title: '',
        description: '',
        address: '',
        ward: '',
        street: '',
        latitude: undefined,
        longitude: undefined,
        priority: 'medium',
        photoUrls: [],
      })
      toast.success('Issue report submitted.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not submit report.'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Report> }) =>
      reportsApi.updateReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      toast.success('Report updated successfully')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not update report'))
    },
  })

  const handleStatusChange = (reportId: string, newStatus: Report['status']) => {
    updateMutation.mutate({ id: reportId, data: { status: newStatus } })
  }

  const handlePriorityChange = (reportId: string, newPriority: Report['priority']) => {
    updateMutation.mutate({ id: reportId, data: { priority: newPriority } })
  }

  const activeReports = reports?.filter((report) => !['resolved', 'closed'].includes(report.status)).length || 0
  const resolvedReports = reports?.filter((report) => report.status === 'resolved').length || 0

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    // Validate file count (max 3 images)
    if (selectedFiles.length + files.length > 3) {
      toast.error('Maximum 3 images allowed per report')
      return
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type`)
        return false
      }

      if (file.size > maxSize) {
        toast.error(`${file.name}: File size exceeds 5MB`)
        return false
      }

      return true
    })

    setSelectedFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    try {
      // Upload images if any
      let photoUrls: string[] = []
      if (selectedFiles.length > 0) {
        setUploadingImages(true)
        toast.loading('Uploading images...', { id: 'upload' })
        
        photoUrls = await Promise.all(
          selectedFiles.map(async (file) => {
            const result = await uploadApi.uploadImage(file)
            return result.imageUrl
          })
        )
        
        toast.success('Images uploaded successfully', { id: 'upload' })
        setUploadingImages(false)
      }

      // Submit report with image URLs
      createMutation.mutate({
        ...formData,
        ward: formData.ward || 'Unspecified ward',
        street: formData.street || 'Unspecified street',
        latitude: formData.latitude,
        longitude: formData.longitude,
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
      })
    } catch (error) {
      setUploadingImages(false)
      toast.error(getErrorMessage(error, 'Failed to upload images'), { id: 'upload' })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Issues and reports"
        description={
          isResident
            ? 'Capture missed pickups and service issues with enough detail and photo evidence for quick triage and resolution.'
            : 'Review resident complaints, inspect evidence, and track issues through to closure.'
        }
        action={
          isResident ? (
            <button
              type="button"
              onClick={() => setShowForm((current) => !current)}
              className="btn btn-primary h-11 px-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              {showForm ? 'Close form' : 'New report'}
            </button>
          ) : undefined
        }
        meta={
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
              <p className="label text-slate-500">Total reports</p>
              <p className="mt-2 heading-3 text-slate-950">
                {isLoading ? 'Loading...' : reports?.length || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3 shadow-sm">
              <p className="label text-amber-700">Active</p>
              <p className="mt-2 heading-3 text-amber-900">
                {isLoading ? 'Loading...' : activeReports}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 shadow-sm">
              <p className="label text-emerald-700">Resolved</p>
              <p className="mt-2 heading-3 text-emerald-900">
                {isLoading ? 'Loading...' : resolvedReports}
              </p>
            </div>
          </div>
        }
      />

      {!isResident ? (
        <Surface
          title="Operations oversight"
          subtitle="Reports are lodged by residents. Staff accounts review submissions, inspect uploaded evidence, and move each issue toward closure."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="metric-panel px-4 py-4">
              <p className="label text-slate-500">Report creation</p>
              <p className="mt-2 heading-4 text-slate-950">Resident only</p>
              <p className="mt-2 body-small text-slate-500">Admin and staff accounts cannot lodge environmental complaints from this workspace.</p>
            </div>
            <div className="metric-panel px-4 py-4">
              <p className="label text-slate-500">Evidence intake</p>
              <p className="mt-2 heading-4 text-slate-950">Photo enabled</p>
              <p className="mt-2 body-small text-slate-500">Residents can attach image evidence so the operations team sees what is happening on the ground.</p>
            </div>
            <div className="metric-panel px-4 py-4">
              <p className="label text-slate-500">Admin responsibility</p>
              <p className="mt-2 heading-4 text-slate-950">Review and resolve</p>
              <p className="mt-2 body-small text-slate-500">Use this queue to prioritize, assign, and resolve complaints rather than submitting new ones.</p>
            </div>
          </div>
        </Surface>
      ) : null}

      {isResident && showForm && (
        <Surface
          title="Create report"
          subtitle="Describe the issue clearly and attach photos so it can be routed quickly."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="report-type" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Issue type
                </label>
                <select
                  id="report-type"
                  className="input"
                  value={formData.type}
                  onChange={(event) => setFormData({ ...formData, type: event.target.value as Report['type'] })}
                >
                  {reportTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="report-priority" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Priority
                </label>
                <select
                  id="report-priority"
                  className="input"
                  value={formData.priority}
                  onChange={(event) =>
                    setFormData({ ...formData, priority: event.target.value as Report['priority'] })
                  }
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority[0].toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="report-title" className="mb-1.5 block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                id="report-title"
                type="text"
                className="input"
                placeholder="Short summary of the issue"
                value={formData.title}
                onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="report-description" className="mb-1.5 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                id="report-description"
                className="input min-h-[120px] resize-none py-3"
                placeholder="What happened, and what should the team know before responding?"
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                required
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
            
            {/* Image Upload Section */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Photos (Optional)
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="btn btn-secondary h-11 px-4 cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose images
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={selectedFiles.length >= 3}
                    />
                  </label>
                  <p className="text-xs text-slate-500">
                    Max 3 images, 5MB each (JPEG, PNG, WebP)
                  </p>
                </div>
                
                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-start gap-3">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                            <OptimizedImage
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {file.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Higher priority reports will stand out more clearly in operations queues.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary h-11 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || uploadingImages}
                  className="btn btn-primary h-11 px-4"
                >
                  {uploadingImages ? 'Uploading images...' : createMutation.isPending ? 'Submitting...' : 'Submit report'}
                </button>
              </div>
            </div>
          </form>
        </Surface>
      )}

      <Surface
        title="Open issues"
        subtitle="Submitted reports remain visible until they are resolved or closed."
      >
        {isError ? (
          <StatePanel
            tone="error"
            title="Couldn't load reports"
            description="The issue list is temporarily unavailable."
          />
        ) : isLoading ? (
          <StatePanel
            tone="loading"
            title="Loading reports"
            description="Fetching your submitted issue history."
          />
        ) : !reports?.length ? (
          <StatePanel
            title="No reports yet"
            description="Submit a report when a pickup is missed or you notice a service issue."
          />
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[0.7rem] font-semibold tracking-[0.14em] text-white">
                          {report.ticketNumber}
                        </span>
                        <p className="text-sm font-semibold text-slate-950">{report.title}</p>
                        <span className={`text-xs font-medium capitalize ${priorityStyles[report.priority]}`}>
                          {report.priority} priority
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{report.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {report.address}
                        </span>
                        {hasCoordinates(report.latitude, report.longitude) ? (
                          <a
                            href={buildGoogleMapsUrl(Number(report.latitude), Number(report.longitude), report.ticketNumber)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary-700 hover:text-primary-800 font-medium"
                          >
                            Open in Maps
                          </a>
                        ) : null}
                        <span>{formatDayTime(report.createdAt)}</span>
                        <span>Due {formatDayTime(report.dueAt)}</span>
                      </div>
                      
                      {/* Display uploaded images */}
                      {report.photoUrls && report.photoUrls.length > 0 && (
                        <div className="mt-3 flex gap-2">
                          {report.photoUrls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="h-20 w-20 overflow-hidden rounded-lg border border-slate-200 hover:border-primary-500 transition-colors"
                            >
                              <OptimizedImage
                                src={url}
                                alt={`Report evidence ${idx + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold text-center ${
                        statusStyles[report.status] || statusStyles.submitted
                      }`}
                    >
                      {report.status.replace('_', ' ')}
                    </span>
                    
                    {/* Staff controls for updating status and priority */}
                    {!isResident && (
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Update Status
                          </label>
                          <select
                            value={report.status}
                            onChange={(e) => handleStatusChange(report.id, e.target.value as Report['status'])}
                            className="input text-xs py-1.5"
                            disabled={updateMutation.isPending}
                          >
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Update Priority
                          </label>
                          <select
                            value={report.priority}
                            onChange={(e) => handlePriorityChange(report.id, e.target.value as Report['priority'])}
                            className="input text-xs py-1.5"
                            disabled={updateMutation.isPending}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Surface>
    </div>
  )
}

export default Reports
