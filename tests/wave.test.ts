// payWithWave.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  payWithWave,
  WAVE_BASE_URL,
  WaveRequest,
  WaveResponse,
} from '../src/processors/wave'

describe('payWithWave', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset environment and mocks before each test
    process.env = { ...originalEnv }
    vi.resetAllMocks()
    // @ts-ignore
    delete global.fetch
  })

  it('throws if WAVE_API_KEY is not set', async () => {
    delete process.env.WAVE_API_KEY

    const request: WaveRequest = {
      amount: 500,
      currency: 'XOF',
      error_url: 'https://example.com/error',
      success_url: 'https://example.com/success',
      client_reference: 'user_1',
    }

    await expect(payWithWave(request)).rejects.toThrow(
      'WAVE_API_KEY is not set',
    )
  })

  it('throws if fetch response is not ok', async () => {
    process.env.WAVE_API_KEY = 'test_key'

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Bad Request' }),
    })

    const request: WaveRequest = {
      amount: 1000,
      currency: 'XOF',
      error_url: 'https://example.com/err',
      success_url: 'https://example.com/succ',
      client_reference: 'order_42',
    }

    await expect(payWithWave(request, 'prod')).rejects.toThrow(
      'Failed to create Wave checkout session',
    )

    expect(global.fetch).toHaveBeenCalledOnce()
    expect(global.fetch).toHaveBeenCalledWith(
      `${WAVE_BASE_URL}/v1/checkout/sessions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer test_key`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency,
          error_url: request.error_url,
          success_url: request.success_url,
          client_reference: request.client_reference,
        }),
      },
    )
  })

  it('sends amount = 1 in test mode, ignores request.amount', async () => {
    process.env.WAVE_API_KEY = 'test_key'
    const mockResponse: WaveResponse = {
      id: 'session_test_1',
      amount: '1',
      checkout_status: 'open',
      client_reference: 'test_ref',
      currency: 'XOF',
      error_url: 'https://example.com/error',
      last_payment_error: null,
      business_name: 'TestBiz',
      payment_status: 'pending',
      transaction_id: 'txn_001',
      aggregated_merchant_id: 'agg_001',
      success_url: 'https://example.com/success',
      wave_launch_url: 'https://wave.com/launch/123',
      when_completed: '',
      when_created: '2025-06-03T00:00:00Z',
      when_expires: '2025-06-04T00:00:00Z',
    }

    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })

    const request: WaveRequest = {
      amount: 9999, // this should be ignored in test mode
      currency: 'XOF',
      error_url: 'https://example.com/error',
      success_url: 'https://example.com/success',
      client_reference: 'test_ref',
    }

    const result = await payWithWave(request, 'test')

    expect(global.fetch).toHaveBeenCalledOnce()
    const fetchArgs = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as RequestInit
    const body = JSON.parse(fetchArgs.body as string)

    expect(body.amount).toBe(1)
    expect(body.currency).toBe(request.currency)
    expect(body.error_url).toBe(request.error_url)
    expect(body.success_url).toBe(request.success_url)
    expect(body.client_reference).toBe(request.client_reference)

    expect(result).toEqual(mockResponse)
  })

  it('sends actual request.amount in prod mode', async () => {
    process.env.WAVE_API_KEY = 'prod_key'
    const mockResponse: WaveResponse = {
      id: 'session_prod_1',
      amount: '5000',
      checkout_status: 'open',
      client_reference: 'order_500',
      currency: 'XOF',
      error_url: 'https://example.com/err',
      last_payment_error: null,
      business_name: 'ProdBiz',
      payment_status: 'pending',
      transaction_id: 'txn_002',
      aggregated_merchant_id: 'agg_002',
      success_url: 'https://example.com/succ',
      wave_launch_url: 'https://wave.com/launch/456',
      when_completed: '',
      when_created: '2025-06-03T01:00:00Z',
      when_expires: '2025-06-04T01:00:00Z',
    }

    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })

    const request: WaveRequest = {
      amount: 5000,
      currency: 'XOF',
      error_url: 'https://example.com/err',
      success_url: 'https://example.com/succ',
      client_reference: 'order_500',
    }

    const result = await payWithWave(request, 'prod')

    expect(global.fetch).toHaveBeenCalledOnce()
    const fetchArgs = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as RequestInit
    const body = JSON.parse(fetchArgs.body as string)

    expect(body.amount).toBe(request.amount)
    expect(body.currency).toBe(request.currency)
    expect(body.error_url).toBe(request.error_url)
    expect(body.success_url).toBe(request.success_url)
    expect(body.client_reference).toBe(request.client_reference)

    expect(result).toEqual(mockResponse)
  })
})
