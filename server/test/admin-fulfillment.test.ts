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

test('dispatch supports emailing and marking as sent without email', async (t) => {
  let emails = 0
  t.mock.method(globalThis, 'fetch', async () => {
    emails++
    return new Response(JSON.stringify({ id: 'email-1' }), { status: 200 })
  })
  const order = {
    id: 'order-1', orderNumber: 'EG-1', fulfillmentStatus: 'open',
    carrier: null, trackingCode: null, fulfillmentEmailSentAt: null,
    customer: { firstName: 'Robin', email: 'robin@example.com' },
  }
  const writes: Record<string, unknown>[] = []
  const originalFind = prisma.order.findUnique
  const originalUpdate = prisma.order.update
  t.after(() => {
    Reflect.set(prisma.order, 'findUnique', originalFind)
    Reflect.set(prisma.order, 'update', originalUpdate)
  })
  Reflect.set(prisma.order, 'findUnique', async () => order)
  Reflect.set(prisma.order, 'update', async ({ data }: { data: Record<string, unknown> }) => {
    writes.push(data)
    return { ...order, ...data }
  })
  const app = Fastify()
  t.after(() => app.close())
  await app.register(adminRoutes)
  const login = await app.inject({ method: 'POST', url: '/api/admin/login', payload: { username: 'naomi', password: 'hunter2' } })
  const dispatch = (payload: Record<string, unknown>) => app.inject({
    method: 'PATCH', url: '/api/admin/orders/order-1/fulfillment',
    headers: { authorization: `Bearer ${login.json().token}` },
    payload: { status: 'processed', ...payload },
  })

  for (const details of [{}, { carrier: 'DHL', trackingCode: 'ignored' }]) {
    const response = await dispatch({ ...details, skipEmail: true })
    assert.equal(response.statusCode, 200)
    assert.equal(response.json().fulfillmentStatus, 'processed')
    assert.ok(response.json().fulfilledAt)
    assert.equal(response.json().carrier, null)
    assert.equal(response.json().trackingCode, null)
    assert.equal(response.json().fulfillmentEmailSentAt, null)
  }
  assert.equal(emails, 0)
  assert.equal(writes.length, 2)

  for (const payload of [{}, { carrier: 'UPS', trackingCode: '123' }, { carrier: 'DHL', trackingCode: ' ' }, { skipEmail: 'true' }]) {
    assert.equal((await dispatch(payload)).statusCode, 400)
  }
  assert.equal(writes.length, 2)

  for (const carrier of ['PostNL', 'DHL']) {
    const response = await dispatch({ carrier, trackingCode: ' 123 ', skipEmail: false })
    assert.equal(response.statusCode, 200)
    assert.equal(response.json().trackingCode, '123')
  }
  assert.equal(emails, 2)
  assert.ok(writes.at(-1)?.fulfillmentEmailSentAt instanceof Date)
})
