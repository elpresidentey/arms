import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { serviceSchedulesApi } from '../services/api'
import { ServiceSchedule } from '../types'
import { getErrorMessage } from '../utils/errors'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import Skeleton from '../components/Skeleton'
import { Calendar, MapPin, Clock, AlertCircle, CheckCircle, Plus, X } from 'lucide-react'

export default function ServiceSchedules() {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState<ServiceSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterWard, setFilterWard] = useState('')
  const [filterServiceType, setFilterServiceType] = useState('')
  const [wards, setWards] = useState<string[]>([])
  const [serviceTypes, setServiceTypes] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    serviceType: '',
    ward: '',
    street: '',
    zone: '',
    frequency: 'weekly',
    serviceDays: [] as string[],
    startTimeWindow: '07:00',
    endTimeWindow: '11:00',
    description: '',
    operatorName: '',
    operatorPhoneNumber: '',
    operatorEmail: '',
    effectiveFromDate: '',
    effectiveToDate: '',
  })

  const isStaff = user?.role && ['admin', 'ward_officer', 'supervisor', 'dispatcher', 'psp_operator'].includes(user.role)

  useEffect(() => {
    loadSchedules()
  }, [filterWard, filterServiceType])

  const loadSchedules = async () => {
    try {
      setLoading(true)
      setError(null)

      let data
      if (isStaff) {
        data = await serviceSchedulesApi.getAll({
          ward: filterWard || undefined,
          serviceType: filterServiceType || undefined,
        })
      } else {
        data = await serviceSchedulesApi.getPublished({
          ward: filterWard || undefined,
          serviceType: filterServiceType || undefined,
        })
      }

      setSchedules(data)

      const uniqueWards = [...new Set(data.map((s: ServiceSchedule) => s.ward))].sort()
      const uniqueTypes = [...new Set(data.map((s: ServiceSchedule) => s.serviceType))].sort()
      setWards(uniqueWards)
      setServiceTypes(uniqueTypes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedules')
      console.error('Error loading schedules:', err)
    } finally {
      setLoading(false)
    }
  }

  const createMutation = useMutation({
    mutationFn: serviceSchedulesApi.create,
    onSuccess: () => {
      loadSchedules()
      setShowForm(false)
      setFormData({
        serviceType: '',
        ward: '',
        street: '',
        zone: '',
        frequency: 'weekly',
        serviceDays: [],
        startTimeWindow: '07:00',
        endTimeWindow: '11:00',
        description: '',
        operatorName: '',
        operatorPhoneNumber: '',
        operatorEmail: '',
        effectiveFromDate: '',
        effectiveToDate: '',
      })
      toast.success('Service schedule created successfully')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not create schedule'))
    },
  })

  const publishMutation = useMutation({
    mutationFn: serviceSchedulesApi.publish,
    onSuccess: () => {
      loadSchedules()
      toast.success('Schedule published successfully')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not publish schedule'))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.serviceDays.length === 0) {
      toast.error('Please select at least one service day')
      return
    }
    createMutation.mutate(formData)
  }

  const toggleServiceDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      serviceDays: prev.serviceDays.includes(day)
        ? prev.serviceDays.filter(d => d !== day)
        : [...prev.serviceDays, day]
    }))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: JSX.Element }> = {
      published: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      draft: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: <Clock className="w-4 h-4" />,
      },
      suspended: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: <AlertCircle className="w-4 h-4" />,
      },
      archived: {
        bg: 'bg-gray-200',
        text: 'text-gray-600',
        icon: <Clock className="w-4 h-4" />,
      },
    }

    const config = statusConfig[status] || statusConfig.draft

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Schedules"
        description={isStaff ? 'Manage and publish service timetables' : 'View published service schedules for your ward'}
        action={
          isStaff ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn btn-primary h-11 px-4 flex items-center gap-2"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? 'Close' : 'New Schedule'}
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error loading schedules</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Create Form */}
      {isStaff && showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Service Schedule</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                <input
                  type="text"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Waste Collection, Bulky Pickup"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ward</label>
                <input
                  type="text"
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Festac Town"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street (Optional)</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., All Streets"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
                <input
                  type="text"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Phase 1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="as_needed">As Needed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Days</label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleServiceDay(day)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.serviceDays.includes(day)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.startTimeWindow}
                  onChange={(e) => setFormData({ ...formData, startTimeWindow: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.endTimeWindow}
                  onChange={(e) => setFormData({ ...formData, endTimeWindow: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                placeholder="Describe the service schedule..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operator Name</label>
                <input
                  type="text"
                  value={formData.operatorName}
                  onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., LAWMA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.operatorPhoneNumber}
                  onChange={(e) => setFormData({ ...formData, operatorPhoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="08012345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.operatorEmail}
                  onChange={(e) => setFormData({ ...formData, operatorEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="operator@example.com"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary h-11 px-6"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn btn-primary h-11 px-6"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Schedule'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ward</label>
            <select
              value={filterWard}
              onChange={(e) => setFilterWard(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Wards</option>
              {wards.map((ward) => (
                <option key={ward} value={ward}>
                  {ward}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
            <select
              value={filterServiceType}
              onChange={(e) => setFilterServiceType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Service Types</option>
              {serviceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <EmptyState
          title="No schedules yet"
          description={isStaff ? 'Create service schedules to inform residents about collection times.' : 'No published schedules available for your area.'}
          icon={Calendar}
        />
      ) : (
        <div className="grid gap-4">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{schedule.serviceType}</h3>
                    {getStatusBadge(schedule.status)}
                  </div>
                  <p className="text-sm text-gray-600">{schedule.scheduleCode}</p>
                </div>
                {isStaff && schedule.status === 'draft' && (
                  <button
                    onClick={() => publishMutation.mutate(schedule.id)}
                    disabled={publishMutation.isPending}
                    className="btn btn-primary h-9 px-4 text-sm"
                  >
                    Publish
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Location</p>
                    <p className="text-sm text-gray-600">
                      {schedule.street ? `${schedule.street}, ` : ''}
                      {schedule.ward} - {schedule.zone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Schedule</p>
                    <p className="text-sm text-gray-600">
                      {schedule.frequency} - {schedule.serviceDays.join(', ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {schedule.startTimeWindow} - {schedule.endTimeWindow}
                    </p>
                  </div>
                </div>
              </div>

              {schedule.description && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{schedule.description}</p>
                </div>
              )}

              {schedule.operatorName && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-1">Contact Information</p>
                  <p className="text-sm text-blue-800">{schedule.operatorName}</p>
                  {schedule.operatorPhoneNumber && (
                    <p className="text-sm text-blue-800">{schedule.operatorPhoneNumber}</p>
                  )}
                  {schedule.operatorEmail && (
                    <p className="text-sm text-blue-800">{schedule.operatorEmail}</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Published: {schedule.publishedDate ? formatDate(schedule.publishedDate) : 'Not published'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
