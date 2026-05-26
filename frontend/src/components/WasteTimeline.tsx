import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, Clock, XCircle, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import { WasteCollection } from '../types'
import { wasteCollectionsApi } from '../services/api'
import StatePanel from './StatePanel'
import { getErrorMessage } from '../utils/errors'
import { formatDayTime } from '../utils/format'

type WasteCollectionWithMaps = WasteCollection & {
  mapsUrl?: string
}

interface WasteTimelineProps {
  collections: WasteCollectionWithMaps[]
  canConfirm?: boolean
}

const WasteTimeline: React.FC<WasteTimelineProps> = ({ collections, canConfirm = false }) => {
  const queryClient = useQueryClient()
  const [truckCodes, setTruckCodes] = useState<Record<string, string>>({})

  const confirmMutation = useMutation({
    mutationFn: (payload: { id: string; code: string }) => wasteCollectionsApi.confirmCollection(payload.id, payload.code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waste-collections'] })
      toast.success('Pickup confirmation saved.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not confirm pickup.'))
    },
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />
      case 'in_progress':
        return <Truck className="w-5 h-5 text-primary-700" />
      case 'missed':
        return <XCircle className="w-5 h-5 text-rose-600" />
      default:
        return <Clock className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200'
      case 'in_progress':
        return 'text-primary-700 bg-primary-50 border-primary-200'
      case 'missed':
        return 'text-rose-700 bg-rose-50 border-rose-200'
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
  }

  if (collections.length === 0) {
    return (
      <StatePanel
        title="No collections yet"
        description="Pickup history will appear here as soon as your route starts logging visits."
      />
    )
  }

  return (
    <div className="space-y-3">
      {collections.map((collection) => (
        <div
          key={collection.id}
          className="rounded-lg border border-slate-200 bg-white px-4 py-4 hover:shadow-sm transition-shadow duration-200"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">
              {getStatusIcon(collection.status)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="truncate text-sm font-medium text-slate-900">{collection.address}</p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${getStatusColor(collection.status)}`}
                >
                  {formatStatus(collection.status)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                <span>
                  {collection.actualCollectionTime
                    ? formatDayTime(collection.actualCollectionTime)
                    : `${formatDayTime(collection.scheduledDate)} scheduled`}
                </span>
                {collection.mapsUrl ? (
                  <a
                    href={collection.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-primary-700 hover:text-primary-800"
                  >
                    Open in Maps
                  </a>
                ) : null}
                {collection.scheduledTruckCode ? <span>Truck: {collection.scheduledTruckCode}</span> : null}
                {collection.isVerified && (
                  <span className="inline-flex items-center text-emerald-700 font-medium">
                    <CheckCircle className="mr-1 h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
                {collection.residentConfirmed ? (
                  <span className="inline-flex items-center text-primary-700 font-medium">
                    <CheckCircle className="mr-1 h-3.5 w-3.5" />
                    Resident confirmed
                  </span>
                ) : null}
              </div>
              {collection.notes && <p className="mt-2 text-sm text-slate-700">{collection.notes}</p>}

              {canConfirm &&
              !collection.residentConfirmed &&
              collection.status === 'in_progress' ? (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Confirm pickup</p>
                      <p className="mt-1 text-xs text-slate-600">
                        Enter the truck code you observed to help verify the visit.
                      </p>
                    </div>
                    <div className="flex flex-1 gap-2 sm:justify-end">
                      <input
                        className="input h-10 w-full sm:w-56"
                        placeholder="Observed truck code"
                        value={truckCodes[collection.id] || ''}
                        onChange={(event) =>
                          setTruckCodes((prev) => ({
                            ...prev,
                            [collection.id]: event.target.value,
                          }))
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-primary h-10 px-4"
                        disabled={!String(truckCodes[collection.id] || '').trim() || confirmMutation.isPending}
                        onClick={() =>
                          confirmMutation.mutate({
                            id: collection.id,
                            code: (truckCodes[collection.id] || '').trim(),
                          })
                        }
                      >
                        {confirmMutation.isPending ? 'Saving...' : 'Confirm'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default WasteTimeline
