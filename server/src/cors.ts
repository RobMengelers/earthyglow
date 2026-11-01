import type { FastifyCorsOptions } from '@fastify/cors'

export function corsOptions(frontendUrl: string): FastifyCorsOptions {
  return {
    origin: frontendUrl.split(',').map((origin) => origin.trim()).filter(Boolean),
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
  }
}
