import test from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'

process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test'
process.env.MOLLIE_API_KEY = ''
process.env.RESEND_API_KEY = 're_test'
process.env.EMAIL_FROM = 'test@example.com'
process.env.ADMIN_USERNAME = 'naomi'
process.env.ADMIN_PASSWORD = 'hunter2'
process.env.NODE_ENV = 'test'

const { prisma } = await import('../src/prisma.js')
const { adminRoutes } = await import('../src/routes/admin.js')

test('order lines can be ticked off and back on', async (t) => {
  const writes: { where: Record<string, unknown>; data: Record<string, unknown> }[] = []
  const original = prisma.orderItem.updateMany
  t.after(() => Reflect.set(prisma.orderItem, 'updateMany', original))
  Reflect.set(prisma.orderItem, 'updateMany', async (args: { where: { id: string; orderId: string }; data: Record<string, unknown> }) => {
    writes.push(args)
    return { count: args.where.id === 'item-1' && args.where.orderId === 'order-1' ? 1 : 0 }
  })
  const app = Fastify()
  t.after(() => app.close())
  await app.register(adminRoutes)
  const login = await app.inject({ method: 'POST', url: '/api/admin/login', payload: { username: 'naomi', password: 'hunter2' } })
  const tick = (url: string, payload: Record<string, unknown>, auth = true) => app.inject({
    method: 'PATCH', url,
    headers: auth ? { authorization: `Bearer ${login.json().token}` } : {},
    payload,
  })

  const on = await tick('/api/admin/orders/order-1/items/item-1', { checked: true })
  assert.equal(on.statusCode, 200)
  assert.deepEqual(on.json(), { id: 'item-1', checked: true })
  const off = await tick('/api/admin/orders/order-1/items/item-1', { checked: false })
  assert.deepEqual(off.json(), { id: 'item-1', checked: false })
  assert.deepEqual(writes.map((write) => write.data), [{ checked: true }, { checked: false }])

  // A line from another order is not found, even with a valid line id.
  assert.equal((await tick('/api/admin/orders/order-2/items/item-1', { checked: true })).statusCode, 404)
  assert.equal((await tick('/api/admin/orders/order-1/items/item-1', { checked: 'yes' })).statusCode, 400)
  assert.equal((await tick('/api/admin/orders/order-1/items/item-1', { checked: true }, false)).statusCode, 401)
  assert.equal(writes.length, 3)
})
