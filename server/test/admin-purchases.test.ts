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

type Stub = { created: Record<string, unknown>[]; updated: Record<string, unknown>[] }

// Stubs the purchase reads/writes and captures what the route tried to persist.
function stubPurchases(
  t: { after: (fn: () => void) => void },
  options: {
    rows?: Record<string, unknown>[]
    deleted?: boolean
    updateMissing?: boolean
    document?: { documentName: string | null; documentMime: string | null; documentBytes: Buffer | null }
  } = {},
): Stub {
  const restore: (() => void)[] = []
  const stub = (target: object, key: string, impl: unknown) => {
    const original = Reflect.get(target, key)
    Reflect.set(target, key, impl)
    restore.push(() => { Reflect.set(target, key, original) })
  }
  t.after(() => { for (const undo of restore) undo() })

  const created: Record<string, unknown>[] = []
  const updated: Record<string, unknown>[] = []

  const row = (overrides: Record<string, unknown> = {}) => ({
    id: 'purchase-1',
    dateBought: new Date('2026-10-01T12:00:00.000Z'),
    description: 'Soy wax, 5kg',
    costCents: 1210,
    documentName: null,
    documentMime: null,
    createdAt: new Date('2026-10-01T13:00:00.000Z'),
    updatedAt: new Date('2026-10-01T13:00:00.000Z'),
    ...overrides,
  })

  stub(prisma.purchase, 'findMany', async (args: Record<string, unknown>) => {
    const rows = options.rows ?? [row()]
    return rows.map((r) => {
      const rest: Record<string, unknown> = { ...r }
      for (const key of Object.keys((args.omit ?? {}) as Record<string, boolean>)) {
        delete rest[key]
      }
      return rest
    })
  })
  stub(prisma.purchase, 'create', async (args: { data: Record<string, unknown>; omit?: Record<string, boolean> }) => {
    created.push(args.data)
    const result: Record<string, unknown> = { id: 'purchase-new', ...args.data }
    // Mirror Prisma so dropping `omit` from the create fails the test.
    for (const key of Object.keys(args.omit ?? {})) delete result[key]
    return result
  })
  stub(prisma.purchase, 'update', async (args: { data: Record<string, unknown>; omit?: Record<string, boolean> }) => {
    if (options.updateMissing) throw new Error('record not found')
    updated.push(args.data)
    const result: Record<string, unknown> = {
      ...(options.rows?.[0] ?? row()),
      ...args.data,
    }
    for (const key of Object.keys(args.omit ?? {})) delete result[key]
    return result
  })
  stub(prisma.purchase, 'delete', async () => {
    if (options.deleted === false) throw new Error('record not found')
    return row()
  })
  stub(prisma.purchase, 'findUnique', async () => options.document ?? row())

  return { created, updated }
}

test('purchase list returns the VAT split and never the document bytes', async (t) => {
  stubPurchases(t, {
    rows: [
      {
        id: 'purchase-1',
        dateBought: new Date('2026-10-01T12:00:00.000Z'),
        description: 'Soy wax, 5kg',
        costCents: 1210,
        documentName: 'receipt.pdf',
        documentMime: 'application/pdf',
        documentBytes: Buffer.from('%PDF'),
        createdAt: new Date('2026-10-01T13:00:00.000Z'),
      },
    ],
  })
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'GET',
    url: '/api/admin/purchases',
    headers: { authorization: `Bearer ${token}` },
  })
  assert.equal(response.statusCode, 200)

  const purchase = response.json().purchases[0]
  assert.equal(purchase.costCents, 1210)
  // 21% VAT included: net 1000, VAT 210 for a gross of 1210.
  assert.equal(purchase.netCents, 1000)
  assert.equal(purchase.vatCents, 210)
  assert.equal(purchase.hasDocument, true)
  assert.equal(purchase.documentName, 'receipt.pdf')
  assert.ok(!('documentBytes' in purchase), 'documentBytes must be omitted')
})

test('purchase requires an admin token', async (t) => {
  stubPurchases(t)
  const app = Fastify()
  await app.register(adminRoutes)
  const response = await app.inject({ method: 'GET', url: '/api/admin/purchases' })
  assert.equal(response.statusCode, 401)
})

test('purchase creation splits the VAT-inclusive cost', async (t) => {
  const { created } = stubPurchases(t)
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/purchases',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      date: '2026-10-01',
      description: 'Wick spools',
      cost: '24,50',
    },
  })
  assert.equal(response.statusCode, 200)

  const purchase = response.json().purchase
  assert.equal(purchase.costCents, 2450)
  assert.equal(purchase.netCents, Math.round((2450 * 100) / 121))
  assert.equal(purchase.vatCents, 2450 - purchase.netCents)
  assert.equal(purchase.hasDocument, false)

  const persisted = created[0]
  assert.equal(persisted.costCents, 2450)
  assert.equal(persisted.description, 'Wick spools')
  assert.equal(
    new Date(persisted.dateBought as Date).toISOString(),
    '2026-10-01T12:00:00.000Z',
  )
  assert.equal(persisted.documentBytes, null)
})

test('purchase creation rejects a malformed cost', async (t) => {
  stubPurchases(t)
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/purchases',
    headers: { authorization: `Bearer ${token}` },
    payload: { date: '2026-10-01', description: 'Wick spools', cost: 'not-a-number' },
  })
  assert.equal(response.statusCode, 400)
  assert.equal(response.json().error, 'Enter the total cost in euros, e.g. 24,50')
})

