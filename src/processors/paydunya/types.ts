export type CustomData = Record<string, string | Record<string, string>>

export type PaydunyaRequest = {
  invoice: {
    total_amount: number
    description: string
  }
  store: {
    name: string
  }
  actions: {
    cancel_url: string
    return_url: string
    callback_url: string
  }
  custom_data?: CustomData
}

export type PaydunyaResponse = {
  response_code: string
  response_text: string
  description: string
  token: string
}

/**
 * @internal
 * This is the type of the webhook payload that PayDunya sends to your webhook URL.
 * It is generic over the `custom_data` field so you can customize it to any JSON-compatible type.
 *
 * @example
 * ```ts
 * type MyCustomData = { userId: number }
 * type MyWebhookResponse = PaydunyaWebhookResponse<MyCustomData>
 * ```
 */
export type PaydunyaWebhookResponse<T extends CustomData> = {
  data: {
    response_code: string
    response_text: string
    hash: string
    invoice: {
      token: string
      total_amount: number
      description: string
    }
    custom_data: T
    actions: {
      cancel_url: string
      callback_url: string
      return_url: string
    }
    mode: string
    status: string
    customer: {
      name: string
      phone: string
      email: string
    }
    receipt_url: string
  }
}
