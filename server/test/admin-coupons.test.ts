import test from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'

process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test'
process.env.MOLLIE_API_KEY = ''
process.env.RESEND_API_KEY = ''
process.env.ADMIN_USERNAME = 'naomi'
process.env.ADMIN_PASSWORD = 'hunter2'
process.env.NODE_ENV = 'test'

const { prisma } = await import('../src/prisma.js')
const { adminRoutes } = await import('../src/routes/admin.js')

async function authedApp() {
  const app = Fastify()
  await app.register(adminRoutes)
  const login = await app.inject({
    method: 'POST',
    url: '/api/admin/login',
    payload: { username: 'naomi', password: 'hunter2' },
  })
  assert.equal(login.statusCode, 200)
  return { app, token: login.json().token as string }
}

type Stub = { created: Record<string, unknown>[] }

// Stubs the coupon reads/writes and captures what the route tried to persist.
function stubCoupons(
  t: { after: (fn: () => void) => void },
  options: { existing?: Record<string, unknown>[] } = {},
): Stub {
  const restore: (() => void)[] = []
  const stub = (target: object, key: string, impl: unknown) => {
    const original = Reflect.get(target, key)
    Reflect.set(target, key, impl)
    restore.push(() => { Reflect.set(target, key, original) })
  }
  t.after(() => { for (const undo of restore) undo() })

  const created: Record<string, unknown>[] = []

  const row = (overrides: Record<string, unknown> = {}) => ({
    id: 'coupon_glowfam',
    code: 'GLOWFAM',
    description: 'Free shipping for friends and family',
    type: 'free_shipping',
    percentOff: null,
    amountOffCents: null,
    maxUses: null,
    usedCount: 0,
    startsAt: null,
    expiresAt: null,
    active: true,
    createdAt: new Date('2026-10-01T12:00:00.000Z'),
    updatedAt: new Date('2026-10-01T12:00:00.000Z'),
    ...overrides,
  })

  stub(prisma.coupon, 'findMany', async () =>
    (options.existing ?? [row()]).map((r) => ({ ...r, _count: { redemptions: 2 } })),
  )
  stub(prisma.coupon, 'findUnique', async ({ where }: { where: { code: string } }) =>
    (options.existing ?? [row()]).find((r) => r.code === where.code) ?? null)
  stub(prisma.coupon, 'create', async ({ data }: { data: Record<string, unknown> }) => {
    created.push(data)
    return row(data)
  })
  stub(prisma.coupon, 'update', async ({ data }: { data: Record<string, unknown> }) =>
    row({ ...data }))

  return { created }
}

test('the coupons page lists the codes with how often they were used', async (t) => {
  stubCoupons(t)
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'GET',
    url: '/api/admin/coupons',
    headers: { Authorization: `Bearer ${token}` },
  })
  assert.equal(response.statusCode, 200)
  assert.equal(response.json().coupons[0].code, 'GLOWFAM')
  assert.equal(response.json().coupons[0].redemptions, 2)
  await app.close()
})

test('the admin creates a coupon', async (t) => {
  const stub = stubCoupons(t, { existing: [] })
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/coupons',
    headers: { Authorization: `Bearer ${token}` },
    payload: {
      code: 'xmas20',
      description: 'Christmas offer',
      type: 'percent',
      percentOff: 20,
      maxUses: 50,
      expiresAt: '2026-12-26',
    },
  })
  assert.equal(response.statusCode, 200)
  // The code is stored uppercase, so it can be typed in any case.
  assert.equal(stub.created[0].code, 'XMAS20')
  assert.equal(stub.created[0].percentOff, 20)
  assert.equal(stub.created[0].maxUses, 50)
  assert.equal(response.json().coupon.code, 'XMAS20')
  await app.close()
})

test('a code that already exists is refused', async (t) => {
  stubCoupons(t)
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/coupons',
    headers: { Authorization: `Bearer ${token}` },
    payload: { code: 'glowfam', type: 'free_shipping' },
  })
  assert.equal(response.statusCode, 400)
  assert.match(response.json().error, /already exists/)
  await app.close()
})

test('a percentage code without a percentage is refused', async (t) => {
  stubCoupons(t, { existing: [] })
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/coupons',
    headers: { Authorization: `Bearer ${token}` },
    payload: { code: 'xmas', type: 'percent' },
  })
  assert.equal(response.statusCode, 400)
  assert.match(response.json().error, /percentage/)
  await app.close()
})

test('the admin turns a code off', async (t) => {
  stubCoupons(t)
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'PATCH',
    url: '/api/admin/coupons/coupon_glowfam',
    headers: { Authorization: `Bearer ${token}` },
    payload: { active: false },
  })
  assert.equal(response.statusCode, 200)
  assert.equal(response.json().coupon.active, false)
  await app.close()
})

test('the coupon routes need a signed-in admin', async (t) => {
  stubCoupons(t)
  const { app } = await authedApp()
  const response = await app.inject({ method: 'GET', url: '/api/admin/coupons' })
  assert.equal(response.statusCode, 401)
  await app.close()
})
