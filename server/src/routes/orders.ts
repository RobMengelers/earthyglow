import type { FastifyInstance } from 'fastify'
import { isProduction } from '../env.js'
import { mollieEnabled } from '../mollie.js'
import { prisma } from '../prisma.js'

export async function orderRoutes(app: FastifyInstance) {
  app.get('/api/orders/:orderNumber', async (request, reply) => {
    const { orderNumber } = request.params as { orderNumber: string }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        orderNumber: true,
        status: true,
        subtotalCents: true,
        shippingCents: true,
        totalCents: true,
        currency: true,
        paidAt: true,
        createdAt: true,
      },
    })

    if (!order) {
      return reply.code(404).send({ error: 'Order not found' })
    }

    return reply.send(order)
  })

  // Dev-only: settles a mock order (no Mollie key configured) so the full
  // pending -> paid flow can be exercised locally. Never enabled in production.
  app.post('/api/orders/:orderNumber/mock-pay', async (request, reply) => {
    if (isProduction || mollieEnabled) {
      return reply.code(404).send({ error: 'Not found' })
    }

    const { orderNumber } = request.params as { orderNumber: string }
    const order = await prisma.order.findUnique({ where: { orderNumber } })
    if (!order) {
      return reply.code(404).send({ error: 'Order not found' })
    }

    if (order.status !== 'paid') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'paid', paidAt: new Date() },
      })
    }

    return reply.send({ orderNumber, status: 'paid' })
  })
}
