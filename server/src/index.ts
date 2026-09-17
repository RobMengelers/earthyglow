import cors from '@fastify/cors'
import formbody from '@fastify/formbody'
import Fastify, { type FastifyError } from 'fastify'
import { env } from './env.js'
import { checkoutRoutes } from './routes/checkout.js'
import { healthRoutes } from './routes/health.js'
import { orderRoutes } from './routes/orders.js'
import { webhookRoutes } from './routes/webhooks.js'

const app = Fastify({ logger: true })

await app.register(cors, { origin: [env.FRONTEND_URL] })
await app.register(formbody)

await app.register(healthRoutes)
await app.register(checkoutRoutes)
await app.register(orderRoutes)
await app.register(webhookRoutes)

app.setErrorHandler((error: FastifyError, request, reply) => {
  request.log.error(error)
  const status =
    error.statusCode && error.statusCode < 500 ? error.statusCode : 500
  reply
    .code(status)
    .send({ error: status === 500 ? 'Internal server error' : error.message })
})

try {
  await app.listen({ port: env.PORT, host: '0.0.0.0' })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
