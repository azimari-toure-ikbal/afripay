import { AfriError } from '../../utils/error'
import type { WaveRequest, WaveResponse } from './types'

export const WAVE_BASE_URL = 'https://api.wave.com'

/**
 * Initiates a Wave checkout session to process a payment.
 *
 * @remarks
 * This function sends a POST request to Wave's `/v1/checkout/sessions` endpoint.
 * If `mode` is `'test'`, it will always charge 1 unit of the currency (for test purposes).
 * In `'prod'` mode, it uses the actual `amount` provided in the `request` object.
 *
 * The `client_reference` optional field in the request is an arbitrary string that your application
 * can use to tie this payment back to some entity on your side (for example, a user ID,
 * an order ID, or any other reference you need). Wave will return this same value in the response,
 * so you can match incoming webhooks or redirect callbacks to your internal records.
 *
 * When the checkout session is successfully created, Wave returns a `wave_launch_url` in the response.
 * You should redirect the user’s browser to that URL so they can complete the payment flow.
 *
 * @param {WaveRequest} request
 *   - `amount`: The payment amount (in smallest currency unit) to process. Ignored if `mode` is `'test'`.
 *   - `currency`: The three-letter currency code (only XOF is supported at the moment).
 *   - `error_url`: The URL to which Wave will redirect the user if the payment fails.
 *   - `success_url`: The URL to which Wave will redirect the user if the payment succeeds.
 *   - `client_reference`: An arbitrary identifier (e.g., userId or orderId) that Wave will return
 *       in the response. This allows you to correlate Wave’s response with your own records.
 * @param {'test' | 'prod'} [mode='test']
 *   - `'test'`: Creates a checkout session with a nominal amount (1 unit) for testing.
 *   - `'prod'`: Uses the actual `request.amount` when creating the checkout session.
 *
 * @returns {Promise<WaveResponse>}
 *   A promise that resolves to the `WaveResponse` object returned by Wave. Key fields include:
 *   - `wave_launch_url`: The URL where you must redirect the user to complete payment.
 *   - `client_reference`: Echoes back the same reference you sent, so you can match it on your end.
 *
 * @throws {AfriError}
 *   - If `process.env.WAVE_API_KEY` is not set, an error is thrown with the reason `'missing_api_key'`.
 *   - If the HTTP response from Wave is not OK (status code not in the 2xx range),
 *     an error with message with the reason `'request_failed'` is thrown.
 *
 * @example
 * ```ts
 * import { payWithWave } from './payments'
 *
 * // Somewhere in your server-side code (e.g., an Express handler):
 * app.post('/create-payment', async (req, res) => {
 *   const waveRequest: WaveRequest = {
 *     amount: 5000,                // e.g., $50.00 in cents
 *     currency: 'XOF',
 *     error_url: 'https://example.com/payment-error',
 *     success_url: 'https://example.com/payment-success',
 *     client_reference: 'user_1234'
 *   }
 *
 *   try {
 *     const waveResponse = await payWithWave(waveRequest, 'prod')
 *     // Redirect user to Wave’s payment page:
 *     res.redirect(waveResponse.wave_launch_url)
 *   } catch (err) {
 *     console.error('Payment failed to initialize:', err)
 *     res.status(500).send('Unable to start payment.')
 *   }
 * })
 * ```
 */
export const payWithWave = async (
  request: WaveRequest,
  mode: 'test' | 'prod' = 'test',
): Promise<WaveResponse> => {
  if (!process.env.WAVE_API_KEY) {
    throw new AfriError('missing_api_key', 'WAVE_API_KEY is not set')
  }

  const res = await fetch(`${WAVE_BASE_URL}/v1/checkout/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WAVE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: mode === 'test' ? 1 : request.amount,
      currency: request.currency,
      error_url: request.error_url,
      success_url: request.success_url,
      client_reference: request.client_reference,
    }),
  })

  if (!res.ok) {
    console.log('request failed', res.statusText)
    throw new AfriError(
      'request_failed',
      'Failed to create Wave checkout session',
    )
  }

  const data = (await res.json()) as WaveResponse

  return data
}
