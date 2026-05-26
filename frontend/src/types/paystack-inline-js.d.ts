declare module '@paystack/inline-js' {
  export interface PaystackSuccessResponse {
    id: number
    reference: string
    message: string
  }

  export interface PaystackErrorResponse {
    message: string
  }

  export interface PaystackTransactionCallbacks {
    onSuccess?: (response: PaystackSuccessResponse) => void
    onCancel?: () => void
    onError?: (error: PaystackErrorResponse) => void
    onLoad?: (response: { id: number; customer: object; accessCode: string }) => void
  }

  export default class PaystackPop {
    resumeTransaction(accessCode: string, callbacks?: PaystackTransactionCallbacks): unknown
    newTransaction(config: Record<string, unknown>, callbacks?: PaystackTransactionCallbacks): unknown
  }
}
