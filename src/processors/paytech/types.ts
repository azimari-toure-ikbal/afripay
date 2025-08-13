export const PAYMENT_METHODS = [
  'Orange Money',
  'Orange Money CI',
  'Orange Money ML',
  'Mtn Money CI',
  'Moov Money CI',
  'Moov Money ML',
  'Wave',
  'Wave CI',
  'Wizall',
  'Carte Bancaire',
  'Emoney',
  'Tigo Cash',
  'Free Money',
  'Moov Money BJ',
  'Mtn Money BJ',
] as const
export type PAYMENT_METHODS = (typeof PAYMENT_METHODS)[number]

export type PaytechRequest = {
  item_name: string
  item_price: number
  ref_command: string
  command_name: string
  currency?: 'XOF' | 'EUR' | 'USD' | 'CAD' | 'GBP' | 'MAD' // default XOF
  env: 'test' | 'prod'
  ipn_url?: string // only HTTPS
  success_url?: string // only HTTPS
  cancel_url?: string // only HTTPS
  custom_field?: string // JSON encoded
  target_payment?: PAYMENT_METHODS[]
  refund_notif_url?: string // only HTTPS
}

export type PaytechResponse = {
  success: number
  token: string
  redirect_url: string
  redirectUrl: string
}

/**
 * @internal
 * This is the type of the webhook payload that PayTech sends to your webhook URL.
 * It is generic over the `custom_field` field
 * By default, it is a string, but you can customize it to any JSON-compatible type.
 */
export type PaytechWebhookResponse<T = string> = {
  custom_field: T
  currency: string
  api_key_sha256: string
  api_secret_sha256: string
  type_event: string
  ref_command: string
  item_name: string
  item_price: string
  command_name: string
  token: string
  env: string
  payment_method: string
  client_phone: string
}
