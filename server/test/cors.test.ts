import assert from 'node:assert/strict'
import test from 'node:test'
import cors from '@fastify/cors'
import Fastify from 'fastify'
import { corsOptions } from '../src/cors.js'

test('custom order edit preflight allows PUT and admin headers for configured origins', async (t) => {
  const app = Fastify()
  t.after(() => app.close())
  await app.register(cors, corsOptions('https://shop.example, https://preview.example, '))

  for (const origin of ['https://shop.example', 'https://preview.example', 'https://untrusted.example']) {
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/api/admin/orders/order-123',
      headers: {
        origin,
        'access-control-request-method': 'PUT',
        'access-control-request-headers': 'authorization,content-type',
      },
    })

    if (origin === 'https://untrusted.example') {
      assert.equal(response.headers['access-control-allow-origin'], undefined)
      continue
    }
    assert.equal(response.statusCode, 204)
    assert.equal(response.headers['access-control-allow-origin'], origin)
    const methods = String(response.headers['access-control-allow-methods']).split(',').map((method) => method.trim())
    assert.ok(methods.includes('PUT'))
    assert.equal(response.headers['access-control-allow-headers'], 'authorization,content-type')
  }
})
