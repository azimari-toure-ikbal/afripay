import type { PaydunyaRequest, PaydunyaResponse } from '../types'

const PAYDUNYA_TEST_URL =
  'https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create'

const PAYDUNYA_PROD_URL =
  'https://app.paydunya.com/api/v1/checkout-invoice/create'

export const payWithPaydunya = async (
  request: PaydunyaRequest,
  mode: 'test' | 'prod' = 'test',
): Promise<PaydunyaResponse> => {
  if (!process.env.PAYDUNYA_MASTER_KEY) {
    throw new Error('PAYDUNYA_MASTER_KEY is not set')
  }

  if (!process.env.PAYDUNYA_PRIVATE_KEY) {
    throw new Error('PAYDUNYA_PRIVATE_KEY is not set')
  }

  if (!process.env.PAYDUNYA_TOKEN) {
    throw new Error('PAYDUNYA_TOKEN is not set')
  }

  const url = mode === 'test' ? PAYDUNYA_TEST_URL : PAYDUNYA_PROD_URL

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY,
      'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY,
      'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN,
    },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    throw new Error('Failed to create Paydunya payment request')
  }

  const data = (await res.json()) as PaydunyaResponse

  return data
}
