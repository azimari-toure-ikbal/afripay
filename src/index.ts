import { payWithWave } from './processors/wave'

export * from './processors/wave'

const res = await payWithWave({
  amount: 1,
  currency: 'USD',
  error_url: 'https://example.com/error',
  success_url: 'https://example.com/success',
  client_reference: 'my-reference',
})

console.log('res', res)
