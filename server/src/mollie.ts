import { createMollieClient, PaymentLineType, PaymentMethod } from '@mollie/api-client'
import { env } from './env.js'

const client = env.MOLLIE_API_KEY
  ? createMollieClient({ apiKey: env.MOLLIE_API_KEY })
  : null

export const mollieEnabled = Boolean(client)

export type PaymentRef = {
  id: string
  checkoutUrl: string | null
}

export type PaymentInfo = {
  status: string
  orderId?: string
}

export type PaymentMethodOption = {
  id: string
  name: string
  icon: string | null
}

const PREFERRED_METHODS = ['ideal', 'creditcard', 'klarna'] as const

const MOCK_METHODS: PaymentMethodOption[] = [
  {
    id: 'ideal',
    name: 'iDEAL',
    icon: 'https://www.mollie.com/external/icons/payment-methods/ideal.svg',
  },
  {
    id: 'creditcard',
    name: 'Credit card',
    icon: 'https://www.mollie.com/external/icons/payment-methods/creditcard.svg',
  },
  {
    id: 'klarna',
    name: 'Klarna',
    icon: 'https://www.mollie.com/external/icons/payment-methods/klarna.svg',
  },
]

export type PaymentLineInput = {
  type?: PaymentLineType
  description: string
  quantity: number
  unitPrice: { currency: string; value: string }
  totalAmount: { currency: string; value: string }
  vatRate?: string
  vatAmount?: { currency: string; value: string }
}

export type PaymentAddressInput = {
  givenName?: string
  familyName?: string
  streetAndNumber: string
  postalCode?: string
  city: string
  country: string
  email?: string
}

type CreatePaymentInput = {
  orderId: string
  orderNumber: string
  totalCents: number
  description: string
  method?: string
  lines?: PaymentLineInput[]
  billingAddress?: PaymentAddressInput
  shippingAddress?: PaymentAddressInput
}

function buildRedirectUrl(orderNumber: string, mock: boolean): string {
  const url = `${env.FRONTEND_URL}/checkout/confirmation?order=${encodeURIComponent(orderNumber)}`
  return mock ? `${url}&mock=1` : url
}

export async function listPaymentMethods(): Promise<PaymentMethodOption[]> {
  if (!client) return MOCK_METHODS

  try {
    const methods = await client.methods.list()
    const supported = new Map<string, (typeof methods)[number]>(
      methods.map((method) => [method.id, method]),
    )
    return PREFERRED_METHODS.filter((id) => supported.has(id)).map((id) => {
      const method = supported.get(id)!
      return {
        id,
        name: method.description,
        icon: method.image?.svg ?? null,
      }
    })
  } catch {
    return MOCK_METHODS
  }
}

export async function createPayment(
  input: CreatePaymentInput,
): Promise<PaymentRef> {
  if (!client) {
    // Mock mode: no Mollie key configured. Send the customer straight to the
    // confirmation page, where the dev-only mock-pay endpoint settles the order.
    return {
      id: `tr_mock_${input.orderId}`,
      checkoutUrl: buildRedirectUrl(input.orderNumber, true),
    }
  }

  const payment = await client.payments.create({
    amount: {
      currency: 'EUR',
      value: (input.totalCents / 100).toFixed(2),
    },
    description: input.description,
    method: input.method as PaymentMethod | undefined,
    redirectUrl: buildRedirectUrl(input.orderNumber, false),
    webhookUrl: `${env.PUBLIC_API_URL}/api/webhooks/mollie`,
    metadata: {
      orderId: input.orderId,
      orderNumber: input.orderNumber,
    },
    ...(input.lines ? { lines: input.lines } : {}),
    ...(input.billingAddress ? { billingAddress: input.billingAddress } : {}),
    ...(input.shippingAddress ? { shippingAddress: input.shippingAddress } : {}),
  })

  return {
    id: payment.id,
    checkoutUrl: payment.getCheckoutUrl() ?? null,
  }
}

export async function getPaymentInfo(
  paymentId: string,
): Promise<PaymentInfo | null> {
  if (!client) {
    return { status: 'paid' }
  }

  try {
    const payment = await client.payments.get(paymentId)
    const metadata = payment.metadata as { orderId?: string } | null
    return {
      status: payment.status,
      orderId: metadata?.orderId,
    }
  } catch {
    return null
  }
}

export async function refundPayment(paymentId: string, totalCents: number): Promise<void> {
  if (!client) return
  await client.paymentRefunds.create({
    paymentId,
    amount: { currency: 'EUR', value: (totalCents / 100).toFixed(2) },
    description: 'EarthyGlow order refund',
  })
}
