import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  COUPON_CODE_MAX_LENGTH,
  couponProblem,
  couponSummary,
  normalizeCouponCode,
} from '../coupon.js'
import { prisma } from '../prisma.js'

const bodySchema = z.object({
  code: z.string().trim().min(1).max(COUPON_CODE_MAX_LENGTH),
})

// Checks a code before the customer commits to it, so the storefront can say
// straight away that a code is wrong, expired or already used. The checkout
// validates the code again before it takes any money, so this endpoint never
// decides anything on its own.
export async function couponRoutes(app: FastifyInstance) {
  app.post(
    '/api/coupons/validate',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const parsed = bodySchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.code(400).send({ error: 'Enter a coupon code.' })
      }

      const code = normalizeCouponCode(parsed.data.code)
      const coupon = await prisma.coupon.findUnique({ where: { code } })
      if (!coupon) {
        return reply.code(404).send({ error: 'That coupon code is not valid.' })
      }

      const problem = couponProblem(coupon)
      if (problem) {
        return reply.code(400).send({ error: problem })
      }

      return reply.send({
        code: coupon.code,
        type: coupon.type,
        percentOff: coupon.percentOff,
        description: coupon.description,
        summary: couponSummary(coupon),
      })
    },
  )
}
