import type { FastifyInstance } from 'fastify'
import { listPaymentMethods } from '../mollie.js'
import { toLocale } from '../i18n.js'

export async function paymentMethodRoutes(app: FastifyInstance) {
  app.get('/api/payment-methods', async (request, reply) => {
    const { locale } = request.query as { locale?: string }
    const methods = await listPaymentMethods(toLocale(locale))
    return reply.send({ methods })
  })
}