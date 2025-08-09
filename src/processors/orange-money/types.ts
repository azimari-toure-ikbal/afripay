export type OMMetadata = Record<string, string>

export type OMRequest = {
  amount: {
    unit: string
    value: number
  }
  callbackCancelUrl: string
  callbackSuccessUrl: string
  code: number
  metadata?: OMMetadata
  name: string
  validity: number
}

export type OMResponse = {
  deepLink: string
  deepLinks: {
    MAXIT: string
    OM: string
  }
  qrCode: string
  validity: number
  metadata?: OMMetadata
  shortLink: string
  qrId: string
  validFor: {
    startDateTime: string
    endDateTime: string
  }
}

export type OMWebhookResponse = {
  amount: {
    unit: 'XOF'
    value: string
  }
  partner: {
    id: string
    idType: string
  }
  customer: {
    id: string
    idType: string
  }
  reference: string
  type: string
  channel: string
  transactionId: string
  paymentMethod: string
  detail: string | null
  createdAt: string
  metadata?: OMMetadata
  status: 'SUCCESS' | 'FAILED'
}
