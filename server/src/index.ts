import cors from '@fastify/cors'
import formbody from '@fastify/formbody'
import rateLimit from '@fastify/rate-limit'
import Fastify, { type FastifyError } from 'fastify'
import { env } from './env.js'
import { retryUnsentInvoices } from './email.js'
import { prisma } from './prisma.js'
import { catalogRoutes } from './routes/catalog.js'
import { checkoutRoutes } from './routes/checkout.js'
import { contactRoutes } from './routes/contact.js'
import { couponRoutes } from './routes/coupons.js'
import { adminRoutes } from './routes/admin.js'
import { healthRoutes } from './routes/health.js'
import { orderRoutes } from './routes/orders.js'
import { paymentMethodRoutes } from './routes/payment-methods.js'
import { webhookRoutes } from './routes/webhooks.js'

// trustProxy is required so rate limits are keyed on the real client IP that
// Railway's reverse proxy reports via X-Forwarded-For, rather than proxy IPs.
const app = Fastify({ logger: true, trustProxy: true })

// Only the storefront (and its deploy previews) may call the API from a
// browser. FRONTEND_URL accepts a comma-separated list so a single deploy can
// allow the canonical domain plus previews without opening CORS to everyone.
const allowedOrigins = env.FRONTEND_URL.split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0)

await app.register(cors, {
  origin: allowedOrigins,
  methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE'],
})
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
await app.register(couponRoutes)
await app.register(adminRoutes)

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
const invoiceRetryTimer = setInterval(() => {
  runInvoiceRetry().catch((error) => {
    app.log.error({ err: error }, 'Invoice retry sweep failed')
  })
}, INVOICE_RETRY_INTERVAL_MS)
runInvoiceRetry().catch((error) => {
  app.log.error({ err: error }, 'Invoice retry sweep failed')
})

// Drain in-flight requests and close the DB pool on a deploy/restart signal so
// Railway's rolling restarts never cut a request off or leak connections.
let shuttingDown = false
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return
  shuttingDown = true
  app.log.info({ signal }, 'Shutting down')
  clearInterval(invoiceRetryTimer)
  try {
    await app.close()
  } finally {
    await prisma.$disconnect()
  }
}

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    shutdown(signal)
      .then(() => process.exit(0))
      .catch((error) => {
        app.log.error({ err: error }, 'Error during shutdown')
        process.exit(1)
      })
  })
}
