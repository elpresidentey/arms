import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, MapPin, Home, Building2 } from 'lucide-react'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'
import ErrorBoundary from '../components/ErrorBoundary'
import MapLocationPicker from '../components/MapLocationPicker'
import toast from 'react-hot-toast'
import { usersApi } from '../services/api'

// Ward/Area options
const wardOptions = [
  { value: 'Ward', label: 'Ward' },
  { value: 'Area', label: 'Area' }
]

// Property type options
const propertyTypeOptions = [
  { value: 'Residential', label: 'Residential' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Industrial', label: 'Industrial' },
  { value: 'Institutional', label: 'Institutional' },
  { value: 'Mixed Use', label: 'Mixed Use' }
]

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    street: user?.street || '',
    ward: user?.ward || '',
    houseNumber: user?.houseNumber || '',
    landmark: user?.landmark || '',
    propertyType: user?.propertyType || '',
    latitude: user?.latitude || 6.4478, // Default to Amuwo Odofin
    longitude: user?.longitude || 3.2945,
  })

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'street':
        if (!value.trim()) return 'Street address is required'
        if (value.trim().length < 3) return 'Street address must be at least 3 characters'
        return ''
      case 'ward':
        if (!value.trim()) return 'Ward/area is required'
        return ''
      case 'houseNumber':
        if (!value.trim()) return 'House number is required'
        return ''
      case 'landmark':
        return ''
      case 'propertyType':
        return ''
      default:
        return ''
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const newErrors: Record<string, string> = {}
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData])
      if (error) {
        newErrors[key] = error
      }
    })
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsLoading(true)
    try {
      const updatedUser = await usersApi.updateProfile({
        street: formData.street.trim(),
        ward: formData.ward.trim(),
        houseNumber: formData.houseNumber.trim(),
        landmark: formData.landmark.trim(),
        propertyType: formData.propertyType.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
      })
      updateUser(updatedUser)
      
      // Invalidate user cache to refresh the data
      queryClient.invalidateQueries({ queryKey: ['user'] })
      
      toast.success('Profile updated successfully!')
      navigate('/app', { replace: true })
    } catch (error) {
      console.error('Profile update error:', error)
      setErrors({ submit: 'Failed to update profile. Please try again.' })
    } finally {
      setIsLoading(false)
    }
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
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h1 className="heading-2 text-slate-900">Edit Address</h1>
                <p className="body text-slate-600">Update your location information</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Input
                  name="houseNumber"
                  label="House Number"
                  placeholder="Enter your house number"
                  value={formData.houseNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.houseNumber}
                  leftIcon={<Home className="h-4 w-4" />}
                  required
                />

                <div className="sm:col-span-2">
                  <Input
                    name="street"
                    label="Street Address"
                    placeholder="Enter your street address"
                    value={formData.street}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.street}
                    leftIcon={<Home className="h-4 w-4" />}
                    required
                  />
                </div>
                
                <Select
                  name="ward"
                  label="Ward/Area"
                  value={formData.ward}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.ward}
                  leftIcon={<Building2 className="h-4 w-4" />}
                  options={wardOptions}
                  required
                />
                
                <Input
                  name="landmark"
                  label="Landmark (Optional)"
                  placeholder="Enter nearby landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.landmark}
                  leftIcon={<MapPin className="h-4 w-4" />}
                />
                
                <Select
                  name="propertyType"
                  label="Property Type"
                  value={formData.propertyType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.propertyType}
                  leftIcon={<Building2 className="h-4 w-4" />}
                  options={propertyTypeOptions}
                />
              </div>
              
              {/* Precise Location Map */}
              <div className="border-t border-slate-200 pt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary-600" />
                    Precise Location
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Click on the map to pinpoint your exact location, or use GPS for automatic detection
                  </p>
                </div>
                
                <MapLocationPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationChange={(lat, lon) => {
                    setFormData(prev => ({ ...prev, latitude: lat, longitude: lon }))
                  }}
                  height="450px"
                  zoom={16}
                />
              </div>
              
              {errors.submit && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-4">
                  <p className="text-sm text-rose-700">{errors.submit}</p>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/app')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default Profile
