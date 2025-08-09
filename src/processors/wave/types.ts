export type WaveRequest = {
  amount: number
  currency: 'XOF'
  error_url: string
  success_url: string
  client_reference?: string
}

export type WaveResponse = {
  id: string
  amount: string
  checkout_status: 'open' | 'complete' | 'expired'
  client_reference: string
  currency: 'XOF'
  error_url: string
  last_payment_error: string | null
  business_name: string
  payment_status: string
  transaction_id: string
  aggregated_merchant_id: string
  success_url: string
  wave_launch_url: string
  when_completed: string
  when_created: string
  when_expires: string
}

export type WaveWebhookResponse = {
  id: string
  type: string
  data: {
    id: string
    amount: string
    checkout_status: 'open' | 'complete' | 'expired'
    client_reference: string
    currency: string
    error_url: string
    last_payment_error: string | null
    business_name: string
    payment_status: string
    transaction_id: string
    aggregated_merchant_id: string
    success_url: string
    wave_launch_url: string
    when_completed: string
    when_created: string
    when_expires: string
  }
}
