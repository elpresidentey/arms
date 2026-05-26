import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import PaystackPop from '@paystack/inline-js'
import toast from 'react-hot-toast'
import { billingApi } from '../services/api'
import { Bill } from '../types'
import { getErrorMessage } from '../utils/errors'

const canUseInlineCheckout = () => Boolean(import.meta.env.VITE_PAYSTACK_PUBLIC_KEY)

export const usePayBill = () => {
  const queryClient = useQueryClient()
  const [payingBillId, setPayingBillId] = useState<string | null>(null)

  const payBill = useCallback(
    async (bill: Bill) => {
      if (bill.status === 'paid') {
        toast.error('This bill is already paid')
        return
      }
      if (bill.status === 'cancelled') {
        toast.error('This bill has been cancelled')
        return
      }

      setPayingBillId(bill.id)

      try {
        const data = await billingApi.initiatePayment(bill.id)
        const accessCode = data.accessCode

        if (canUseInlineCheckout() && accessCode) {
          const popup = new PaystackPop()
          popup.resumeTransaction(accessCode, {
            onSuccess: async (response: { reference: string }) => {
              try {
                const result = await billingApi.verifyPayment(response.reference)
                if (result.status === 'success') {
                  toast.success('Payment successful! Your receipt is ready.')
                  await queryClient.invalidateQueries({ queryKey: ['my-bills'] })
                } else {
                  toast.error('Payment could not be confirmed. Contact support if you were charged.')
                }
              } catch (error) {
                toast.error(getErrorMessage(error, 'Failed to confirm payment'))
              } finally {
                setPayingBillId(null)
              }
            },
            onCancel: () => {
              toast('Payment cancelled', { icon: 'ℹ️' })
              setPayingBillId(null)
            },
            onError: (err: { message?: string }) => {
              toast.error(err?.message || 'Could not open payment')
              setPayingBillId(null)
            },
          })
          return
        }

        if (data.authorizationUrl) {
          window.location.href = data.authorizationUrl
          return
        }

        throw new Error('Payment could not be started')
      } catch (error) {
        toast.error(getErrorMessage(error, 'Could not start payment'))
        setPayingBillId(null)
      }
    },
    [queryClient],
  )

  return {
    payBill,
    payingBillId,
    isPaying: payingBillId !== null,
    isPayingBill: (billId: string) => payingBillId === billId,
  }
}
