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
  custom_data?: Object
}

export interface PaydunyaResponse {
  response_code: string
  response_text: string
  description: string
  token: string
}