test('purchase creation rejects a zero cost and a blank description', async (t) => {
  const { created } = stubPurchases(t)
  const { app, token } = await authedApp()
  const zero = await app.inject({
    method: 'POST',
    url: '/api/admin/purchases',
    headers: { authorization: `Bearer ${token}` },
    payload: { date: '2026-10-01', description: 'Wick spools', cost: '0' },
  })
  assert.equal(zero.statusCode, 400)
  const blank = await app.inject({
    method: 'POST',
    url: '/api/admin/purchases',
    headers: { authorization: `Bearer ${token}` },
    payload: { date: '2026-10-01', description: '   ', cost: '10' },
  })
  assert.equal(blank.statusCode, 400)
  assert.equal(created.length, 0)
})

test('purchase creation stores a base64 document', async (t) => {
  const { created } = stubPurchases(t)
  const { app, token } = await authedApp()
  const bytes = Buffer.from('fake receipt bytes')
  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/purchases',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      date: '2026-10-05',
      description: 'Votive moulds',
      cost: '45,90',
      document: {
        name: 'receipt.pdf',
        type: 'application/pdf',
        data: bytes.toString('base64'),
      },
    },
  })
  assert.equal(response.statusCode, 200)
  assert.equal(response.json().purchase.hasDocument, true)

  const persisted = created[0]
  assert.equal(persisted.documentName, 'receipt.pdf')
  assert.equal(persisted.documentMime, 'application/pdf')
  assert.deepEqual(persisted.documentBytes, bytes)
})

test('purchase document endpoint streams the bytes with an attachment header', async (t) => {
  const bytes = Buffer.from('%PDF fake')
  stubPurchases(t, {
    document: {
      documentName: 'receipt.pdf',
      documentMime: 'application/pdf',
      documentBytes: bytes,
    },
  })
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'GET',
    url: '/api/admin/purchases/purchase-1/document',
    headers: { authorization: `Bearer ${token}` },
  })
  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.rawPayload, bytes)
  assert.equal(response.headers['content-disposition'], 'attachment; filename="receipt.pdf"')
  assert.equal(response.headers['content-type'], 'application/pdf')
})

test('purchase document endpoint 404s when there is no document', async (t) => {
  stubPurchases(t, {
    document: {
      documentName: null,
      documentMime: null,
      documentBytes: null,
    },
  })
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'GET',
    url: '/api/admin/purchases/purchase-1/document',
    headers: { authorization: `Bearer ${token}` },
  })
  assert.equal(response.statusCode, 404)
})

test('purchase editing updates the fields and keeps the document', async (t) => {
  const { updated } = stubPurchases(t)
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'PATCH',
    url: '/api/admin/purchases/purchase-1',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      date: '2026-10-02',
      description: 'Soy wax, 6kg',
      cost: '30,00',
    },
  })
  assert.equal(response.statusCode, 200)
  assert.equal(response.json().purchase.costCents, 3000)

  const persisted = updated[0]
  assert.equal(persisted.description, 'Soy wax, 6kg')
  assert.equal(persisted.costCents, 3000)
  assert.equal(
    new Date(persisted.dateBought as Date).toISOString(),
    '2026-10-02T12:00:00.000Z',
  )
  // No document fields were sent, so the existing receipt stays untouched.
  assert.ok(!('documentName' in persisted))
})

test('purchase editing can replace or remove the document', async (t) => {
  const { updated } = stubPurchases(t)
  const { app, token } = await authedApp()
  const bytes = Buffer.from('new receipt')

  const replace = await app.inject({
    method: 'PATCH',
    url: '/api/admin/purchases/purchase-1',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      date: '2026-10-02',
      description: 'Soy wax, 6kg',
      cost: '30,00',
      document: {
        name: 'new-receipt.pdf',
        type: 'application/pdf',
        data: bytes.toString('base64'),
      },
    },
  })
  assert.equal(replace.statusCode, 200)
  assert.equal(updated[0].documentName, 'new-receipt.pdf')
  assert.deepEqual(updated[0].documentBytes, bytes)

  const remove = await app.inject({
    method: 'PATCH',
    url: '/api/admin/purchases/purchase-1',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      date: '2026-10-02',
      description: 'Soy wax, 6kg',
      cost: '30,00',
      removeDocument: true,
    },
  })
  assert.equal(remove.statusCode, 200)
  assert.equal(updated[1].documentName, null)
  assert.equal(updated[1].documentMime, null)
  assert.equal(updated[1].documentBytes, null)
})

test('purchase editing rejects a bad cost and 404s an unknown id', async (t) => {
  stubPurchases(t, { updateMissing: true })
  const { app, token } = await authedApp()

  const badCost = await app.inject({
    method: 'PATCH',
    url: '/api/admin/purchases/purchase-1',
    headers: { authorization: `Bearer ${token}` },
    payload: { date: '2026-10-02', description: 'Soy wax', cost: '0' },
  })
  assert.equal(badCost.statusCode, 400)

  const missing = await app.inject({
    method: 'PATCH',
    url: '/api/admin/purchases/missing',
    headers: { authorization: `Bearer ${token}` },
    payload: { date: '2026-10-02', description: 'Soy wax', cost: '30,00' },
  })
  assert.equal(missing.statusCode, 404)
})

test('purchase deletion removes the record', async (t) => {
  stubPurchases(t)
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'DELETE',
    url: '/api/admin/purchases/purchase-1',
    headers: { authorization: `Bearer ${token}` },
  })
  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.json(), { ok: true })
})

test('purchase deletion 404s on an unknown id', async (t) => {
  stubPurchases(t, { deleted: false })
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'DELETE',
    url: '/api/admin/purchases/some-missing-id',
    headers: { authorization: `Bearer ${token}` },
  })
  assert.equal(response.statusCode, 404)
})