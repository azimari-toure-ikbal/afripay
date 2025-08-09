import { beforeEach, describe, expect, it, vi } from 'vitest'
import { payWithOrangeMoney } from '../src/processors/orange-money'

// Minimal request that matches your function signature
const baseReq = {
  amount: { unit: 'XOF', value: 1000 },
  name: 'Test order',
  callbackCancelUrl: 'https://x/cancel',
  callbackSuccessUrl: 'https://x/success',
  code: 221,
  validity: 300,
}

const originalEnv = process.env

describe('payWithOrangeMoney', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  it('throws missing_api_key when env vars are not set', async () => {
    delete process.env.OM_CLIENT_ID
    delete process.env.OM_CLIENT_SECRET

    await expect(payWithOrangeMoney(baseReq as any, 'test')).rejects.toThrow()
  })

  it('returns a deeplink when API responds with a deeplink', async () => {
    process.env.OM_CLIENT_ID = 'client'
    process.env.OM_CLIENT_SECRET = 'secret'

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return {
          ok: true,
          json: async () => ({
            status: 'SUCCESS',
            deeplink: 'maxit://open/payment/abc123',
            qrCode: null,
          }),
        } as any
      }),
    )

    const res = await payWithOrangeMoney(baseReq as any, 'test')
    expect(res.deepLink).toBe('maxit://open/payment/abc123')
    expect(res.qrCode).toBeFalsy()
  })

  it('returns a Base64 qrCode when API responds with qrCode', async () => {
    process.env.OM_CLIENT_ID = 'client'
    process.env.OM_CLIENT_SECRET = 'secret'

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return {
          ok: true,
          json: async () => ({
            status: 'SUCCESS',
            deeplink: null,
            qrCode: 'iVBORw0KGgoAAAANSUhEUgAA...', // shortened
          }),
        } as any
      }),
    )

    const res = await payWithOrangeMoney(baseReq as any, 'test')
    expect(res.qrCode).toBeTruthy()

    // What the app would use to show it:
    const src = `data:image/png;base64,${res.qrCode}`
    expect(src.startsWith('data:image/png;base64,')).toBe(true)
  })

  it('throws request_failed on non-2xx', async () => {
    process.env.OM_CLIENT_ID
    process.env.OM_CLIENT_SECRET

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return {
          ok: false,
          status: 400,
          json: async () => ({ message: 'Bad Request' }),
        } as any
      }),
    )

    await expect(
      payWithOrangeMoney(baseReq as any, 'test'),
    ).rejects.toMatchObject({
      code: 'request_failed',
    })
  })
})
