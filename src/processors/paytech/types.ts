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
