import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarClock, CheckCircle2, Truck, XCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatePanel from '../components/StatePanel'
import StatsCard from '../components/StatsCard'
import Surface from '../components/Surface'
import WasteTimeline from '../components/WasteTimeline'
import { useAuth } from '../contexts/AuthContext'
import { wasteCollectionsApi } from '../services/api'
import { buildGoogleMapsUrl, hasCoordinates } from '../utils/maps'

const WasteHistory: React.FC = () => {
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'verified'
  >('all')

  const {
    data: collections,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['waste-collections'],
    queryFn: user?.role === 'resident' ? wasteCollectionsApi.getMyCollections : wasteCollectionsApi.getCollections,
  })

  const completedCount =
    collections?.filter((collection) => ['completed', 'verified'].includes(collection.status)).length || 0
  const scheduledCount = collections?.filter((collection) => collection.status === 'scheduled').length || 0
  const missedCount = collections?.filter((collection) => collection.status === 'missed').length || 0

  const filteredCollections = useMemo(() => {
    if (!collections?.length) return []
    if (statusFilter === 'all') return collections
    return collections.filter((collection) => collection.status === statusFilter)
  }, [collections, statusFilter])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Collections"
        title="Waste history"
        description="Review pickup activity, track missed visits, and keep collection status easy to verify."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total routes"
          value={isLoading ? 'Loading...' : `${collections?.length || 0}`}
          icon={<Truck className="h-5 w-5" />}
          color="teal"
        />
        <StatsCard
          title="Completed"
          value={isLoading ? 'Loading...' : `${completedCount}`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="emerald"
        />
        <StatsCard
          title="Scheduled"
          value={isLoading ? 'Loading...' : `${scheduledCount}`}
          icon={<CalendarClock className="h-5 w-5" />}
          color="sky"
        />
        <StatsCard
          title="Missed"
          value={isLoading ? 'Loading...' : `${missedCount}`}
          icon={<XCircle className="h-5 w-5" />}
          color="rose"
        />
      </div>

      <Surface
        title="Collection timeline"
        subtitle="Latest and historical pickup entries stay visible in one scrollable feed."
      >
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`btn h-9 px-3 ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('scheduled')}
            className={`btn h-9 px-3 ${statusFilter === 'scheduled' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Scheduled
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('in_progress')}
            className={`btn h-9 px-3 ${statusFilter === 'in_progress' ? 'btn-primary' : 'btn-secondary'}`}
          >
            In progress
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`btn h-9 px-3 ${statusFilter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Completed
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('verified')}
            className={`btn h-9 px-3 ${statusFilter === 'verified' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Verified
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('missed')}
            className={`btn h-9 px-3 ${statusFilter === 'missed' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Missed
          </button>
        </div>

        {isError ? (
          <StatePanel
            tone="error"
            title="Couldn't load waste history"
            description="Collection history is temporarily unavailable."
          />
        ) : isLoading ? (
          <StatePanel
            tone="loading"
            title="Loading history"
            description="Fetching collection records and verification details."
          />
        ) : (
          <WasteTimeline
            collections={filteredCollections.map((collection) => ({
              ...collection,
              mapsUrl: hasCoordinates(collection.latitude, collection.longitude)
                ? buildGoogleMapsUrl(
                    Number(collection.latitude),
                    Number(collection.longitude),
                    collection.address || collection.id,
                  )
                : undefined,
            }))}
            canConfirm={user?.role === 'resident'}
          />
        )}
      </Surface>
    </div>
  )
}

export default WasteHistory
