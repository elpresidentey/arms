import React, { useState, useEffect } from 'react'
import { 
  MapPin, 
  Clock, 
  Truck, 
  Users, 
  Play, 
  Square, 
  CheckCircle,
  AlertTriangle,
  Route,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  MoreVertical,
  TrendingUp,
  Fuel,
  Package
} from 'lucide-react'
import { routeExecutionsApi, driversApi, vehiclesApi } from '../services/api'
import { RouteExecution, Driver, Vehicle } from '../types'
import { formatDistanceToNow, format, isToday } from 'date-fns'
import toast from 'react-hot-toast'

const RouteOperations: React.FC = () => {
  const [executions, setExecutions] = useState<RouteExecution[]>([])
  const [todaysExecutions, setTodaysExecutions] = useState<RouteExecution[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [activeTab, setActiveTab] = useState<'today' | 'scheduled' | 'in-progress' | 'completed'>('today')
  const [selectedExecution, setSelectedExecution] = useState<RouteExecution | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null)

  useEffect(() => {
    loadRouteOperations()
  }, [])

  const loadRouteOperations = async () => {
    try {
      setIsLoading(true)
      const [
        todaysData,
        allExecutions,
        driversData,
        vehiclesData,
        metrics
      ] = await Promise.all([
        routeExecutionsApi.getTodaysExecutions(),
        routeExecutionsApi.getAll(),
        driversApi.getAll(),
        vehiclesApi.getAll(),
        routeExecutionsApi.getPerformanceMetrics({ 
          dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          dateTo: new Date().toISOString().split('T')[0]
        })
      ])

      setTodaysExecutions(todaysData)
      setExecutions(allExecutions)
      setDrivers(driversData)
      setVehicles(vehiclesData)
      setPerformanceMetrics(metrics)
    } catch (error) {
      console.error('Error loading route operations:', error)
      toast.error('Failed to load route operations')
    } finally {
      setIsLoading(false)
    }
  }

  const getExecutionsByStatus = (status: string) => {
    if (status === 'today') return todaysExecutions
    return executions.filter(e => e.status === status)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-700 bg-blue-50 border-blue-200'
      case 'in_progress':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'completed':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200'
      case 'disrupted':
        return 'text-orange-700 bg-orange-50 border-orange-200'
      case 'cancelled':
        return 'text-red-700 bg-red-50 border-red-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4" />
      case 'in_progress':
        return <Play className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'disrupted':
        return <AlertTriangle className="h-4 w-4" />
      case 'cancelled':
        return <Square className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleStartRoute = async (executionId: string) => {
    try {
      await routeExecutionsApi.startRoute(executionId, {
        startLocation: 'Depot',
        notes: 'Route started from operations dashboard'
      })
      toast.success('Route started successfully')
      loadRouteOperations()
    } catch (error) {
      console.error('Error starting route:', error)
      toast.error('Failed to start route')
    }
  }

  const handleCompleteRoute = async (executionId: string) => {
    try {
      await routeExecutionsApi.completeRoute(executionId, {
        completedStops: 0, // This would be populated from actual data
        endLocation: 'Depot',
        notes: 'Route completed from operations dashboard'
      })
      toast.success('Route completed successfully')
      loadRouteOperations()
    } catch (error) {
      console.error('Error completing route:', error)
      toast.error('Failed to complete route')
    }
  }

  const calculateDuration = (execution: RouteExecution) => {
    if (!execution.startedAt) return null
    
    const end = execution.completedAt ? new Date(execution.completedAt) : new Date()
    const start = new Date(execution.startedAt)
    const durationMs = end.getTime() - start.getTime()
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-2">Route Operations</h1>
          <p className="body text-slate-600 mt-2">
            Monitor and manage real-time route executions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadRouteOperations}
            className="btn btn-outline btn-sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="metric-panel">
          <div className="flex items-center justify-between">
            <div>
              <p className="label text-slate-500">Routes Today</p>
              <p className="heading-3 text-slate-950 mt-1">{todaysExecutions.length}</p>
              <p className="caption text-slate-500 mt-1">
                {todaysExecutions.filter(e => e.status === 'completed').length} completed
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <Route className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="metric-panel">
          <div className="flex items-center justify-between">
            <div>
              <p className="label text-slate-500">In Progress</p>
              <p className="heading-3 text-slate-950 mt-1">
                {todaysExecutions.filter(e => e.status === 'in_progress').length}
              </p>
              <p className="caption text-slate-500 mt-1">
                Active routes
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-700">
              <Play className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="metric-panel">
          <div className="flex items-center justify-between">
            <div>
              <p className="label text-slate-500">Completion Rate</p>
              <p className="heading-3 text-slate-950 mt-1">
                {performanceMetrics?.completionRate || '0.0'}%
              </p>
              <p className="caption text-slate-500 mt-1">
                Last 7 days
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="metric-panel">
          <div className="flex items-center justify-between">
            <div>
              <p className="label text-slate-500">On-Time Rate</p>
              <p className="heading-3 text-slate-950 mt-1">
                {performanceMetrics?.onTimeRate || '0.0'}%
              </p>
              <p className="caption text-slate-500 mt-1">
                Within 15 min schedule
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          {[
            { key: 'today', label: 'Today\'s Routes', count: todaysExecutions.length },
            { key: 'scheduled', label: 'Scheduled', count: executions.filter(e => e.status === 'scheduled').length },
            { key: 'in_progress', label: 'In Progress', count: executions.filter(e => e.status === 'in_progress').length },
            { key: 'completed', label: 'Completed', count: executions.filter(e => e.status === 'completed').length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {label}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                activeTab === key 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Route Executions List */}
      <div className="space-y-4">
        {getExecutionsByStatus(activeTab).map((execution) => (
          <div key={execution.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${getStatusColor(execution.status)}`}>
                  {getStatusIcon(execution.status)}
                </div>
                
                {/* Route Information */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-slate-900">
                      {execution.route.routeCode} - {execution.route.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(execution.status)}`}>
                      {execution.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{execution.route.ward}, {execution.route.street}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{format(new Date(execution.scheduledDate), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                    {execution.startedAt && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>Duration: {calculateDuration(execution) || 'Calculating...'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {execution.status === 'scheduled' && (
                  <button
                    onClick={() => handleStartRoute(execution.id)}
                    className="btn btn-primary btn-sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Route
                  </button>
                )}
                {execution.status === 'in_progress' && (
                  <button
                    onClick={() => handleCompleteRoute(execution.id)}
                    className="btn btn-green btn-sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete
                  </button>
                )}
                <button
                  onClick={() => setSelectedExecution(execution)}
                  className="btn btn-outline btn-sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Details
                </button>
              </div>
            </div>

            {/* Driver and Vehicle Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              {/* Driver Info */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-medium text-sm">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {execution.driver ? `${execution.driver.user.firstName} ${execution.driver.user.lastName}` : 'No driver assigned'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {execution.driver ? `${execution.driver.driverCode} • Rating: ${execution.driver.performanceRating}/5` : 'Assign a driver'}
                  </p>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {execution.vehicle ? `${execution.vehicle.vehicleCode} - ${execution.vehicle.plateNumber}` : 'No vehicle assigned'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {execution.vehicle ? `${execution.vehicle.make} ${execution.vehicle.model} • ${execution.vehicle.status}` : 'Assign a vehicle'}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            {(execution.status === 'completed' || execution.status === 'in_progress') && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-slate-900">
                    {execution.completedStops}/{execution.plannedStops}
                  </p>
                  <p className="text-xs text-slate-500">Stops Completed</p>
                </div>
                
                {execution.totalDistance && (
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-slate-900">
                      {execution.totalDistance.toFixed(1)}km
                    </p>
                    <p className="text-xs text-slate-500">Distance Covered</p>
                  </div>
                )}
                
                {execution.fuelUsed && (
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-slate-900">
                      {execution.fuelUsed.toFixed(1)}L
                    </p>
                    <p className="text-xs text-slate-500">Fuel Used</p>
                  </div>
                )}
                
                {execution.wasteCollected && (
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-slate-900">
                      {execution.wasteCollected.toFixed(1)}{execution.wasteUnit || 'kg'}
                    </p>
                    <p className="text-xs text-slate-500">Waste Collected</p>
                  </div>
                )}
              </div>
            )}

            {/* Issues and Delays */}
            {(execution.delayMinutes > 0 || execution.issues) && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div>
                    {execution.delayMinutes > 0 && (
                      <p className="text-sm font-medium text-orange-900">
                        Delayed by {execution.delayMinutes} minutes
                      </p>
                    )}
                    {execution.issues && (
                      <div className="mt-1">
                        <p className="text-sm text-orange-800">Issues reported:</p>
                        <div className="mt-1 space-y-1">
                          {JSON.parse(execution.issues).map((issue: any, index: number) => (
                            <p key={index} className="text-xs text-orange-700">
                              • {issue.issue} {issue.delayMinutes && `(+${issue.delayMinutes} min)`}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {getExecutionsByStatus(activeTab).length === 0 && (
          <div className="text-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mx-auto mb-4">
              <Route className="h-8 w-8" />
            </div>
            <h3 className="heading-4 text-slate-900 mb-2">No routes found</h3>
            <p className="body text-slate-600">
              {activeTab === 'today' 
                ? 'No routes scheduled for today'
                : `No routes with status "${activeTab.replace('_', ' ')}"`
              }
            </p>
          </div>
        )}
      </div>

      {/* Route Execution Details Modal */}
      {selectedExecution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="heading-3">Route Execution Details</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {selectedExecution.route.routeCode} - {selectedExecution.route.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedExecution(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status and Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-900 mb-2">Current Status</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedExecution.status)}`}>
                      {selectedExecution.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-900 mb-2">Scheduled</p>
                  <p className="text-sm text-slate-600">
                    {format(new Date(selectedExecution.scheduledDate), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                
                {selectedExecution.startedAt && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-900 mb-2">Started</p>
                    <p className="text-sm text-slate-600">
                      {format(new Date(selectedExecution.startedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
              </div>

              {/* Performance Data */}
              {selectedExecution.status !== 'scheduled' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-semibold text-slate-900">
                      {selectedExecution.completedStops}/{selectedExecution.plannedStops}
                    </p>
                    <p className="text-sm text-slate-500">Stops</p>
                  </div>
                  
                  {selectedExecution.totalDistance && (
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-2xl font-semibold text-slate-900">
                        {selectedExecution.totalDistance.toFixed(1)}
                      </p>
                      <p className="text-sm text-slate-500">Distance (km)</p>
                    </div>
                  )}
                  
                  {selectedExecution.fuelUsed && (
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-2xl font-semibold text-slate-900">
                        {selectedExecution.fuelUsed.toFixed(1)}
                      </p>
                      <p className="text-sm text-slate-500">Fuel (L)</p>
                    </div>
                  )}
                  
                  {selectedExecution.wasteCollected && (
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-2xl font-semibold text-slate-900">
                        {selectedExecution.wasteCollected.toFixed(1)}
                      </p>
                      <p className="text-sm text-slate-500">Waste ({selectedExecution.wasteUnit || 'kg'})</p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {selectedExecution.notes && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-900 mb-2">Notes</p>
                  <p className="text-sm text-slate-600">{selectedExecution.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RouteOperations