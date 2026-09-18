import type { FastifyInstance } from 'fastify'
import { prisma } from '../prisma.js'

export async function catalogRoutes(app: FastifyInstance) {
  app.get('/api/catalog', async () => {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, priceCents: true },
    })

    return { products }
  })
}