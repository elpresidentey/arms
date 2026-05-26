import { CreditCard } from 'lucide-react'
import { Bill } from '../../types'
import { usePayBill } from '../../hooks/usePayBill'
import { formatCurrency } from '../../utils/format'
import Button from '../Button'

interface PayBillButtonProps {
  bill: Bill
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline'
  showAmount?: boolean
  fullWidth?: boolean
  className?: string
}

const PayBillButton = ({
  bill,
  size = 'md',
  variant = 'primary',
  showAmount = false,
  fullWidth = false,
  className,
}: PayBillButtonProps) => {
  const { payBill, isPayingBill } = usePayBill()
  const loading = isPayingBill(bill.id)

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={className}
      isLoading={loading}
      leftIcon={!loading ? <CreditCard className="h-4 w-4" /> : undefined}
      onClick={() => payBill(bill)}
      disabled={loading}
    >
      {showAmount
        ? `Pay bills · ${formatCurrency(bill.totalAmount)}`
        : loading
          ? 'Opening checkout…'
          : 'Pay bills'}
    </Button>
  )
}

export default PayBillButton
