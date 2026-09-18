import cors from '@fastify/cors'
import formbody from '@fastify/formbody'
import rateLimit from '@fastify/rate-limit'
import Fastify, { type FastifyError } from 'fastify'
import { env } from './env.js'
import { retryUnsentInvoices } from './email.js'
import { catalogRoutes } from './routes/catalog.js'
import { checkoutRoutes } from './routes/checkout.js'
import { contactRoutes } from './routes/contact.js'
import { healthRoutes } from './routes/health.js'
import { orderRoutes } from './routes/orders.js'
import { paymentMethodRoutes } from './routes/payment-methods.js'
import { webhookRoutes } from './routes/webhooks.js'

// trustProxy is required so rate limits are keyed on the real client IP that
// Railway's reverse proxy reports via X-Forwarded-For, rather than proxy IPs.
const app = Fastify({ logger: true, trustProxy: true })

await app.register(cors, { origin: [env.FRONTEND_URL] })
await app.register(formbody)
await app.register(rateLimit, {
  max: 120,
  timeWindow: '1 minute',
})

await app.register(catalogRoutes)
await app.register(healthRoutes)
await app.register(checkoutRoutes)
await app.register(orderRoutes)
await app.register(paymentMethodRoutes)
await app.register(webhookRoutes)
await app.register(contactRoutes)

app.setErrorHandler((error: FastifyError, request, reply) => {
  request.log.error(error)
  const status =
    error.statusCode && error.statusCode < 500 ? error.statusCode : 500
  reply
    .code(status)
    .send({ error: status === 500 ? 'Internal server error' : error.message })
})

const INVOICE_RETRY_INTERVAL_MS = 5 * 60 * 1000

async function runInvoiceRetry(): Promise<void> {
  const stats = await retryUnsentInvoices()
  if (stats.attempts > 0) {
    app.log.info({ ...stats }, 'Invoice retry sweep complete')
  }
}

try {
  await app.listen({ port: env.PORT, host: '0.0.0.0' })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}

// Guarantee that paid orders always end up with a sent invoice, even if the
// immediate webhook send failed and Mollie already stopped retrying.
setInterval(() => {
  runInvoiceRetry().catch((error) => {
    app.log.error({ err: error }, 'Invoice retry sweep failed')
  })
}, INVOICE_RETRY_INTERVAL_MS)
runInvoiceRetry().catch((error) => {
  app.log.error({ err: error }, 'Invoice retry sweep failed')
})
