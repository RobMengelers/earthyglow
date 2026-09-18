import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { sendContactMessage } from '../email.js'

const bodySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.email(),
  message: z.string().min(3).max(5000),
})

export async function contactRoutes(app: FastifyInstance) {
  app.post('/api/contact', async (request, reply) => {
    const parsed = bodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: parsed.error.issues[0]?.message ?? 'Invalid request' })
    }

    try {
      await sendContactMessage(parsed.data)
      return reply.send({ ok: true })
    } catch (error) {
      request.log.error({ err: error }, 'Contact message send failed')
      return reply
        .code(503)
        .send({ error: 'Message could not be sent right now, please try again later' })
    }
  })
}