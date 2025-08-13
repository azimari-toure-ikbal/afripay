import { AfriError } from '../../utils/error'
import type { PaytechRequest, PaytechResponse } from './types'

const PAYTECH_BASE_URL = 'https://paytech.sn/api'

/**
 * Create a PayTech payment session.
 *
 * @remarks
 * Sends a request to PayTech to generate a payment session for the user. The
 * response typically contains a **redirect URL** that you should send the user
 * to in order to complete payment.
 *
 * The **environment** is selected via {@link PaytechRequest.env}:
 * - `"test"` → sandbox behavior
 * - `"prod"` → live/production behavior
 *
 * Required environment variables:
 * - `PAYTECH_API_KEY`
 * - `PAYTECH_API_SECRET`
 *
 * Notes:
 * - `client_reference` should be **unique per attempt**. Reusing it may cause a
 *   **409 Conflict** from PayTech (duplicate reference).
 *
 * @param request - The PayTech request payload. At minimum, include:
 *   - `amount: number` — The amount to charge (in the currency’s minor unit if that’s how your integration is set up).
 *   - `currency: string` — e.g. `"XOF"`.
 *   - `success_url: string` — Where PayTech should redirect the user after a successful payment.
 *   - `error_url: string` — Where PayTech should redirect the user on failure/cancel.
 *   - `client_reference?: string` — Your internal idempotency/reference key (recommended to be unique).
 *   - `env: 'test' | 'prod'` — Selects sandbox vs production behavior.
 *   - (plus any other optional fields supported by your {@link PaytechRequest} type).
 *
 * @returns The PayTech API response with session details. See {@link PaytechResponse}.
 *          Implementations commonly expose a `redirect_url` you can send the user to.
 *
 * @throws AfriError
 * The function throws the following `AfriError` codes:
 * - **`missing_api_key`**
 *   - Thrown when `PAYTECH_API_KEY` or `PAYTECH_API_SECRET` is not set in the environment.
 * - **`request_failed`**
 *   - Thrown when the PayTech API responds with a non‑2xx HTTP status.
 *   - If the status is **409**, the error message clarifies that there was a conflict,
 *     most likely because of a duplicated `ref_command`.
 *
 * @example
 * ```ts
 * const res = await payWithPaytech({
 *   amount: 5000,
 *   currency: 'XOF',
 *   success_url: 'https://app.example.com/pay/success',
 *   error_url: 'https://app.example.com/pay/error',
 *   client_reference: 'ORDER_1234_2025-08-13',
 *   env: 'prod',
 * })
 *
 * // Typical usage: redirect the customer to PayTech’s hosted page
 * if ((res as any).redirect_url) {
 *   // e.g., in a web context:
 *   // window.location.href = (res as any).redirect_url
 * }
 * ```
 */

export const payWithPaytech = async (
  request: PaytechRequest,
): Promise<PaytechResponse> => {
  if (!process.env.PAYTECH_API_KEY) {
    throw new AfriError('missing_api_key', 'PAYTECH_API_KEY is not set')
  }

  if (!process.env.PAYTECH_API_SECRET) {
    throw new AfriError('missing_api_key', 'PAYTECH_API_SECRET is not set')
  }

  const payload = {
    ...request,
    target_payment: request.target_payment?.join(', '),
  }

  const res = await fetch(`${PAYTECH_BASE_URL}/payment/request-payment`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      API_KEY: process.env.PAYTECH_API_KEY,
      API_SECRET: process.env.PAYTECH_API_SECRET,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    if (res.statusText.includes('Conflict')) {
      throw new AfriError(
        'request_failed',
        'There was a conflict. Probably because of ref_command',
      )
    }

    throw new AfriError(
      'request_failed',
      'Failed to create Paytech payment request',
    )
  }

  const data = (await res.json()) as PaytechResponse

  return data
}
