import { AfriError } from '../../utils/error'
import type { PaydunyaRequest, PaydunyaResponse } from './types'

export const PAYDUNYA_TEST_URL =
  'https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create'

export const PAYDUNYA_PROD_URL =
  'https://app.paydunya.com/api/v1/checkout-invoice/create'

/**
 * Create a PayDunya payment session (checkout / invoice).
 *
 * @remarks
 * Sends a request to PayDunya to generate a hosted payment session. The API
 * returns a short payload containing:
 * - `response_code` — Gateway status code.
 * - `response_text` — The redirect URL to the hosted checkout page.
 * - `description` — Human-readable description of the transaction.
 * - `token` — Unique token identifying the transaction (used for later verification).
 *
 * The runtime environment is selected via the `mode` parameter:
 * - `"test"` → sandbox behavior
 * - `"prod"` → live/production behavior
 *
 * Required environment variables:
 * - `PAYDUNYA_PUBLIC_KEY`
 * - `PAYDUNYA_PRIVATE_KEY`
 * - `PAYDUNYA_TOKEN`
 *
 * @param request - The PayDunya request payload. See {@link PaydunyaRequest}.
 *                  Typical fields include: amount, currency, label/description,
 *                  success/cancel callbacks, IPN URL, and an optional
 *                  idempotent `client_reference`.
 * @param mode - `"test"` for sandbox or `"prod"` for production.
 *
 * @returns The PayDunya API response. See {@link PaydunyaResponse}:
 * ```ts
 * type PaydunyaResponse = {
 *   response_code: string        // Status code from PayDunya
 *   response_text: string        // Redirect URL to hosted checkout
 *   description: string          // Description of the transaction
 *   token: string                // Unique transaction token
 * }
 * ```
 *
 * @throws AfriError
 * The function throws the following `AfriError` codes:
 * - **`missing_api_key`**
 *   - Thrown when one of `PAYDUNYA_PUBLIC_KEY`, `PAYDUNYA_PRIVATE_KEY`, or
 *     `PAYDUNYA_TOKEN` is not set in the environment.
 * - **`request_failed`**
 *   - Thrown when the PayDunya API responds with a non-2xx HTTP status.
 *   - The `details` (if available) contain the gateway’s error payload.
 *
 * @example
 * ```ts
 * const res = await payWithPaydunya(
 *   {
 *     amount: 5000,
 *     currency: 'XOF',
 *     description: 'Order #1234',
 *     success_url: 'https://app.example.com/pay/success',
 *     cancel_url: 'https://app.example.com/pay/cancel',
 *     ipn_url: 'https://app.example.com/api/ipn/paydunya',
 *     client_reference: 'ORDER_1234_2025-08-13',
 *   },
 *   'prod',
 * )
 *
 * // Redirect user to the hosted PayDunya checkout
 * window.location.href = res.response_text
 *
 * // Optionally store the token for later verification
 * saveTransactionToken(res.token)
 * ```
 */

export const payWithPaydunya = async (
  request: PaydunyaRequest,
  mode: 'test' | 'prod' = 'test',
): Promise<PaydunyaResponse> => {
  if (!process.env.PAYDUNYA_MASTER_KEY) {
    throw new AfriError('missing_api_key', 'PAYDUNYA_MASTER_KEY is not set')
  }

  if (!process.env.PAYDUNYA_PRIVATE_KEY) {
    throw new AfriError('missing_api_key', 'PAYDUNYA_PRIVATE_KEY is not set')
  }

  if (!process.env.PAYDUNYA_TOKEN) {
    throw new AfriError('missing_api_key', 'PAYDUNYA_TOKEN is not set')
  }

  const url = mode === 'test' ? PAYDUNYA_TEST_URL : PAYDUNYA_PROD_URL

  const payload = { ...request, mode: mode === 'test' ? 'test' : 'live' }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY,
      'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY,
      'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new AfriError(
      'request_failed',
      `Failed to create Paydunya payment request: ${res.statusText}`,
    )
  }

  const data = (await res.json()) as PaydunyaResponse

  return data
}
