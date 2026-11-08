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

type Saved = { id: string; description: string; materialDeductions: Record<string, number> }

async function setup(t: { after: (fn: () => void) => void }) {
  const restore: (() => void)[] = []
  const stub = (target: object, key: string, impl: unknown) => {
    const original = Reflect.get(target, key)
    Reflect.set(target, key, impl)
    restore.push(() => { Reflect.set(target, key, original) })
  }
  t.after(() => { for (const undo of restore) undo() })

  const state = { stock: { wax: 10 } as Record<string, number>, tester: null as Saved | null, orderCreates: 0 }
  stub(prisma, '$transaction', async (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma))
  stub(prisma.product, 'findUnique', async () => ({
    id: 'candle', name: 'Candle', active: true, _count: { variants: 0, colors: 0 },
  }))
  stub(prisma.recipe, 'findMany', async () => [
    { productId: 'candle', variantId: null, colorId: null, ingredients: [{ materialId: 'wax', amount: 0.5 }] },
  ])
  stub(prisma.material, 'updateMany', async ({ where, data }: { where: { id: string }; data: { quantity: { decrement: number } } }) => {
    state.stock[where.id] -= data.quantity.decrement
    return { count: 1 }
  })
  stub(prisma.order, 'create', async () => { state.orderCreates += 1 })
  stub(prisma.testerOrder, 'create', async ({ data }: { data: { description: string } }) => {
    state.tester = { id: 't1', description: data.description, materialDeductions: {} }
    return state.tester
  })
  stub(prisma.testerOrder, 'update', async ({ data }: { data: { description?: string; materialDeductions?: Record<string, number> } }) => {
    state.tester = { ...state.tester!, ...data }
    return state.tester
  })
  stub(prisma.testerOrder, 'delete', async () => state.tester)

  const app = Fastify()
  await app.register(adminRoutes)
  const login = await app.inject({ method: 'POST', url: '/api/admin/login', payload: { username: 'naomi', password: 'hunter2' } })
  const headers = { authorization: `Bearer ${login.json().token as string}` }
  return { app, headers, state }
}

const body = (quantity: number) => ({
  date: '2026-11-08',
  description: 'Filming the Christmas reel',
  items: [{ productId: 'candle', quantity }],
})

test('a tester order needs no customer, subtracts its recipe and creates no sale', async (t) => {
  const { app, headers, state } = await setup(t)
  const response = await app.inject({ method: 'POST', url: '/api/admin/testers', headers, payload: body(3) })
  assert.equal(response.statusCode, 200)
  assert.equal(state.stock.wax, 8.5)
  assert.deepEqual(state.tester?.materialDeductions, { wax: 1.5 })
  assert.equal(state.orderCreates, 0)
})

test('a description is required', async (t) => {
  const { app, headers, state } = await setup(t)
  const response = await app.inject({ method: 'POST', url: '/api/admin/testers', headers, payload: { ...body(1), description: '  ' } })
  assert.equal(response.statusCode, 400)
  assert.equal(state.stock.wax, 10)
})

test('custom items are recorded without subtracting materials', async (t) => {
  const { app, headers, state } = await setup(t)
  const response = await app.inject({ method: 'POST', url: '/api/admin/testers', headers, payload: { ...body(1), items: [{ name: 'Prototype', quantity: 2 }] } })
  assert.equal(response.statusCode, 200)
  assert.equal(state.stock.wax, 10)
})

test('editing only applies the difference and deleting returns the materials', async (t) => {
  const { app, headers, state } = await setup(t)
  await app.inject({ method: 'POST', url: '/api/admin/testers', headers, payload: body(3) })
  const edit = await app.inject({ method: 'PUT', url: '/api/admin/testers/t1', headers, payload: body(1) })
  assert.equal(edit.statusCode, 200)
  assert.equal(state.stock.wax, 9.5)
  const removed = await app.inject({ method: 'DELETE', url: '/api/admin/testers/t1', headers })
  assert.equal(removed.statusCode, 200)
  assert.equal(state.stock.wax, 10)
})

test('tester routes require a session', async (t) => {
  const { app } = await setup(t)
  const response = await app.inject({ method: 'GET', url: '/api/admin/testers' })
  assert.equal(response.statusCode, 401)
})
