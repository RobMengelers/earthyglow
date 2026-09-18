import type { FastifyInstance } from 'fastify'
import { listPaymentMethods } from '../mollie.js'

export async function paymentMethodRoutes(app: FastifyInstance) {
  app.get('/api/payment-methods', async (_request, reply) => {
    const methods = await listPaymentMethods()
    return reply.send({ methods })
  })
}