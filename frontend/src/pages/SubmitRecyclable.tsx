import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Package, DollarSign, Calculator, AlertCircle } from 'lucide-react'
import { recyclablesApi } from '../services/api'
import { RecyclableType } from '../types'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import Surface from '../components/Surface'
import ErrorBoundary from '../components/ErrorBoundary'

const recyclableTypeOptions = [
  { value: 'plastic_bottles' as RecyclableType, label: 'Plastic Bottles' },
  { value: 'glass_bottles' as RecyclableType, label: 'Glass Bottles' },
  { value: 'aluminum_cans' as RecyclableType, label: 'Aluminum Cans' },
  { value: 'cardboard' as RecyclableType, label: 'Cardboard' },
  { value: 'paper' as RecyclableType, label: 'Paper' },
  { value: 'metal_scraps' as RecyclableType, label: 'Metal Scraps' },
  { value: 'electronics' as RecyclableType, label: 'Electronics' },
  { value: 'other' as RecyclableType, label: 'Other' },
]

const unitOptions = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'liters', label: 'Liters' },
]

const pricingPerKg: Record<RecyclableType, number> = {
  'plastic_bottles': 0.50,
  'glass_bottles': 0.30,
  'aluminum_cans': 1.20,
  'cardboard': 0.25,
  'paper': 0.40,
  'metal_scraps': 0.80,
  'electronics': 2.50,
  'other': 0.20,
}

const SubmitRecyclable: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    type: '',
    quantity: '',
    unit: 'kg',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get valuation summary
  const { data: valuationSummary } = useQuery({
    queryKey: ['valuation-summary'],
    queryFn: recyclablesApi.getValuationSummary,
  })

  // Submit recyclable mutation
  const submitMutation = useMutation({
    mutationFn: recyclablesApi.submitRecyclable,
    onSuccess: () => {
      navigate('/app/recyclables', { 
        state: { message: 'Recyclable submitted successfully!' } 
      })
    },
    onError: (error: any) => {
      console.error('Submit error:', error.response?.data?.message || error.message)
    },
  })

  const calculateEstimatedValue = () => {
    if (!formData.type || !formData.quantity) return 0
    
    const quantity = parseFloat(formData.quantity)
    if (isNaN(quantity) || quantity <= 0) return 0
    
    // For kg units, use direct pricing
    if (formData.unit === 'kg') {
      const pricePerKg = pricingPerKg[formData.type as RecyclableType] || 0.20
      return Math.round(quantity * pricePerKg * 100) / 100
    }
    
    // For other units, estimate as kg (rough conversion)
    const estimatedKg = quantity * 0.5 // Rough estimate
    const pricePerKg = pricingPerKg[formData.type as RecyclableType] || 0.20
    return Math.round(estimatedKg * pricePerKg * 100) / 100
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.type) {
      newErrors.type = 'Please select a recyclable type'
    }
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid quantity'
    }
    
    if (!formData.unit) {
      newErrors.unit = 'Please select a unit'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    submitMutation.mutate({
      type: formData.type as RecyclableType,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      description: formData.description.trim() || undefined,
    })
  }

  const estimatedValue = calculateEstimatedValue()

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
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Submit Recyclable</h1>
                <p className="text-slate-600">Log your recyclable items for valuation</p>
              </div>
            </div>
          </div>

          {/* Valuation Summary */}
          {valuationSummary && (
            <div className="mb-6">
              <Surface title="Your Valuation Summary" subtitle="Current earnings and pending items">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                      <p className="text-sm font-medium text-emerald-900">Total Estimated</p>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-emerald-900">
                      ${valuationSummary.totalEstimated}
                    </p>
                  </div>
                  
                  <div className="rounded-lg bg-primary-50 border border-primary-200 p-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary-600" />
                      <p className="text-sm font-medium text-primary-900">Pending Items</p>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-primary-900">
                      {valuationSummary.pendingItems}
                    </p>
                  </div>
                </div>
              </Surface>
            </div>
          )}

          {/* Submit Form */}
          <Surface title="Submit New Recyclable" subtitle="Enter details about your recyclable items">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Select
                  name="type"
                  label="Recyclable Type"
                  value={formData.type}
                  onChange={handleChange}
                  error={errors.type}
                  options={recyclableTypeOptions}
                  required
                />
                
                <Input
                  name="quantity"
                  label="Quantity"
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  error={errors.quantity}
                  leftIcon={<Calculator className="h-4 w-4" />}
                  required
                />
              </div>

              <Select
                name="unit"
                label="Unit"
                value={formData.unit}
                onChange={handleChange}
                error={errors.unit}
                options={unitOptions}
                required
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0"
                  placeholder="Add any additional details about the recyclable items..."
                />
              </div>

              {/* Estimated Value */}
              {estimatedValue > 0 && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-emerald-600" />
                      <p className="text-sm font-medium text-emerald-900">Estimated Value</p>
                    </div>
                    <p className="text-xl font-bold text-emerald-900">
                      ${estimatedValue}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-emerald-700">
                    Based on current market rates for {formData.type}
                  </p>
                </div>
              )}

              {submitMutation.error && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-rose-600" />
                    <p className="text-sm text-rose-700">
                      {submitMutation.error.response?.data?.message || 'Failed to submit recyclable. Please try again.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={!formData.type || !formData.quantity || submitMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {submitMutation.isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4" />
                      Submit Recyclable
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/app')}
                  disabled={submitMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Surface>

          {/* Pricing Info */}
          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Current Pricing (per kg)</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                  <div>• Plastic Bottles: $0.50</div>
                  <div>• Glass Bottles: $0.30</div>
                  <div>• Aluminum Cans: $1.20</div>
                  <div>• Cardboard: $0.25</div>
                  <div>• Paper: $0.40</div>
                  <div>• Metal Scraps: $0.80</div>
                  <div>• Electronics: $2.50</div>
                  <div>• Other: $0.20</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default SubmitRecyclable
