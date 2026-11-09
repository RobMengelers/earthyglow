import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { sendContactMessage } from '../email.js'
import { LOCALES, MESSAGES, toLocale } from '../i18n.js'

const bodySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.email(),
  message: z.string().min(3).max(5000),
  locale: z.enum(LOCALES).optional().default('en'),
})

export async function contactRoutes(app: FastifyInstance) {
  app.post(
    '/api/contact',
    { config: { rateLimit: { max: 3, timeWindow: '1 minute' } } },
    async (request, reply) => {
    const requested = toLocale((request.body as { locale?: unknown } | null)?.locale)
    const parsed = bodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply
        .code(400)
        .send({
          error:
            requested === 'en'
              ? (parsed.error.issues[0]?.message ?? 'Invalid request')
              : MESSAGES[requested].invalidRequest,
        })
    }

    try {
      await sendContactMessage(parsed.data)
      return reply.send({ ok: true })
    } catch (error) {
      request.log.error({ err: error }, 'Contact message send failed')
      return reply
        .code(503)
        .send({ error: MESSAGES[parsed.data.locale].contactFailed })
    }
    },
  )
}