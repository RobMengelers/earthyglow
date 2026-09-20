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
}