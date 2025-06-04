import type { PaydunyaRequest, PaydunyaResponse } from './types'

export const PAYDUNYA_TEST_URL =
  'https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create'

export const PAYDUNYA_PROD_URL =
  'https://app.paydunya.com/api/v1/checkout-invoice/create'

/**
 * Initiates a Paydunya payment request by sending a POST to Paydunya's API.
 *
 * @remarks
 * This function requires the following environment variables to be set:
 * - `PAYDUNYA_MASTER_KEY`
 * - `PAYDUNYA_PRIVATE_KEY`
 * - `PAYDUNYA_TOKEN`
 *
 * Depending on the `mode` (
 *   - `'test'`: uses the sandbox/test endpoint (`PAYDUNYA_TEST_URL`).
 *   - `'prod'`: uses the live endpoint (`PAYDUNYA_PROD_URL`).
 * ), it selects the proper URL for creating a payment request.
 *
 * @param {PaydunyaRequest} request
 *   - `invoice.total_amount`: The total amount to charge (in the smallest currency unit, e.g., cents).
 *   - `invoice.description`: A short description of this payment (e.g., `"Order #1234"`).
 *   - `store.name`: Your store’s name as registered with Paydunya.
 *   - `mode`: Must match one of the Paydunya modes (`'test'` or `'live'`); note this differs from our argument `mode`;
 *       here it instructs Paydunya how to process the invoice.
 *   - `actions.cancel_url`: URL to redirect the user if they cancel.
 *   - `actions.return_url`: URL to redirect the user after successful payment.
 *   - `actions.callback_url`: Your webhook endpoint, where Paydunya will POST payment updates.
 *   - `custom_data`: An optional arbitrary object (e.g., `{ userId: 42, orderId: 'xyz' }`) that Paydunya will include
 *       in its callbacks so you can match state.
 *
 * @param {'test' | 'prod'} [mode='test']
 *   - If `'test'`, uses the sandbox/test URL (`PAYDUNYA_TEST_URL`) for development.
 *   - If `'prod'`, uses the live endpoint (`PAYDUNYA_PROD_URL`) for real payments.
 *
 * @returns {Promise<PaydunyaResponse>}
 *   A promise that resolves to the JSON response from Paydunya, which includes:
 *   - `response_code`: A short code indicating success or failure (e.g., `"00"` for success).
 *   - `response_text`: A human-readable message describing the result.
 *   - `description`: Echoes back the invoice description.
 *   - `token`: A unique token string; you must redirect the user to `https://paydunya.com/invoice/:token`
 *       (or similar) so they can complete the payment flow on Paydunya’s page.
 *
 * @throws {Error}
 *   - If `process.env.PAYDUNYA_MASTER_KEY` is not set.
 *   - If `process.env.PAYDUNYA_PRIVATE_KEY` is not set.
 *   - If `process.env.PAYDUNYA_TOKEN` is not set.
 *   - If the HTTP response from Paydunya is not OK (non-2xx), throws `'Failed to create Paydunya payment request'`.
 *
 * @example
 * ```ts
 * import { payWithPaydunya } from './payWithPaydunya'
 *
 * // In your server route handler:
 * app.post('/create-paydunya-invoice', async (req, res) => {
 *   const payload: PaydunyaRequest = {
 *     invoice: {
 *       total_amount: 7500, // e.g., FCFA or CFA francs
 *       description: 'Order #A123',
 *     },
 *     store: {
 *       name: 'Mon E-Shop',
 *     },
 *     mode: 'test', // paydunya’s own mode flag inside the payload
 *     actions: {
 *       cancel_url: 'https://example.com/checkout/cancel',
 *       return_url: 'https://example.com/checkout/success',
 *       callback_url: 'https://api.example.com/paydunya/webhook',
 *     },
 *     custom_data: {
 *       userId: 'user_42',
 *       orderId: 'A123',
 *     },
 *   }
 *
 *   try {
 *     const response = await payWithPaydunya(payload, 'prod')
 *     // Redirect user to Paydunya’s hosted invoice page:
 *     // e.g., https://app.paydunya.com/invoice/{response.token}
 *     res.redirect(`https://app.paydunya.com/invoice/${response.token}`)
 *   } catch (err) {
 *     console.error('Paydunya error:', err)
 *     res.status(500).send('Unable to create Paydunya invoice.')
 *   }
 * })
 * ```
 */
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
