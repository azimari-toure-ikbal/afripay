import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  PAYDUNYA_PROD_URL,
  PAYDUNYA_TEST_URL,
  PaydunyaRequest,
  PaydunyaResponse,
  payWithPaydunya,
} from '../src/processors/paydunya'

describe('payWithPaydunya', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    vi.resetAllMocks()
    // @ts-ignore
    delete global.fetch
  })

  it('throws if PAYDUNYA_MASTER_KEY is not set', async () => {
    delete process.env.PAYDUNYA_MASTER_KEY
    process.env.PAYDUNYA_PRIVATE_KEY = 'priv_key'
    process.env.PAYDUNYA_TOKEN = 'token_value'

    const request: PaydunyaRequest = {
      invoice: { total_amount: 3000, description: 'Test payment' },
      store: { name: 'StoreName' },
      mode: 'test',
      actions: {
        cancel_url: 'https://example.com/cancel',
        return_url: 'https://example.com/success',
        callback_url: 'https://example.com/callback',
      },
      custom_data: { userId: 'user_10' },
    }

    await expect(payWithPaydunya(request)).rejects.toThrow(
      'PAYDUNYA_MASTER_KEY is not set',
    )
  })

  it('throws if PAYDUNYA_PRIVATE_KEY is not set', async () => {
    process.env.PAYDUNYA_MASTER_KEY = 'master_key'
    delete process.env.PAYDUNYA_PRIVATE_KEY
    process.env.PAYDUNYA_TOKEN = 'token_value'

    const request: PaydunyaRequest = {
      invoice: { total_amount: 3000, description: 'Test payment' },
      store: { name: 'StoreName' },
      mode: 'test',
      actions: {
        cancel_url: 'https://example.com/cancel',
        return_url: 'https://example.com/success',
        callback_url: 'https://example.com/callback',
      },
      custom_data: { userId: 'user_10' },
    }

    await expect(payWithPaydunya(request)).rejects.toThrow(
      'PAYDUNYA_PRIVATE_KEY is not set',
    )
  })

  it('throws if PAYDUNYA_TOKEN is not set', async () => {
    process.env.PAYDUNYA_MASTER_KEY = 'master_key'
    process.env.PAYDUNYA_PRIVATE_KEY = 'priv_key'
    delete process.env.PAYDUNYA_TOKEN

    const request: PaydunyaRequest = {
      invoice: { total_amount: 3000, description: 'Test payment' },
      store: { name: 'StoreName' },
      mode: 'test',
      actions: {
        cancel_url: 'https://example.com/cancel',
        return_url: 'https://example.com/success',
        callback_url: 'https://example.com/callback',
      },
      custom_data: { userId: 'user_10' },
    }

    await expect(payWithPaydunya(request)).rejects.toThrow(
      'PAYDUNYA_TOKEN is not set',
    )
  })

  it('throws if fetch response is not ok', async () => {
    process.env.PAYDUNYA_MASTER_KEY = 'master_key'
    process.env.PAYDUNYA_PRIVATE_KEY = 'priv_key'
    process.env.PAYDUNYA_TOKEN = 'token_value'

    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ error: 'Invalid data' }),
    })

    const request: PaydunyaRequest = {
      invoice: { total_amount: 4500, description: 'Order #789' },
      store: { name: 'TestStore' },
      mode: 'test',
      actions: {
        cancel_url: 'https://example.com/cancel',
        return_url: 'https://example.com/success',
        callback_url: 'https://example.com/callback',
      },
      custom_data: { orderId: '789' },
    }

    await expect(payWithPaydunya(request, 'prod')).rejects.toThrow(
      'Failed to create Paydunya payment request',
    )

    expect(global.fetch).toHaveBeenCalledOnce()
    expect(global.fetch).toHaveBeenCalledWith(PAYDUNYA_PROD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYDUNYA-MASTER-KEY': 'master_key',
        'PAYDUNYA-PRIVATE-KEY': 'priv_key',
        'PAYDUNYA-TOKEN': 'token_value',
      },
      body: JSON.stringify(request),
    })
  })

  it('sends request to test URL when mode is test', async () => {
    process.env.PAYDUNYA_MASTER_KEY = 'master_key'
    process.env.PAYDUNYA_PRIVATE_KEY = 'priv_key'
    process.env.PAYDUNYA_TOKEN = 'token_value'

    const mockResponse: PaydunyaResponse = {
      response_code: '00',
      response_text: 'Success',
      description: 'Order #100',
      token: 'paydunya_token_100',
    }

    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })

    const request: PaydunyaRequest = {
      invoice: { total_amount: 10000, description: 'Order #100' },
      store: { name: 'MyStore' },
      mode: 'test',
      actions: {
        cancel_url: 'https://example.com/cancel',
        return_url: 'https://example.com/success',
        callback_url: 'https://example.com/callback',
      },
      custom_data: { orderId: '100' },
    }

    const result = await payWithPaydunya(request, 'test')

    expect(global.fetch).toHaveBeenCalledOnce()
    expect(global.fetch).toHaveBeenCalledWith(PAYDUNYA_TEST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYDUNYA-MASTER-KEY': 'master_key',
        'PAYDUNYA-PRIVATE-KEY': 'priv_key',
        'PAYDUNYA-TOKEN': 'token_value',
      },
      body: JSON.stringify(request),
    })

    expect(result).toEqual(mockResponse)
  })

  it('sends request to prod URL when mode is prod', async () => {
    process.env.PAYDUNYA_MASTER_KEY = 'master_key'
    process.env.PAYDUNYA_PRIVATE_KEY = 'priv_key'
    process.env.PAYDUNYA_TOKEN = 'token_value'

    const mockResponse: PaydunyaResponse = {
      response_code: '00',
      response_text: 'Live Success',
      description: 'Live Order #200',
      token: 'live_token_200',
    }

    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })

    const request: PaydunyaRequest = {
      invoice: { total_amount: 20000, description: 'Live Order #200' },
      store: { name: 'LiveStore' },
      mode: 'live',
      actions: {
        cancel_url: 'https://example.com/cancel',
        return_url: 'https://example.com/success',
        callback_url: 'https://example.com/callback',
      },
      custom_data: { orderId: '200' },
    }

    const result = await payWithPaydunya(request, 'prod')

    expect(global.fetch).toHaveBeenCalledOnce()
    expect(global.fetch).toHaveBeenCalledWith(PAYDUNYA_PROD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYDUNYA-MASTER-KEY': 'master_key',
        'PAYDUNYA-PRIVATE-KEY': 'priv_key',
        'PAYDUNYA-TOKEN': 'token_value',
      },
      body: JSON.stringify(request),
    })

    expect(result).toEqual(mockResponse)
  })
})
