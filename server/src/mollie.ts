import { createMollieClient } from '@mollie/api-client'
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

type CreatePaymentInput = {
  orderId: string
  orderNumber: string
  totalCents: number
  description: string
}

export function buildRedirectUrl(orderNumber: string, mock: boolean): string {
  const url = `${env.FRONTEND_URL}/checkout/confirmation?order=${encodeURIComponent(orderNumber)}`
  return mock ? `${url}&mock=1` : url
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
    redirectUrl: buildRedirectUrl(input.orderNumber, false),
    webhookUrl: `${env.PUBLIC_API_URL}/api/webhooks/mollie`,
    metadata: {
      orderId: input.orderId,
      orderNumber: input.orderNumber,
    },
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
