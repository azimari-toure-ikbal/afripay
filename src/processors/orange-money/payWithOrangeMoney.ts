import { AfriError } from '../../utils/error'
import type { OMRequest, OMResponse } from './types'

export const OM_PROD_BASE_URL = 'https://api.orange-sonatel.com'
export const OM_SANDBOX_BASE_URL = 'https://api.sandbox.orange-sonatel.com'

export const VALIDITY_LIMIT = 86_400

/**
 * Creates an Orange Money checkout (QR or deeplink).
 *
 * @remarks
 * Sends a request to Orange Money (Sonatel) to generate a payment intent that
 * returns either:
 *
 * - a **MAXIT / Orange Money deeplink** (string), or
 * - a **QR code** as a Base64 string (`qrCode`) that you need to manually parse
 *   to display to the user (e.g., `data:image/png;base64,${qrCode}`).
 *
 * This function chooses the base URL depending on `mode`:
 * - `"test"` → {@link OM_SANDBOX_BASE_URL}
 * - `"prod"` → {@link OM_PROD_BASE_URL}
 *
 * It requires the following environment variables:
 * - `OM_CLIENT_ID`
 * - `OM_CLIENT_SECRET`
 *
 * If `request.validity` exceeds {@link VALIDITY_LIMIT}, it is clamped to the
 * maximum allowed.
 *
 * @param request - The Orange Money request payload. See {@link OMRequest}.
 * @param mode - `"test"` for sandbox, `"prod"` for production. Defaults to `"test"`.
 *
 * @returns The Orange Money API response. See {@link OMResponse}.
 *
 * @throws AfriError
 * - `missing_api_key` if required environment variables are not set
 * - `request_failed` if the Orange Money API responds with a non-2xx status
 *
 * @example
 * ```ts
 * const res = await payWithOrangeMoney(
 *   {
 *     amount: { unit: 'XOF', value: 5000 },
 *     callbackCancelUrl: 'https://your.app/pay/cancel',
 *     callbackSuccessUrl: 'https://your.app/pay/success',
 *     code: 221, // country code
 *     name: 'Order #1234',
 *     validity: 600, // seconds
 *     metadata: { orderId: '1234' },
 *   },
 *   'prod',
 * )
 *
 * // If the response contains a deeplink (MAXIT / OM link), open it
 * if (res.deeplink) {
 *   window.location.href = res.deeplink
 * }
 *
 * // If the response contains a Base64 QR code, render it
 * if (res.qrCode) {
 *   const src = `data:image/png;base64,${res.qrCode}`
 *   // <img src={src} alt="Pay with Orange Money" />
 * }
 * ```
 */

export const payWithOrangeMoney = async (
  request: OMRequest,
  mode: 'test' | 'prod' = 'test',
): Promise<OMResponse> => {
  if (!process.env.OM_CLIENT_ID) {
    throw new AfriError('missing_api_key', 'OM_CLIENT_ID is not set')
  }

  if (!process.env.OM_CLIENT_SECRET) {
    throw new AfriError('missing_api_key', 'OM_CLIENT_SECRET is not set')
  }

  if (request.metadata && Object.keys(request.metadata).length > 10) {
    throw new AfriError(
      'request_failed',
      "Metadata can't be more than 10 items",
    )
  }

  if (request.validity > VALIDITY_LIMIT) {
    throw new AfriError(
      'request_failed',
      `Validity can't be more than ${VALIDITY_LIMIT} seconds`,
    )
  }

  // First we need to get an access token
  const tokenRes = await fetch(
    `${mode === 'test' ? OM_SANDBOX_BASE_URL : OM_PROD_BASE_URL}/oauth/v1/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.OM_CLIENT_ID,
        client_secret: process.env.OM_CLIENT_SECRET,
      }),
    },
  )

  if (!tokenRes.ok) {
    throw new AfriError(
      'request_failed',
      'Failed to get access token from Orange Money',
    )
  }

  const { access_token } = (await tokenRes.json()) as unknown as {
    access_token: string
  }

  const payload = {
    amount: {
      unit: 'XOF',
      value: mode === 'test' ? 10 : request.amount.value,
    },
    callbackCancelUrl: request.callbackCancelUrl,
    callbackSuccessUrl: request.callbackSuccessUrl,
    code: request.code,
    metadata: request.metadata,
    name: request.name,
    validity: request.validity,
  }

  const res = await fetch(
    `${mode === 'test' ? OM_SANDBOX_BASE_URL : OM_PROD_BASE_URL}/api/eWallet/v4/qrcode`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'X-Callback-Url': 'https://deco.minebar-sn.com/api/webhooks/om',
      },
      body: JSON.stringify(payload),
    },
  )

  if (!res.ok) {
    throw new AfriError(
      'request_failed',
      'Failed to create Orange Money QR code',
    )
  }

  const data = (await res.json()) as OMResponse

  return data
}
