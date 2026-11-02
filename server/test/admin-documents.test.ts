import test from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import { gzipSync } from 'node:zlib'

process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test'
process.env.MOLLIE_API_KEY = ''
process.env.RESEND_API_KEY = ''
process.env.ADMIN_USERNAME = 'naomi'
process.env.ADMIN_PASSWORD = 'hunter2'
process.env.NODE_ENV = 'test'

const { prisma } = await import('../src/prisma.js')
const { adminRoutes } = await import('../src/routes/admin.js')

type DocumentRow = {
  id: string
  name: string
  mime: string
  bytes?: Buffer
  sizeBytes: number
  storedBytes: number
  compressed: boolean
  createdAt: Date
}

function documentRow(overrides: Partial<DocumentRow> = {}): DocumentRow {
  return {
    id: 'document-1',
    name: 'kvk-extract.pdf',
    mime: 'application/pdf',
    sizeBytes: 1200,
    storedBytes: 900,
    compressed: true,
    createdAt: new Date('2026-05-01T10:00:00.000Z'),
    ...overrides,
  }
}

function metadata(row: DocumentRow) {
  return {
    id: row.id,
    name: row.name,
    mime: row.mime,
    sizeBytes: row.sizeBytes,
    storedBytes: row.storedBytes,
    compressed: row.compressed,
    createdAt: row.createdAt,
  }
}

function stubDocuments(
  t: { after: (fn: () => void) => void },
  options: { rows?: DocumentRow[]; deleteMissing?: boolean } = {},
) {
  const restore: (() => void)[] = []
  const stub = (target: object, key: string, impl: unknown) => {
    const original = Reflect.get(target, key)
    Reflect.set(target, key, impl)
    restore.push(() => { Reflect.set(target, key, original) })
  }
  t.after(() => { for (const undo of restore) undo() })

  const rows = [...(options.rows ?? [])]
  const created: Record<string, unknown>[] = []

  stub(prisma.companyDocument, 'findMany', async () => rows.map(metadata))
  stub(prisma.companyDocument, 'aggregate', async () => ({
    _sum: { storedBytes: rows.reduce((sum, row) => sum + row.storedBytes, 0) },
  }))
  stub(prisma.companyDocument, 'createMany', async (args: { data: Record<string, unknown>[] }) => {
    created.push(...args.data)
    for (const [index, data] of args.data.entries()) {
      rows.unshift({
        id: `created-${index}`,
        createdAt: new Date('2026-11-02T12:00:00.000Z'),
        ...data,
      } as DocumentRow)
    }
    return { count: args.data.length }
  })
  stub(prisma.companyDocument, 'findUnique', async (args: { where: { id: string } }) => {
    const row = rows.find((item) => item.id === args.where.id)
    if (!row) return null
    return {
      name: row.name,
      mime: row.mime,
      bytes: row.bytes,
      compressed: row.compressed,
    }
  })
  stub(prisma.companyDocument, 'delete', async (args: { where: { id: string } }) => {
    const index = rows.findIndex((row) => row.id === args.where.id)
    if (options.deleteMissing || index < 0) throw new Error('record not found')
    return rows.splice(index, 1)[0]
  })

  return { created, rows }
}

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

test('document list returns metadata and storage totals without bytes', async (t) => {
  stubDocuments(t, { rows: [documentRow()] })
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'GET',
    url: '/api/admin/documents',
    headers: { authorization: `Bearer ${token}` },
  })

  assert.equal(response.statusCode, 200)
  const body = response.json()
  assert.equal(body.documents.length, 1)
  assert.equal(body.documents[0].name, 'kvk-extract.pdf')
  assert.equal(body.usedBytes, 900)
  assert.equal(body.limitBytes, 250 * 1024 * 1024)
  assert.ok(!('bytes' in body.documents[0]))
})

test('document upload compresses text before storing it', async (t) => {
  const { created } = stubDocuments(t)
  const original = Buffer.from('EarthyGlow company registration\n'.repeat(400))
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/documents',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      documents: [{
        name: 'registration.txt',
        type: 'text/plain',
        data: original.toString('base64'),
      }],
    },
  })

  assert.equal(response.statusCode, 200)
  assert.equal(created.length, 1)
  assert.equal(created[0].compressed, true)
  assert.equal(created[0].sizeBytes, original.length)
  assert.ok((created[0].storedBytes as number) < original.length)
  assert.ok((created[0].bytes as Buffer).length < original.length)
  assert.equal(response.json().documents.length, 1)
})

test('document upload stops at the storage limit', async (t) => {
  stubDocuments(t, {
    rows: [documentRow({ storedBytes: 250 * 1024 * 1024 })],
  })
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/documents',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      documents: [{
        name: 'insurance.pdf',
        type: 'application/pdf',
        data: Buffer.from('%PDF').toString('base64'),
      }],
    },
  })

  assert.equal(response.statusCode, 413)
  assert.match(response.json().error, /storage is full/i)
})

test('document download decompresses the stored bytes', async (t) => {
  const original = Buffer.from('%PDF-1.7\ncompany document\n%%EOF\n')
  stubDocuments(t, {
    rows: [documentRow({
      id: 'document-1',
      bytes: gzipSync(original),
      sizeBytes: original.length,
      storedBytes: gzipSync(original).length,
      compressed: true,
    })],
  })
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'GET',
    url: '/api/admin/documents/document-1/download',
    headers: { authorization: `Bearer ${token}` },
  })

  assert.equal(response.statusCode, 200)
  assert.equal(response.headers['content-type'], 'application/pdf')
  assert.equal(
    response.headers['content-disposition'],
    'attachment; filename="kvk-extract.pdf"',
  )
  assert.deepEqual(response.rawPayload, original)
})

test('document delete removes the row and 404s an unknown id', async (t) => {
  stubDocuments(t, { rows: [documentRow()] })
  const { app, token } = await authedApp()
  const headers = { authorization: `Bearer ${token}` }

  const deleted = await app.inject({
    method: 'DELETE',
    url: '/api/admin/documents/document-1',
    headers,
  })
  assert.equal(deleted.statusCode, 200)

  const missing = await app.inject({
    method: 'DELETE',
    url: '/api/admin/documents/document-1',
    headers,
  })
  assert.equal(missing.statusCode, 404)
})

test('document routes require an admin token', async (t) => {
  stubDocuments(t)
  const app = Fastify()
  await app.register(adminRoutes)
  const response = await app.inject({ method: 'GET', url: '/api/admin/documents' })
  assert.equal(response.statusCode, 401)
})
