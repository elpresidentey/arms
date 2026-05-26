export const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null) {
    const maybeMessage =
      (error as { response?: { data?: { message?: string } } }).response?.data?.message

    if (Array.isArray(maybeMessage)) {
      return maybeMessage.join(', ')
    }

    if (maybeMessage) {
      return maybeMessage
    }

    if ((error as { message?: string }).message === 'Network Error') {
      return 'Unable to reach the server. Please make sure the backend is running.'
    }

    const message = (error as { message?: string }).message

    if (message) {
      return message
    }
  }

  return fallback
}
