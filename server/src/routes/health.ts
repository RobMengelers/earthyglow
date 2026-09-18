import type { FastifyInstance } from 'fastify'
import { mollieEnabled } from '../mollie.js'

export async function healthRoutes(app: FastifyInstance) {
  app.get(
    '/api/health',
    { config: { rateLimit: false } },
    async () => ({
      ok: true,
      mollie: mollieEnabled ? 'configured' : 'mock',
    }),
  )
}
