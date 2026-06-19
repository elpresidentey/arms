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
  TruckIcon,
  X
} from 'lucide-react'
import { logisticsApi, driversApi, vehiclesApi, usersApi } from '../services/api'
import { Driver, Vehicle, VehicleAssignment, LogisticsSummary, User } from '../types'
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
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Driver Form State
  const [driverForm, setDriverForm] = useState({
    userId: '',
    licenseNumber: '',
    licenseClass: 'CLASS_B',
    licenseExpiryDate: '',
    emergencyContact: '',
    emergencyPhone: '',
    hireDate: new Date().toISOString().split('T')[0],
    specializations: [] as string[],
    notes: ''
  })

  // Vehicle Form State
  const [vehicleForm, setVehicleForm] = useState({
    plateNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vehicleType: 'compactor_truck',
    fuelType: 'diesel',
    capacity: 0,
    capacityUnit: 'tons',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: 0,
    insuranceExpiry: '',
    registrationExpiry: '',
    currentMileage: 0,
    currentLocation: 'Depot',
    notes: ''
  })

  useEffect(() => {
    loadFleetData()
  }, [])

  useEffect(() => {
    if (showDriverModal) {
      loadAvailableUsers()
    }
  }, [showDriverModal])

  const loadAvailableUsers = async () => {
    try {
      // Load all users - filter out those who are already drivers
      const allUsers = await usersApi.getAll()
      const driverUserIds = drivers.map(d => d.userId)
      const available = allUsers.filter(u => !driverUserIds.includes(u.id))
      setAvailableUsers(available)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load available users')
    }
  }

  const loadFleetData = async () => {
    try {
      setIsLoading(true)
      
      // Load data with individual error handling
      const [logisticsData, fleetDetails, driversData, vehiclesData] = await Promise.allSettled([
        logisticsApi.getSummary(),
        logisticsApi.getFleetDetails(),
        driversApi.getAll(),
        vehiclesApi.getAll(),
      ])

      // Handle logistics summary
      if (logisticsData.status === 'fulfilled') {
        setLogistics(logisticsData.value)
      }

      // Handle fleet details
      if (fleetDetails.status === 'fulfilled') {
        setAssignments(fleetDetails.value.assignments || [])
      }

      // Handle drivers
      if (driversData.status === 'fulfilled') {
        setDrivers(driversData.value)
      } else {
        setDrivers([])
      }

      // Handle vehicles
      if (vehiclesData.status === 'fulfilled') {
        setVehicles(vehiclesData.value)
      } else {
        setVehicles([])
      }

      // Show success message if we have vehicles
      if (vehiclesData.status === 'fulfilled' && vehiclesData.value.length > 0) {
        toast.success('Fleet data loaded successfully')
      }
    } catch (error) {
      console.error('Error loading fleet data:', error)
      toast.error('Some fleet data could not be loaded')
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

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!driverForm.userId) {
      toast.error('Please select a user')
      return
    }

    setIsSubmitting(true)
    try {
      await driversApi.create(driverForm)
      toast.success('Driver added successfully!')
      setShowDriverModal(false)
      setDriverForm({
        userId: '',
        licenseNumber: '',
        licenseClass: 'CLASS_B',
        licenseExpiryDate: '',
        emergencyContact: '',
        emergencyPhone: '',
        hireDate: new Date().toISOString().split('T')[0],
        specializations: [],
        notes: ''
      })
      loadFleetData()
    } catch (error: any) {
      console.error('Error creating driver:', error)
      toast.error(error.response?.data?.message || 'Failed to add driver')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!vehicleForm.plateNumber || !vehicleForm.make || !vehicleForm.model) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      await vehiclesApi.create(vehicleForm)
      toast.success('Vehicle added successfully!')
      setShowVehicleModal(false)
      setVehicleForm({
        plateNumber: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vehicleType: 'compactor_truck',
        fuelType: 'diesel',
        capacity: 0,
        capacityUnit: 'tons',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: 0,
        insuranceExpiry: '',
        registrationExpiry: '',
        currentMileage: 0,
        currentLocation: 'Depot',
        notes: ''
      })
      loadFleetData()
    } catch (error: any) {
      console.error('Error creating vehicle:', error)
      toast.error(error.response?.data?.message || 'Failed to add vehicle')
    } finally {
      setIsSubmitting(false)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Vehicles Card */}
        <div className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Truck className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Vehicles</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-slate-900">{logistics?.fleet.totalVehicles || vehicles.length || 0}</p>
            <p className="text-sm text-slate-600">
              <span className="font-medium text-green-600">{logistics?.fleet.operationalVehicles || vehicles.filter(v => v.status === 'operational').length || 0}</span> operational
            </p>
          </div>
        </div>

        {/* Active Drivers Card */}
        <div className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Drivers</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-slate-900">{logistics?.drivers.activeDrivers || drivers.length || 0}</p>
            <p className="text-sm text-slate-600">
              <span className="font-medium text-green-600">{logistics?.drivers.assignedDrivers || 0}</span> assigned today
            </p>
          </div>
        </div>

        {/* Fleet Utilization Card */}
        <div className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Utilization</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-slate-900">
              {logistics?.fleet.totalVehicles > 0 
                ? Math.round((logistics.fleet.assignedVehicles / logistics.fleet.totalVehicles) * 100)
                : 0}%
            </p>
            <p className="text-sm text-slate-600">
              {logistics?.fleet.assignedVehicles || 0} of {logistics?.fleet.totalVehicles || 0} in use
            </p>
          </div>
        </div>

        {/* Maintenance Due Card */}
        <div className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Maintenance</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-slate-900">{logistics?.attention.maintenanceAlerts?.length || vehicles.filter(v => v.status === 'maintenance').length || 0}</p>
            <p className="text-sm text-slate-600">
              {logistics?.attention.maintenanceAlerts?.length || 0} need attention
            </p>
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

      {/* Add Driver Modal */}
      {showDriverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="heading-3">Add New Driver</h2>
              <button
                onClick={() => setShowDriverModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="p-6 space-y-6">
              {/* User Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select User <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={driverForm.userId}
                  onChange={(e) => setDriverForm({ ...driverForm, userId: e.target.value })}
                  className="input w-full"
                >
                  <option value="">Choose a user...</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
                {availableUsers.length === 0 && (
                  <p className="text-sm text-slate-500 mt-1">No available users. All users are already drivers.</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* License Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={driverForm.licenseNumber}
                    onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
                    className="input w-full"
                    placeholder="DL-1234567890"
                  />
                </div>

                {/* License Class */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    License Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={driverForm.licenseClass}
                    onChange={(e) => setDriverForm({ ...driverForm, licenseClass: e.target.value })}
                    className="input w-full"
                  >
                    <option value="CLASS_A">Class A</option>
                    <option value="CLASS_B">Class B</option>
                    <option value="CLASS_C">Class C</option>
                    <option value="CDL">CDL (Commercial)</option>
                  </select>
                </div>

                {/* License Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    License Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={driverForm.licenseExpiryDate}
                    onChange={(e) => setDriverForm({ ...driverForm, licenseExpiryDate: e.target.value })}
                    className="input w-full"
                  />
                </div>

                {/* Hire Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hire Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={driverForm.hireDate}
                    onChange={(e) => setDriverForm({ ...driverForm, hireDate: e.target.value })}
                    className="input w-full"
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={driverForm.emergencyContact}
                    onChange={(e) => setDriverForm({ ...driverForm, emergencyContact: e.target.value })}
                    className="input w-full"
                    placeholder="John Doe"
                  />
                </div>

                {/* Emergency Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={driverForm.emergencyPhone}
                    onChange={(e) => setDriverForm({ ...driverForm, emergencyPhone: e.target.value })}
                    className="input w-full"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={driverForm.notes}
                  onChange={(e) => setDriverForm({ ...driverForm, notes: e.target.value })}
                  className="input w-full"
                  rows={3}
                  placeholder="Any additional information about the driver..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowDriverModal(false)}
                  className="btn btn-outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || !driverForm.userId}
                >
                  {isSubmitting ? 'Adding...' : 'Add Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="heading-3">Add New Vehicle</h2>
              <button
                onClick={() => setShowVehicleModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Plate Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Plate Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.plateNumber}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, plateNumber: e.target.value.toUpperCase() })}
                    className="input w-full"
                    placeholder="ABC-1234"
                  />
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={vehicleForm.vehicleType}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })}
                    className="input w-full"
                  >
                    <option value="compactor_truck">Compactor Truck</option>
                    <option value="tipper_truck">Tipper Truck</option>
                    <option value="roll_off">Roll-off Truck</option>
                    <option value="recycling_truck">Recycling Truck</option>
                    <option value="flatbed">Flatbed</option>
                  </select>
                </div>

                {/* Make */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Make <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.make}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                    className="input w-full"
                    placeholder="Mercedes, Volvo, etc."
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                    className="input w-full"
                    placeholder="Econic 2630"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={vehicleForm.year}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, year: parseInt(e.target.value) })}
                    className="input w-full"
                  />
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fuel Type
                  </label>
                  <select
                    value={vehicleForm.fuelType}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, fuelType: e.target.value })}
                    className="input w-full"
                  >
                    <option value="diesel">Diesel</option>
                    <option value="gasoline">Gasoline</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="cng">CNG</option>
                  </select>
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Capacity <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={vehicleForm.capacity}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: parseFloat(e.target.value) })}
                      className="input flex-1"
                      placeholder="10"
                    />
                    <select
                      value={vehicleForm.capacityUnit}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, capacityUnit: e.target.value })}
                      className="input w-24"
                    >
                      <option value="tons">tons</option>
                      <option value="cubic_meters">m³</option>
                      <option value="cubic_yards">yd³</option>
                    </select>
                  </div>
                </div>

                {/* Purchase Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Purchase Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={vehicleForm.purchaseDate}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, purchaseDate: e.target.value })}
                    className="input w-full"
                  />
                </div>

                {/* Purchase Price */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Purchase Price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={vehicleForm.purchasePrice}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, purchasePrice: parseFloat(e.target.value) })}
                    className="input w-full"
                    placeholder="50000.00"
                  />
                </div>

                {/* Insurance Expiry */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Insurance Expiry
                  </label>
                  <input
                    type="date"
                    value={vehicleForm.insuranceExpiry}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, insuranceExpiry: e.target.value })}
                    className="input w-full"
                  />
                </div>

                {/* Registration Expiry */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Registration Expiry
                  </label>
                  <input
                    type="date"
                    value={vehicleForm.registrationExpiry}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, registrationExpiry: e.target.value })}
                    className="input w-full"
                  />
                </div>

                {/* Current Mileage */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Mileage (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={vehicleForm.currentMileage}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, currentMileage: parseInt(e.target.value) })}
                    className="input w-full"
                    placeholder="0"
                  />
                </div>

                {/* Current Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Location
                  </label>
                  <input
                    type="text"
                    value={vehicleForm.currentLocation}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, currentLocation: e.target.value })}
                    className="input w-full"
                    placeholder="Depot"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={vehicleForm.notes}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, notes: e.target.value })}
                  className="input w-full"
                  rows={3}
                  placeholder="Any additional information about the vehicle..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="btn btn-outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FleetManagement