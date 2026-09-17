import type { OrderStatus } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import { getPaymentInfo } from '../mollie.js'
import { prisma } from '../prisma.js'

const statusMap: Record<string, OrderStatus> = {
  open: 'pending',
  pending: 'pending',
  paid: 'paid',
  failed: 'failed',
  expired: 'expired',
  canceled: 'canceled',
}

export async function webhookRoutes(app: FastifyInstance) {
  app.post('/api/webhooks/mollie', async (request, reply) => {
    // Mollie posts application/x-www-form-urlencoded with only the payment id.
    const body = request.body as { id?: string } | undefined
    const paymentId = body?.id
    if (!paymentId) {
      return reply.code(400).send({ error: 'Missing payment id' })
    }

    let order = await prisma.order.findUnique({
      where: { molliePaymentId: paymentId },
    })

    const info = await getPaymentInfo(paymentId)
    if (!info) {
      request.log.warn({ paymentId }, 'Mollie payment lookup failed')
      return reply.code(500).send({ error: 'Could not verify payment' })
    }

    // Fallback for the rare race where the webhook arrives before we stored the
    // payment id on the order: recover the order through the payment metadata.
    if (!order && info.orderId) {
      order = await prisma.order.findUnique({ where: { id: info.orderId } })
      if (order && !order.molliePaymentId) {
        order = await prisma.order.update({
          where: { id: order.id },
          data: { molliePaymentId: paymentId },
        })
      }
    }

    if (!order) {
      // Unknown payment: acknowledge so Mollie stops retrying.
      return reply.send({ ok: true })
    }

    const status = statusMap[info.status] ?? order.status

    if (status !== order.status) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status,
          ...(status === 'paid' ? { paidAt: new Date() } : {}),
        },
      })
      request.log.info(
        { orderNumber: order.orderNumber, from: order.status, to: status },
        'Order status updated from Mollie webhook',
      )
    }

    return reply.send({ ok: true })
  })
}
