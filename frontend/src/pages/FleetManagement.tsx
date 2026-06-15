import React, { useState, useEffect } from 'react'
import { 
  Truck, 
  Users, 
  Settings, 
  MapPin, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  UserPlus,
  TruckIcon
} from 'lucide-react'
import { logisticsApi, driversApi, vehiclesApi } from '../services/api'
import { Driver, Vehicle, VehicleAssignment, LogisticsSummary } from '../types'
import { formatDistanceToNow, format } from 'date-fns'
import toast from 'react-hot-toast'

const FleetManagement: React.FC = () => {
  const [logistics, setLogistics] = useState<LogisticsSummary | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [assignments, setAssignments] = useState<VehicleAssignment[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'drivers' | 'vehicles' | 'assignments'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showDriverModal, setShowDriverModal] = useState(false)
  const [showVehicleModal, setShowVehicleModal] = useState(false)

  useEffect(() => {
    loadFleetData()
  }, [])

  const loadFleetData = async () => {
    try {
      setIsLoading(true)
      const [logisticsData, fleetDetails, driversData, vehiclesData] = await Promise.all([
        logisticsApi.getSummary(),
        logisticsApi.getFleetDetails(),
        driversApi.getAll(),
        vehiclesApi.getAll(),
      ])

      setLogistics(logisticsData)
      setDrivers(driversData)
      setVehicles(vehiclesData)
      setAssignments(fleetDetails.assignments)
    } catch (error) {
      console.error('Error loading fleet data:', error)
      toast.error('Failed to load fleet data')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = `${driver.user.firstName} ${driver.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.driverCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.vehicleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'operational':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'inactive':
      case 'retired':
        return 'text-gray-700 bg-gray-50 border-gray-200'
      case 'maintenance':
        return 'text-orange-700 bg-orange-50 border-orange-200'
      case 'out_of_service':
      case 'suspended':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'on_leave':
        return 'text-blue-700 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'compactor_truck':
        return <TruckIcon className="h-4 w-4" />
      case 'tipper_truck':
        return <Truck className="h-4 w-4" />
      default:
        return <Truck className="h-4 w-4" />
    }
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
          <h1 className="heading-2">Fleet Management</h1>
          <p className="body text-slate-600 mt-2">
            Manage drivers, vehicles, and fleet assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDriverModal(true)}
            className="btn btn-outline btn-sm"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Driver
          </button>
          <button
            onClick={() => setShowVehicleModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="metric-panel">
          <div className="flex items-center justify-between">
            <div>
              <p className="label text-slate-500">Total Vehicles</p>
              <p className="heading-3 text-slate-950 mt-1">{logistics?.fleet.totalVehicles || 0}</p>
              <p className="caption text-slate-500 mt-1">
                {logistics?.fleet.operationalVehicles || 0} operational
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <Truck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="metric-panel">
          <div className="flex items-center justify-between">
            <div>
              <p className="label text-slate-500">Active Drivers</p>
              <p className="heading-3 text-slate-950 mt-1">{logistics?.drivers.activeDrivers || 0}</p>
              <p className="caption text-slate-500 mt-1">
                {logistics?.drivers.assignedDrivers || 0} assigned today
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="metric-panel">
          <div className="flex items-center justify-between">
            <div>
              <p className="label text-slate-500">Fleet Utilization</p>
              <p className="heading-3 text-slate-950 mt-1">
                {logistics?.fleet.totalVehicles > 0 
                  ? Math.round((logistics.fleet.assignedVehicles / logistics.fleet.totalVehicles) * 100)
                  : 0}%
              </p>
              <p className="caption text-slate-500 mt-1">
                {logistics?.fleet.assignedVehicles || 0} vehicles assigned
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-700">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="metric-panel">
          <div className="flex items-center justify-between">
            <div>
              <p className="label text-slate-500">Maintenance Due</p>
              <p className="heading-3 text-slate-950 mt-1">{logistics?.attention.maintenanceAlerts?.length || 0}</p>
              <p className="caption text-slate-500 mt-1">
                Vehicles need attention
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: 'Fleet Overview', icon: Settings },
            { key: 'drivers', label: 'Drivers', icon: Users },
            { key: 'vehicles', label: 'Vehicles', icon: Truck },
            { key: 'assignments', label: 'Assignments', icon: MapPin },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      {(activeTab === 'drivers' || activeTab === 'vehicles') && (
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input min-w-[120px]"
            >
              <option value="all">All Status</option>
              {activeTab === 'drivers' && (
                <>
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </>
              )}
              {activeTab === 'vehicles' && (
                <>
                  <option value="operational">Operational</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="out_of_service">Out of Service</option>
                  <option value="retired">Retired</option>
                </>
              )}
            </select>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Deployments */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="heading-4 mb-4">Today's Vehicle Deployments</h3>
            <div className="space-y-3">
              {logistics?.vehicleDeployments?.slice(0, 6).map((deployment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                      {getVehicleTypeIcon(deployment.vehicleType)}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-900">{deployment.vehicleCode}</p>
                      <p className="text-xs text-slate-500">{deployment.plateNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-slate-900">{deployment.driverName}</p>
                    <p className="text-xs text-slate-500">
                      {deployment.routesToday} routes • {deployment.completedToday} completed
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {deployment.inProgress && (
                      <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deployment.status)}`}>
                      {deployment.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )) || (
                <p className="text-center text-slate-500 py-8">No deployments scheduled for today</p>
              )}
            </div>
          </div>

          {/* Fleet Alerts */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="heading-4 mb-4">Fleet Alerts</h3>
            <div className="space-y-4">
              {/* Maintenance Alerts */}
              {logistics?.attention.maintenanceAlerts?.length > 0 && (
                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-900">Maintenance Due</span>
                  </div>
                  <div className="space-y-2">
                    {logistics.attention.maintenanceAlerts.slice(0, 3).map((alert, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-orange-800">{alert.vehicleCode} - {alert.plateNumber}</span>
                        <span className="text-orange-600">
                          {alert.nextServiceDue && formatDistanceToNow(new Date(alert.nextServiceDue), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* License Expiration Alerts */}
              {logistics?.attention.expiringLicenses?.length > 0 && (
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-900">License Expiring</span>
                  </div>
                  <div className="space-y-2">
                    {logistics.attention.expiringLicenses.slice(0, 3).map((alert, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-red-800">{alert.driverCode} - {alert.name}</span>
                        <span className="text-red-600">
                          {formatDistanceToNow(new Date(alert.licenseExpiryDate), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!logistics?.attention.maintenanceAlerts?.length && !logistics?.attention.expiringLicenses?.length) && (
                <div className="flex items-center gap-2 text-green-600 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">No critical alerts</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'drivers' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Current Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    License Expiry
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-medium">
                          {driver.user.firstName.charAt(0)}{driver.user.lastName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {driver.user.firstName} {driver.user.lastName}
                          </div>
                          <div className="text-sm text-slate-500">{driver.driverCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(driver.status)}`}>
                        {driver.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {driver.currentVehicle ? (
                        <div>
                          <div className="font-medium">{driver.currentVehicle.vehicleCode}</div>
                          <div className="text-slate-500">{driver.currentVehicle.plateNumber}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {driver.performanceRating.toFixed(1)}/5.0
                          </div>
                          <div className="text-xs text-slate-500">
                            {driver.completedRoutes}/{driver.totalRoutes} routes
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {format(new Date(driver.licenseExpiryDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedDriver(driver)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-slate-400 hover:text-slate-600">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'vehicles' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Type & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Current Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Maintenance
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          {getVehicleTypeIcon(vehicle.vehicleType)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{vehicle.vehicleCode}</div>
                          <div className="text-sm text-slate-500">
                            {vehicle.plateNumber} • {vehicle.make} {vehicle.model}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-slate-900 capitalize">
                          {vehicle.vehicleType.replace('_', ' ')}
                        </div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {vehicle.currentDriver ? (
                        <div>
                          <div className="font-medium">{vehicle.currentDriver.name}</div>
                          <div className="text-slate-500">{vehicle.currentDriver.driverCode}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 text-slate-400 mr-1" />
                        {vehicle.currentLocation || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {vehicle.nextServiceDue ? (
                        <div>
                          <div className="text-xs text-slate-500">Next service:</div>
                          <div className={`text-sm ${
                            new Date(vehicle.nextServiceDue) < new Date() 
                              ? 'text-red-600 font-medium' 
                              : 'text-slate-900'
                          }`}>
                            {formatDistanceToNow(new Date(vehicle.nextServiceDue), { addSuffix: true })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Not scheduled</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedVehicle(vehicle)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-slate-400 hover:text-slate-600">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6">
            <h3 className="heading-4 mb-4">Current Vehicle Assignments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-900">
                          {assignment.vehicle.vehicleCode}
                        </p>
                        <p className="text-xs text-slate-500">
                          {assignment.vehicle.plateNumber}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.vehicle.status)}`}>
                      {assignment.vehicle.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-medium text-xs">
                      {assignment.driver.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-900">
                        {assignment.driver.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {assignment.driver.driverCode} • Rating: {assignment.driver.performanceRating}/5
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Assigned:</span>
                      <span>{formatDistanceToNow(new Date(assignment.assignedDate), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {assignments.length === 0 && (
              <p className="text-center text-slate-500 py-8">No vehicle assignments found</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FleetManagement