// Custom error class for better error handling
// It will have a reason property that will be used to identify the error "missing_api_key" or "request_failed"
// and a message property that will be used to provide a more detailed error message

export class AfriError extends Error {
  reason: 'missing_api_key' | 'request_failed'
  message: string

  constructor(reason: 'missing_api_key' | 'request_failed', message: string) {
    super(message)
    this.reason = reason
    this.message = message
  }
}
