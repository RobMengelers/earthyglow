import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  MOLLIE_API_KEY: z.string().default(''),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  PUBLIC_API_URL: z.string().default('http://localhost:4000'),
})

export const env = schema.parse(process.env)

export const isProduction = env.NODE_ENV === 'production'
