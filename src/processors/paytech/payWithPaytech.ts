import type { PaytechRequest, PaytechResponse } from './types'

const PAYTECH_BASE_URL = 'https://paytech.sn/api'

export const payWithPaytech = async (
  request: PaytechRequest,
  mode: 'dev' | 'prod' = 'dev',
): Promise<PaytechResponse> => {
  if (!process.env.PAYTECH_API_KEY) {
    throw new Error('PAYTECH_API_KEY is not set')
  }

  if (!process.env.PAYTECH_API_SECRET) {
    throw new Error('PAYTECH_API_SECRET is not set')
  }

  const res = await fetch(`${PAYTECH_BASE_URL}/payment/request-payment`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      API_KEY: process.env.PAYTECH_API_KEY,
      API_SECRET: process.env.PAYTECH_API_SECRET,
    },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    throw new Error('Failed to create Paytech payment request')
  }

  const data = (await res.json()) as PaytechResponse

  return data
}
