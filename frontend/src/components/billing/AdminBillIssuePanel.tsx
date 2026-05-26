import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, User } from 'lucide-react'
import toast from 'react-hot-toast'
import Surface from '../Surface'
import { billingApi } from '../../services/api'
import { Bill, BillingResidentOption } from '../../types'
import { getErrorMessage } from '../../utils/errors'
import { profilePropertyType, propertyTypeLabel } from '../../utils/billingFormat'

interface AdminBillIssuePanelProps {
  compact?: boolean
}

const residentAddress = (resident: BillingResidentOption) =>
  [resident.houseNumber, resident.street, resident.ward].filter(Boolean).join(', ')

const AdminBillIssuePanel = ({ compact = false }: AdminBillIssuePanelProps) => {
  const queryClient = useQueryClient()
  const [residentSearch, setResidentSearch] = useState('')
  const [selectedResident, setSelectedResident] = useState<BillingResidentOption | null>(null)

  const { data: residents, isLoading: residentsLoading } = useQuery({
    queryKey: ['billing-residents', residentSearch],
    queryFn: () => billingApi.getResidents(residentSearch),
  })

  const issueMutation = useMutation({
    mutationFn: (userId: string) => billingApi.issueBill(userId),
    onSuccess: () => {
      toast.success(`Bill issued to ${selectedResident?.firstName ?? 'resident'}`)
      setSelectedResident(null)
      setResidentSearch('')
      queryClient.invalidateQueries({ queryKey: ['all-bills'] })
      queryClient.invalidateQueries({ queryKey: ['my-bills'] })
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] })
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not issue bill')),
  })

  const generateMutation = useMutation({
    mutationFn: () => billingApi.generateBills(),
    onSuccess: (data: Bill[]) => {
      toast.success(`Issued ${data.length} bill(s) for active residents`)
      queryClient.invalidateQueries({ queryKey: ['all-bills'] })
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] })
      queryClient.invalidateQueries({ queryKey: ['my-bills'] })
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not generate bills')),
  })

  return (
    <Surface
      title="Issue refuse bills"
      subtitle="Search a resident and issue their monthly bill from here"
      action={
        <button
          type="button"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="btn btn-primary h-10 inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Issue all
        </button>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={residentSearch}
            onChange={(event) => setResidentSearch(event.target.value)}
            placeholder="Search residents by name, email, ward, or street"
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm"
          />
        </div>

        {selectedResident ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-primary-200 bg-primary-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <ResidentSummary resident={selectedResident} />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedResident(null)}
                className="btn btn-secondary h-10 px-4"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => issueMutation.mutate(selectedResident.id)}
                disabled={issueMutation.isPending}
                className="btn btn-primary h-10 px-5"
              >
                Issue bill
              </button>
            </div>
          </div>
        ) : (
          <div className={`${compact ? 'max-h-56' : 'max-h-64'} overflow-y-auto rounded-2xl border border-slate-200 divide-y`}>
            {residentsLoading ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">Loading residents...</p>
            ) : !residents?.length ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                {residentSearch.trim()
                  ? 'No residents match your search.'
                  : 'No active residents found.'}
              </p>
            ) : (
              residents.map((resident) => (
                <button
                  key={resident.id}
                  type="button"
                  onClick={() => setSelectedResident(resident)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <ResidentSummary resident={resident} />
                </button>
              ))
            )}
          </div>
        )}

        <p className="text-xs text-slate-500">
          Issued bills appear in the resident dashboard and Pay bills page immediately after refresh.
        </p>
      </div>
    </Surface>
  )
}

const ResidentSummary = ({ resident }: { resident: BillingResidentOption }) => (
  <div className="flex min-w-0 items-start gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
      <User className="h-4 w-4" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-medium text-slate-900">
        {resident.firstName} {resident.lastName}
      </p>
      <p className="truncate text-sm text-slate-600">{resident.email}</p>
      <p className="text-xs text-slate-500">
        {residentAddress(resident) || 'Address on file'} - {propertyTypeLabel(profilePropertyType(resident.propertyType))}
      </p>
    </div>
  </div>
)

export default AdminBillIssuePanel
