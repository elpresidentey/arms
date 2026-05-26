import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Package, Plus, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import StatePanel from '../components/StatePanel'
import Surface from '../components/Surface'
import { recyclablesApi } from '../services/api'
import { Recyclable } from '../types'
import { getErrorMessage } from '../utils/errors'
import { formatCurrency, formatDayTime } from '../utils/format'
import { useAuth } from '../contexts/AuthContext'

const recyclableTypes = [
  { value: 'plastic_bottles', label: 'Plastic Bottles', rate: 50 },
  { value: 'glass_bottles', label: 'Glass Bottles', rate: 30 },
  { value: 'aluminum_cans', label: 'Aluminum Cans', rate: 80 },
  { value: 'cardboard', label: 'Cardboard', rate: 20 },
  { value: 'paper', label: 'Paper', rate: 15 },
  { value: 'metal_scraps', label: 'Metal Scraps', rate: 100 },
  { value: 'electronics', label: 'Electronics', rate: 200 },
  { value: 'other', label: 'Other', rate: 25 },
] as const

const statusStyles: Record<string, string> = {
  logged: 'bg-slate-100 text-slate-700',
  pickup_requested: 'bg-amber-50 text-amber-700',
  collected: 'bg-primary-50 text-primary-700',
  processed: 'bg-violet-50 text-violet-700',
  paid: 'bg-emerald-50 text-emerald-700',
}

const statusLabels: Record<string, string> = {
  logged: 'Logged',
  pickup_requested: 'Pickup pending',
  collected: 'Collected',
  processed: 'Processed',
  paid: 'Paid',
}

type RecyclableFormState = {
  type: Recyclable['type']
  quantity: number
  description: string
}

