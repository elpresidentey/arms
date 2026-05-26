import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Receipt } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import BillReceipt from '../components/billing/BillReceipt'
import StatePanel from '../components/StatePanel'
import PageHeader from '../components/PageHeader'
import { billingApi } from '../services/api'

const BillReceiptPage = () => {
  const { billId } = useParams<{ billId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: bill, isLoading, isError } = useQuery({
    queryKey: ['bill', billId],
    queryFn: () => billingApi.getBill(billId!),
    enabled: !!billId,
  })

  if (!user) return null

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Payment Receipt"
        description="View, print, or download your official refuse service payment receipt"
        action={
          <button
            type="button"
            onClick={() => navigate('/app/bills')}
            className="btn btn-secondary h-11 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to bills
          </button>
        }
      />

      {isLoading ? (
        <StatePanel tone="loading" title="Loading receipt" description="Fetching your payment details." />
      ) : isError || !bill ? (
        <StatePanel
          tone="error"
          title="Receipt unavailable"
          description="We couldn't load this receipt. It may not exist or you may not have access."
          action={
            <Link to="/app/bills" className="btn btn-primary h-11 mt-4 inline-flex">
              Go to My Bills
            </Link>
          }
        />
      ) : bill.status !== 'paid' ? (
        <StatePanel
          tone="empty"
          title="Receipt not ready"
          description="A receipt is available after your bill is paid. Pay the outstanding bill first."
          action={
            <Link to="/app/bills" className="btn btn-primary h-11 mt-4 inline-flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Pay bill
            </Link>
          }
        />
      ) : (
        <div className="mx-auto max-w-2xl">
          <BillReceipt bill={bill} customer={user} showActions />
        </div>
      )}
    </div>
  )
}

export default BillReceiptPage
