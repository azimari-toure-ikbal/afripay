export type WaveRequest = {
  amount: number
  currency: string
  error_url: string
  success_url: string
  client_reference: string
}

export type WaveResponse = {
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

export type PaytechRequest = {
  item_name: string
  item_price: number
  currency: string
  ref_command: string
  command_name: string
  env: 'test' | 'prod'
  ipn_url: string
  success_url: string
  cancel_url: string
  custom_field: string
}

export type PaytechResponse = {
  success: number
  token: string
  redirect_url: string
  redirectUrl: string
}

export type PaydunyaRequest = {
  invoice: {
    total_amount: number
    description: string
  }
  store: {
    name: string
  }
  mode: 'test' | 'live'
  actions: {
    cancel_url: string
    return_url: string
    callback_url: string
  }
  custom_data: Object
}

export interface PaydunyaResponse {
  response_code: string
  response_text: string
  description: string
  token: string
}
