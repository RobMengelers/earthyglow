import type { OrderStatus } from '@prisma/client'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import {
  adminJwtSecret,
  secureEqual,
  signAdminToken,
  verifyAdminToken,
} from '../admin-auth.js'
import { env } from '../env.js'
import { prisma } from '../prisma.js'
import { sendFulfillmentEmail, sendRefundEmail } from '../email.js'
import { refundPayment } from '../mollie.js'

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'failed',
  'expired',
  'canceled',
  'refunded',
]

export async function adminRoutes(app: FastifyInstance) {
  // Admin auth is only available when an ADMIN_PASSWORD is configured.
  const enabled = env.ADMIN_PASSWORD.length > 0

  app.post(
    '/api/admin/login',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (request, reply) => {
      if (!enabled) {
        return reply.code(404).send({ error: 'Not found' })
      }

      const body = request.body as { username?: unknown; password?: unknown }
      const username = typeof body?.username === 'string' ? body.username : ''
      const password = typeof body?.password === 'string' ? body.password : ''

      if (
        !secureEqual(username, env.ADMIN_USERNAME) ||
        !secureEqual(password, env.ADMIN_PASSWORD)
      ) {
        return reply.code(401).send({ error: 'Invalid credentials' })
      }

      const secret = adminJwtSecret(env.ADMIN_USERNAME, env.ADMIN_PASSWORD)
      return reply.send({
        token: signAdminToken(secret),
        expiresIn: 12 * 60 * 60,
      })
    },
  )

  async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
    const header = request.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice(7) : ''
    if (
      !enabled ||
      !token ||
      !verifyAdminToken(
        token,
        adminJwtSecret(env.ADMIN_USERNAME, env.ADMIN_PASSWORD),
      )
    ) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }
    return undefined
  }

  app.get(
    '/api/admin/session',
    { preHandler: requireAdmin },
    async () => ({ ok: true }),
  )

  app.get(
    '/api/admin/orders',
    { preHandler: requireAdmin },
    async (request) => {
      const query = request.query as { status?: string }
      const where =
        query.status && (ORDER_STATUSES as string[]).includes(query.status)
          ? { status: query.status as OrderStatus }
          : {}

      const [counts, orders] = await Promise.all([
        prisma.order.groupBy({ by: ['status'], _count: true }),
        prisma.order.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: 300,
          include: {
            customer: true,
            items: { orderBy: { id: 'asc' } },
          },
        }),
      ])

      const stats: Record<string, number> = {
        pending: 0,
        paid: 0,
        failed: 0,
        expired: 0,
        canceled: 0,
        refunded: 0,
      }
      for (const row of counts) stats[row.status] = row._count

      return { stats, orders }
    },
  )

  app.patch('/api/admin/orders/:id/fulfillment', { preHandler: requireAdmin }, async (request, reply) => {
    const body = request.body as { status?: unknown; carrier?: unknown; trackingCode?: unknown }
    const status = body.status === 'processed' ? 'processed' : body.status === 'open' ? 'open' : null
    if (!status) return reply.code(400).send({ error: 'Invalid fulfillment status' })
    if (status === 'processed' && (typeof body.carrier !== 'string' || !body.carrier.trim() || typeof body.trackingCode !== 'string' || !body.trackingCode.trim())) {
      return reply.code(400).send({ error: 'Carrier and tracking code are required' })
    }
    const params = request.params as { id: string }
    const order = await prisma.order.findUnique({ where: { id: params.id }, include: { customer: true } })
    if (!order) return reply.code(404).send({ error: 'Order not found' })
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { fulfillmentStatus: status, carrier: typeof body.carrier === 'string' && body.carrier.trim() ? body.carrier.trim() : order.carrier, trackingCode: typeof body.trackingCode === 'string' && body.trackingCode.trim() ? body.trackingCode.trim() : order.trackingCode, fulfilledAt: status === 'processed' ? new Date() : null, fulfillmentEmailSentAt: status === 'open' ? null : order.fulfillmentEmailSentAt },
      include: { customer: true, items: true },
    })
    if (status === 'processed' && !order.fulfillmentEmailSentAt) {
      try {
        const emailSent = await sendFulfillmentEmail(updated)
        if (emailSent) {
          await prisma.order.update({ where: { id: order.id }, data: { fulfillmentEmailSentAt: new Date() } })
        }
      } catch (error) {
        request.log.error({ error, orderId: order.id }, 'Fulfillment email failed after order was processed')
      }
    }
    return updated
  })

  app.post('/api/admin/orders/:id/refund', { preHandler: requireAdmin }, async (request, reply) => {
    const params = request.params as { id: string }
    const order = await prisma.order.findUnique({ where: { id: params.id }, include: { customer: true } })
    if (!order) return reply.code(404).send({ error: 'Order not found' })
    if (order.status === 'refunded') return reply.code(409).send({ error: 'Order is already refunded' })
    if (order.status !== 'paid') return reply.code(400).send({ error: 'Only paid orders can be refunded' })
    await refundPayment(order.molliePaymentId ?? '', order.totalCents)
    const updated = await prisma.order.update({ where: { id: order.id }, data: { status: 'refunded' }, include: { customer: true, items: true } })
    await sendRefundEmail(updated)
    return updated
  })
}