const Recyclables: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isResident = user?.role === 'resident'
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Recyclable | null>(null)
  const [formData, setFormData] = useState<RecyclableFormState>({
    type: 'plastic_bottles',
    quantity: 1,
    description: '',
  })
  const [adminEditData, setAdminEditData] = useState<{
    status: string
    actualValue: number
  }>({
    status: 'logged',
    actualValue: 0,
  })

  const {
    data: recyclables,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [isResident ? 'my-recyclables' : 'recyclables', user?.id],
    queryFn: isResident ? recyclablesApi.getMyRecyclables : recyclablesApi.getRecyclables,
    enabled: Boolean(user?.id),
  })

  const createMutation = useMutation({
    mutationFn: recyclablesApi.createRecyclable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recyclables', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['my-recyclables', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['valuation-summary', user?.id] })
      setShowForm(false)
      setFormData({ type: 'plastic_bottles', quantity: 1, description: '' })
      toast.success('Recyclable item added.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not add recyclable item.'))
    },
  })

  const pickupMutation = useMutation({
    mutationFn: recyclablesApi.requestPickup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recyclables', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['my-recyclables', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['valuation-summary', user?.id] })
      toast.success('Pickup request sent.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not request pickup.'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Recyclable> }) =>
      recyclablesApi.updateRecyclable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recyclables', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['my-recyclables', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['valuation-summary', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['wallet-balance', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions', user?.id] })
      setEditingItem(null)
      toast.success('Recyclable updated. Wallet will be credited if status is "Paid".')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not update recyclable.'))
    },
  })

  const selectedType = recyclableTypes.find((item) => item.value === formData.type)
  const estimatedValue = formData.quantity * (selectedType?.rate || 0)
  const pendingCount =
    recyclables?.filter((item) => item.status === 'logged' || item.status === 'pickup_requested')
      .length || 0
  const totalValue =
    recyclables?.reduce((sum, item) => {
      const value = Number(item.actualValue) || Number(item.estimatedValue) || 0
      return sum + value
    }, 0) || 0

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    createMutation.mutate({
      ...formData,
      unit: 'pieces',
      estimatedValue,
    })
  }

  const handleAdminUpdate = (event: React.FormEvent) => {
    event.preventDefault()
    if (!editingItem) return

    updateMutation.mutate({
      id: editingItem.id,
      data: {
        status: adminEditData.status as Recyclable['status'],
        actualValue: adminEditData.actualValue,
      },
    })
  }

  const startEditing = (item: Recyclable) => {
    setEditingItem(item)
    setAdminEditData({
      status: item.status,
      actualValue: item.actualValue || item.estimatedValue,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Recycling"
        title={isResident ? 'My recyclables' : 'Recycling oversight'}
        description={
          isResident
            ? 'Log recyclable items, request pickup, and track value from your resident account.'
            : 'Review resident recyclable submissions and update processing status. Admin accounts cannot add resident recyclables.'
        }
        action={
          isResident ? (
            <button
              type="button"
              onClick={() => setShowForm((current) => !current)}
              className="btn btn-primary h-11 px-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              {showForm ? 'Close form' : 'Add item'}
            </button>
          ) : undefined
        }
        meta={
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
              <p className="label text-slate-500">Items</p>
              <p className="mt-2 heading-3 text-slate-950">
                {isLoading ? 'Loading...' : recyclables?.length || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 shadow-sm">
              <p className="label text-emerald-700">
                Estimated value
              </p>
              <p className="mt-2 heading-3 text-emerald-900">
                {isLoading ? 'Loading...' : formatCurrency(totalValue)}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3 shadow-sm">
              <p className="label text-amber-700">
                Pending pickups
              </p>
              <p className="mt-2 heading-3 text-amber-900">
                {isLoading ? 'Loading...' : pendingCount}
              </p>
            </div>
          </div>
        }
      />

      {!isResident && (
        <Surface
          title="Admin recycling role"
          subtitle="This is an oversight queue, not a resident submission form."
        >
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="heading-4 text-slate-950">Residents submit items</p>
              <p className="mt-2 body-small text-slate-500">Only resident accounts can add recyclable records or request pickup.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="heading-4 text-slate-950">Admins review status</p>
              <p className="mt-2 body-small text-slate-500">Use this queue to monitor logged, collected, processed, and paid items.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="heading-4 text-slate-950">Resident history stays separate</p>
              <p className="mt-2 body-small text-slate-500">Each record remains tied to the resident who submitted it.</p>
            </div>
          </div>
        </Surface>
      )}

      {isResident && showForm && (
        <Surface
          title="Add recyclable item"
          subtitle="Capture the item type and quantity before sending it for pickup."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="recyclable-type" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Item type
                </label>
                <select
                  id="recyclable-type"
                  className="input"
                  value={formData.type}
                  onChange={(event) =>
                    setFormData({ ...formData, type: event.target.value as Recyclable['type'] })
                  }
                >
                  {recyclableTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} ({formatCurrency(type.rate)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="recyclable-quantity" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Quantity
                </label>
                <input
                  id="recyclable-quantity"
                  type="number"
                  min="1"
                  className="input"
                  value={formData.quantity}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(event.target.value, 10) || 1,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label htmlFor="recyclable-description" className="mb-1.5 block text-sm font-medium text-slate-700">
                Notes
              </label>
              <textarea
                id="recyclable-description"
                className="input min-h-[112px] resize-none py-3"
                placeholder="Add any pickup notes or item details."
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                  Projected value
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{formatCurrency(estimatedValue)}</p>
              </div>
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
                  disabled={createMutation.isPending}
                  className="btn btn-primary h-11 px-4"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save item'}
                </button>
              </div>
            </div>
          </form>
        </Surface>
      )}

      {!isResident && editingItem && (
        <Surface
          title="Update recyclable status"
          subtitle="Process the item and mark as paid to credit the resident's wallet automatically."
        >
          <form onSubmit={handleAdminUpdate} className="space-y-4">
            <div className="rounded-2xl border border-primary-100 bg-primary-50/50 px-4 py-4">
              <p className="text-sm font-semibold text-primary-900">Resident Information</p>
              <p className="mt-2 text-sm text-primary-700">
                {editingItem.user?.firstName} {editingItem.user?.lastName} ({editingItem.user?.email})
              </p>
              <p className="mt-1 text-xs text-primary-600">
                Logged on {formatDayTime(editingItem.createdAt)}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="admin-status" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  id="admin-status"
                  className="input"
                  value={adminEditData.status}
                  onChange={(event) =>
                    setAdminEditData({ ...adminEditData, status: event.target.value })
                  }
                >
                  <option value="logged">Logged</option>
                  <option value="pickup_requested">Pickup Requested</option>
                  <option value="collected">Collected</option>
                  <option value="processed">Processed</option>
                  <option value="paid">Paid</option>
                </select>
                <p className="mt-1.5 text-xs text-slate-500">
                  {adminEditData.status === 'paid' && '⚠️ Setting to "Paid" will automatically credit the resident\'s wallet'}
                </p>
              </div>
              <div>
                <label htmlFor="admin-actual-value" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Actual Value (₦)
                </label>
                <input
                  id="admin-actual-value"
                  type="number"
                  min="0"
                  step="0.01"
                  className="input"
                  value={adminEditData.actualValue}
                  onChange={(event) =>
                    setAdminEditData({
                      ...adminEditData,
                      actualValue: parseFloat(event.target.value) || 0,
                    })
                  }
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Estimated: {formatCurrency(editingItem.estimatedValue)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
              <p className="text-sm font-semibold text-amber-900">💡 Payment Flow</p>
              <ul className="mt-2 space-y-1 text-sm text-amber-700">
                <li>• <strong>Collected</strong>: Item picked up from resident</li>
                <li>• <strong>Processed</strong>: Item weighed and valued</li>
                <li>• <strong>Paid</strong>: Wallet credited automatically (₦{Number(adminEditData.actualValue || 0).toFixed(2)})</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="btn btn-secondary h-11 px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="btn btn-primary h-11 px-4"
              >
                {updateMutation.isPending ? 'Updating...' : 'Update & Process'}
              </button>
            </div>
          </form>
        </Surface>
      )}

      <Surface
        title={isResident ? 'Logged items' : 'Resident recyclable queue'}
        subtitle={isResident ? 'Every item stays visible from logging through payout.' : 'Resident submissions shown for operations review.'}
      >
        {isError ? (
          <StatePanel
            tone="error"
            title="Couldn't load recyclables"
            description="The recyclable list is temporarily unavailable."
          />
        ) : isLoading ? (
          <StatePanel
            tone="loading"
            title="Loading recyclables"
            description="Fetching your logged items and pickup status."
          />
        ) : !recyclables?.length ? (
          <StatePanel
            title="No recyclable items yet"
            description={
              isResident
                ? 'Add your first recyclable item to start tracking value and pickup status.'
                : 'Resident recyclable submissions will appear here for admin review.'
            }
          />
        ) : (
          <div className="space-y-3">
            {recyclables.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-950">
                      {recyclableTypes.find((type) => type.value === item.type)?.label || item.type}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.quantity} {item.unit} | {formatCurrency(Number(item.actualValue) || Number(item.estimatedValue) || 0)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Logged {formatDayTime(item.createdAt)}</p>
                    {item.description && (
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[item.status] || statusStyles.logged
                    }`}
                  >
                    {statusLabels[item.status] || item.status}
                  </span>
                  {isResident && (item.status === 'logged' || item.status === 'pickup_requested') && (
                    <button
                      type="button"
                      onClick={() => pickupMutation.mutate(item.id)}
                      disabled={pickupMutation.isPending || item.status === 'pickup_requested'}
                      className="btn btn-secondary h-10 px-4 text-sm"
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      {item.status === 'pickup_requested' ? 'Pickup requested' : 'Request pickup'}
                    </button>
                  )}
                  {!isResident && (
                    <button
                      type="button"
                      onClick={() => startEditing(item)}
                      className="btn btn-primary h-10 px-4 text-sm"
                    >
                      Process Item
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

export default Recyclables
