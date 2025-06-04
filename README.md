# Afripay

Afripay is a lightweight TypeScript library designed to streamline and simplify the integration of African payment processors into your applications. With built-in methods for Orange Money, Wave, Paytech, and Paydunya, Afripay provides a unified, consistent API so you can focus on building features—rather than wrestling with multiple payment SDKs.

---

## Features

- **Unified API**  
  One consistent interface for all supported payment providers.

- **TypeScript-first**  
  Fully typed request/response models and method signatures.

- **Built-in support for major African processors**

  - Orange Money
  - Wave
  - Paytech
  - Paydunya

- **Environment-driven configuration**  
  Securely load API keys and secrets from environment variables.

- **Error handling & response validation**  
  Throws descriptive errors if required credentials are missing or if the provider returns a non-OK HTTP response.

---

## Installation

```bash
npm install afripay
# or
yarn add afripay
# or
bun add afripay
# or
pnpm add afripay
```

---

## Configuration

Create a `.env` file (or set your environment variables directly) for each payment provider you plan to use:

```dotenv
# Wave
WAVE_API_KEY=your_wave_api_key

# Paydunya
PAYDUNYA_MASTER_KEY=your_master_key
PAYDUNYA_PRIVATE_KEY=your_private_key
PAYDUNYA_TOKEN=your_token

# Paytech
PAYTECH_API_KEY=your_paytech_api_key
PAYTECH_API_SECRET=your_paytech_secret

# Orange Money
OM_CLIENT_ID=your_orangemoney_client_id
OM_CLIENT_SECRET=your_orangemoney_client_secret
```

> Make sure to replace the placeholder values with the actual credentials provided by each payment processor.

---

## Usage

Below are examples of how to call each payment method. All methods return a `Promise` resolving to a typed response object. If any required environment variable is missing or if the remote API returns a non-OK status, the method will throw an `Error`.

### 1. Wave

```ts
import { payWithWave, WaveRequest, WaveResponse } from 'afripay'

async function createWavePayment() {
  const request: WaveRequest = {
    amount: 5000, // amount in smallest currency unit (e.g., 5000 = XOF 50.00)
    currency: 'XOF',
    error_url: 'https://example.com/error',
    success_url: 'https://example.com/success',
    client_reference: 'order_12345', // any string to identify this payment in your system
  }

  try {
    // mode defaults to 'test'; use 'prod' for live payments
    const response: WaveResponse = await payWithWave(request, 'prod')

    // response.wave_launch_url is where you redirect the user to complete payment
    console.log('Redirect user to:', response.wave_launch_url)
  } catch (err: any) {
    console.error('Wave payment failed:', err.message)
  }
}
```

### 2. Paydunya

```ts
import { payWithPaydunya, PaydunyaRequest, PaydunyaResponse } from 'afripay'

async function createPaydunyaInvoice() {
  const request: PaydunyaRequest = {
    invoice: {
      total_amount: 12000, // amount in smallest currency unit (e.g., 12000 = XOF 120.00)
      description: 'Order #ABC123',
    },
    store: {
      name: 'My Afripay Store',
    },
    mode: 'test', // Paydunya’s internal mode flag (‘test’ or ‘live’)
    actions: {
      cancel_url: 'https://example.com/cancel',
      return_url: 'https://example.com/success',
      callback_url: 'https://yourapp.com/webhook',
    },
    custom_data: {
      userId: 'user_99',
      orderId: 'ABC123',
    },
  }

  try {
    // mode defaults to 'test'; use 'prod' for production calls
    const response: PaydunyaResponse = await payWithPaydunya(request, 'prod')

    // The token is used to redirect the user to Paydunya’s hosted invoice page:
    console.log(
      'Send user to:',
      `https://app.paydunya.com/invoice/${response.token}`,
    )
  } catch (err: any) {
    console.error('Paydunya request failed:', err.message)
  }
}
```

### 3. Paytech

```ts
import { payWithPaytech, PaytechRequest, PaytechResponse } from 'afripay'

async function createPaytechPayment() {
  const request: PaytechRequest = {
    amount: 8000, // amount in smallest unit (e.g., 8000 = XOF 80.00)
    currency: 'XOF',
    redirect_url: 'https://example.com/return',
    cancel_url: 'https://example.com/cancel',
    order_id: 'order_456',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+221771234567',
    },
    metadata: {
      productId: 'prod_789',
    },
  }

  try {
    // mode defaults to 'test'; use 'prod' for live
    const response: PaytechResponse = await payWithPaytech(request, 'prod')

    // response.checkout_url is where you redirect the user to complete the payment
    console.log('Redirect user to:', response.checkout_url)
  } catch (err: any) {
    console.error('Paytech payment failed:', err.message)
  }
}
```

### 4. Orange Money

```ts
import {
  payWithOrangeMoney,
  OrangeMoneyRequest,
  OrangeMoneyResponse,
} from 'afripay'

async function createOrangeMoneyPayment() {
  const request: OrangeMoneyRequest = {
    amount: 10000, // amount in smallest unit (e.g., 10000 = XOF 100.00)
    currency: 'XOF',
    externalId: 'ext_321',
    payer: {
      msisdn: '221771234567', // customer’s phone number
    },
    payerMessage: 'Payment for Order #321',
    payeeNote: 'Afripay transaction',
    callbackUrl: 'https://yourapp.com/om/callback',
  }

  try {
    // mode defaults to 'test'; use 'prod' for real collections
    const response: OrangeMoneyResponse = await payWithOrangeMoney(
      request,
      'prod',
    )

    // response.transaction_id uniquely identifies the transaction
    console.log('OM transaction ID:', response.transaction_id)
  } catch (err: any) {
    console.error('Orange Money payment failed:', err.message)
  }
}
```

---

## API Reference

> All methods return a `Promise` that resolves to a typed response object; if any required credential is missing, or if the remote API returns a non-OK status, the method will throw an `Error`.

### `payWithWave(request: WaveRequest, mode?: 'test' | 'prod'): Promise<WaveResponse>`

Processes a Wave checkout session.

- **Environment Variables**: `WAVE_API_KEY`
- **Mode**: `'test'` (default) or `'prod'`
- **Returns**:

  ```ts
  interface WaveResponse {
    id: string
    amount: string
    checkout_status: 'open' | 'complete' | 'expired'
    client_reference: string
    currency: 'XOF'
    error_url: string
    last_payment_error: string | null
    business_name: string
    payment_status: string
    transaction_id: string
    aggregated_merchant_id: string
    success_url: string
    wave_launch_url: string // redirect user here to complete payment
    when_completed: string
    when_created: string
    when_expires: string
  }
  ```

  ***

  ## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make to Afripay are greatly appreciated.

Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to report bugs, propose new features, set up a development environment, submit pull requests, and more.
