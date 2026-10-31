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

type Restore = { restore: () => void }

function stub(
  t: { after: (fn: () => void) => void },
  target: object,
  key: string,
  impl: unknown,
): Restore {
  const original = Reflect.get(target, key)
  Reflect.set(target, key, impl)
  const restore = () => { Reflect.set(target, key, original) }
  t.after(restore)
  return { restore }
}

const materialRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'material-wax',
  name: 'Soy wax',
  unit: 'kg',
  quantity: 2.5,
  createdAt: new Date('2026-10-01T12:00:00.000Z'),
  updatedAt: new Date('2026-10-01T12:00:00.000Z'),
  ...overrides,
})

const scentRow = (overrides: Record<string, unknown> = {}) =>
  materialRow({ id: 'material-scent', name: 'Scent', unit: 'g', quantity: 300, ...overrides })

function recipeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'recipe-1',
    product: { id: 'floral-box', name: 'The Floral Box' },
    createdAt: new Date('2026-10-02T12:00:00.000Z'),
    updatedAt: new Date('2026-10-02T12:00:00.000Z'),
    ingredients: [
      {
        materialId: 'material-wax',
        amount: 0.05,
        material: materialRow(),
      },
      {
        materialId: 'material-scent',
        amount: 12,
        material: scentRow(),
      },
    ],
    fields: [{ label: 'Cure time', value: '48 hours' }],
    ...overrides,
  }
}

test('materials list requires an admin token', async (t) => {
  stub(t, prisma.material, 'findMany', async () => [])
  stub(t, prisma.recipe, 'findMany', async () => [])
  const app = Fastify()
  await app.register(adminRoutes)
  const response = await app.inject({ method: 'GET', url: '/api/admin/materials' })
  assert.equal(response.statusCode, 401)
})

test('material list and recipe yield are derived from leftover stock', async (t) => {
  stub(t, prisma.material, 'findMany', async (args: { orderBy?: { name?: string } }) => {
    const rows = [scentRow(), materialRow()]
    return args.orderBy?.name === 'asc'
      ? [...rows].sort((a, b) => String(a.name).localeCompare(String(b.name)))
      : rows
  })
  stub(t, prisma.recipe, 'findMany', async () => [recipeRow()])
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'GET',
    url: '/api/admin/materials',
    headers: { authorization: `Bearer ${token}` },
  })
  assert.equal(response.statusCode, 200)

  const body = response.json()
  // Materials come back sorted by name, as the route asks.
  assert.deepEqual(
    body.materials.map((row: { name: string }) => row.name),
    ['Scent', 'Soy wax'],
  )

  const recipe = body.recipes[0]
  assert.equal(recipe.product.name, 'The Floral Box')
  // 2,5 kg / 0,05 = 50 bars; 300 g / 12 g = 25 bars → scent is the limit.
  assert.equal(recipe.ingredients[0].possibleUnits, 50)
  assert.equal(recipe.ingredients[1].possibleUnits, 25)
  assert.equal(recipe.possibleUnits, 25)
  assert.deepEqual(recipe.fields, [{ label: 'Cure time', value: '48 hours' }])
})

test('recipe yield absorbs float dust so exact divisions are not cut short', async (t) => {
  stub(t, prisma.material, 'findMany', async () => [
    materialRow({ quantity: 0.3 }),
  ])
  stub(t, prisma.recipe, 'findMany', async () => [
    recipeRow({
      ingredients: [
        { materialId: 'material-wax', amount: 0.1, material: materialRow({ quantity: 0.3 }) },
      ],
    }),
  ])
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'GET',
    url: '/api/admin/materials',
    headers: { authorization: `Bearer ${token}` },
  })
  assert.equal(response.json().recipes[0].possibleUnits, 3)
})

test('material creation parses the amount and returns the row', async (t) => {
  const created: Record<string, unknown>[] = []
  stub(t, prisma.material, 'create', async (args: { data: Record<string, unknown> }) => {
    created.push(args.data)
    return materialRow(args.data)
  })
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/materials',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Cotton wicks', unit: 'pcs', quantity: '150' },
  })
  assert.equal(response.statusCode, 200)
  assert.equal(response.json().material.name, 'Cotton wicks')
  assert.equal(created[0].quantity, 150)
})

test('material creation rejects a malformed amount and a blank name', async (t) => {
  const created: Record<string, unknown>[] = []
  stub(t, prisma.material, 'create', async (args: { data: Record<string, unknown> }) => {
    created.push(args.data)
    return materialRow(args.data)
  })
  const { app, token } = await authedApp()
  const malformed = await app.inject({
    method: 'POST',
    url: '/api/admin/materials',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Soy wax', unit: 'kg', quantity: 'lots' },
  })
  assert.equal(malformed.statusCode, 400)
  const blank = await app.inject({
    method: 'POST',
    url: '/api/admin/materials',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: '   ', unit: 'kg', quantity: '5' },
  })
  assert.equal(blank.statusCode, 400)
  assert.equal(created.length, 0)
})

test('stock is topped up with a comma decimal', async (t) => {
  const updates: Record<string, unknown>[] = []
  stub(t, prisma.material, 'findUnique', async () => materialRow())
  stub(t, prisma.material, 'update', async (args: { data: Record<string, unknown> }) => {
    updates.push(args.data)
    return materialRow(args.data)
  })
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/materials/material-wax/stock',
    headers: { authorization: `Bearer ${token}` },
    payload: { amount: '2,5' },
  })
  assert.equal(response.statusCode, 200)
  assert.equal(updates[0].quantity, 5)
})

test('a correction may bring stock down but never below zero', async (t) => {
  stub(t, prisma.material, 'findUnique', async () => materialRow())
  stub(t, prisma.material, 'update', async () => materialRow())
  const { app, token } = await authedApp()

  const correction = await app.inject({
    method: 'POST',
    url: '/api/admin/materials/material-wax/stock',
    headers: { authorization: `Bearer ${token}` },
    payload: { amount: '-0,5' },
  })
  assert.equal(correction.statusCode, 200)

  const belowZero = await app.inject({
    method: 'POST',
    url: '/api/admin/materials/material-wax/stock',
    headers: { authorization: `Bearer ${token}` },
    payload: { amount: '-3' },
  })
  assert.equal(belowZero.statusCode, 400)
  assert.match(belowZero.json().error, /below zero/)
})

test('stock update 404s on an unknown material', async (t) => {
  stub(t, prisma.material, 'findUnique', async () => null)
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/materials/nope/stock',
    headers: { authorization: `Bearer ${token}` },
    payload: { amount: '1' },
  })
  assert.equal(response.statusCode, 404)
})

test('recipe creation persists ingredients and fields and returns the yield', async (t) => {
  const created: Record<string, unknown>[] = []
  stub(t, prisma.product, 'findUnique', async () => ({ id: 'floral-box' }))
  stub(t, prisma.material, 'findMany', async () => [materialRow(), scentRow()])
  stub(t, prisma.recipe, 'create', async (args: { data: Record<string, unknown> }) => {
    created.push(args.data)
    return recipeRow()
  })
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/recipes',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      productId: 'floral-box',
      ingredients: [
        { materialId: 'material-wax', amount: '0,05' },
        { materialId: 'material-scent', amount: '12' },
      ],
      fields: [{ label: 'Cure time', value: '48 hours' }],
    },
  })
  assert.equal(response.statusCode, 200)
  assert.equal(response.json().recipe.possibleUnits, 25)

  const data = created[0]
  assert.equal(data.productId, 'floral-box')
  const lines = data.ingredients as { create: { materialId: string; amount: number }[] }
  assert.equal(lines.create[0].amount, 0.05)
  assert.equal(lines.create[1].amount, 12)
  const fields = data.fields as { create: { label: string }[] }
  assert.equal(fields.create[0].label, 'Cure time')
})

test('recipe creation rejects an unknown product and an unknown material', async (t) => {
  // The first inject hits the unknown product, the second passes the product
  // check (the stub flips after its first answer) and fails on the material.
  let productCalls = 0
  stub(t, prisma.product, 'findUnique', async () =>
    productCalls++ === 0 ? null : { id: 'floral-box' },
  )
  stub(t, prisma.material, 'findMany', async () => [])
  const { app, token } = await authedApp()
  const unknownProduct = await app.inject({
    method: 'POST',
    url: '/api/admin/recipes',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      productId: 'gone',
      ingredients: [{ materialId: 'material-wax', amount: '1' }],
      fields: [],
    },
  })
  assert.equal(unknownProduct.statusCode, 400)
  assert.equal(unknownProduct.json().error, 'That product no longer exists')

  const unknownMaterial = await app.inject({
    method: 'POST',
    url: '/api/admin/recipes',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      productId: 'floral-box',
      ingredients: [{ materialId: 'gone', amount: '1' }],
      fields: [],
    },
  })
  assert.equal(unknownMaterial.statusCode, 400)
  assert.equal(unknownMaterial.json().error, 'That material no longer exists')
})

test('recipe creation rejects a zero ingredient amount and no ingredients', async (t) => {
  stub(t, prisma.product, 'findUnique', async () => ({ id: 'floral-box' }))
  stub(t, prisma.material, 'findMany', async () => [materialRow()])
  stub(t, prisma.recipe, 'create', async () => recipeRow())
  const { app, token } = await authedApp()

  const zero = await app.inject({
    method: 'POST',
    url: '/api/admin/recipes',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      productId: 'floral-box',
      ingredients: [{ materialId: 'material-wax', amount: '0' }],
      fields: [],
    },
  })
  assert.equal(zero.statusCode, 400)

  const empty = await app.inject({
    method: 'POST',
    url: '/api/admin/recipes',
    headers: { authorization: `Bearer ${token}` },
    payload: { productId: 'floral-box', ingredients: [], fields: [] },
  })
  assert.equal(empty.statusCode, 400)
  assert.equal(empty.json().error, 'Add at least one material to the recipe')
})

test('material editing saves the new name, unit and amount', async (t) => {
  const updates: Record<string, unknown>[] = []
  stub(t, prisma.material, 'update', async (args: { data: Record<string, unknown> }) => {
    updates.push(args.data)
    return materialRow(args.data)
  })
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'PATCH',
    url: '/api/admin/materials/material-wax',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Coconut wax', unit: 'g', quantity: '4,25' },
  })
  assert.equal(response.statusCode, 200)
  assert.equal(response.json().material.name, 'Coconut wax')
  assert.deepEqual(updates[0], { name: 'Coconut wax', unit: 'g', quantity: 4.25 })
})

test('material editing rejects a malformed amount and 404s an unknown id', async (t) => {
  stub(t, prisma.material, 'update', async () => {
    throw new Error('record not found')
  })
  const { app, token } = await authedApp()

  const malformed = await app.inject({
    method: 'PATCH',
    url: '/api/admin/materials/material-wax',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Soy wax', unit: 'kg', quantity: 'lots' },
  })
  assert.equal(malformed.statusCode, 400)

  const missing = await app.inject({
    method: 'PATCH',
    url: '/api/admin/materials/missing',
    headers: { authorization: `Bearer ${token}` },
    payload: { name: 'Soy wax', unit: 'kg', quantity: '5' },
  })
  assert.equal(missing.statusCode, 404)
})

test('recipe editing replaces ingredients and fields', async (t) => {
  const updates: Record<string, unknown>[] = []
  stub(t, prisma.product, 'findUnique', async () => ({ id: 'floral-box' }))
  stub(t, prisma.material, 'findMany', async () => [materialRow(), scentRow()])
  stub(t, prisma.recipe, 'update', async (args: { data: Record<string, unknown> }) => {
    updates.push(args.data)
    return recipeRow()
  })
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'PATCH',
    url: '/api/admin/recipes/recipe-1',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      productId: 'floral-box',
      ingredients: [
        { materialId: 'material-wax', amount: '0,06' },
        { materialId: 'material-scent', amount: '10' },
      ],
      fields: [{ label: 'Cure time', value: '72 hours' }],
    },
  })
  assert.equal(response.statusCode, 200)
  assert.equal(response.json().recipe.possibleUnits, 25)

  const data = updates[0]
  assert.equal(data.productId, 'floral-box')
  assert.deepEqual(data.ingredients, {
    deleteMany: {},
    create: [
      { materialId: 'material-wax', amount: 0.06 },
      { materialId: 'material-scent', amount: 10 },
    ],
  })
  assert.deepEqual(data.fields, {
    deleteMany: {},
    create: [{ label: 'Cure time', value: '72 hours' }],
  })
})

test('recipe editing 404s on an unknown id', async (t) => {
  stub(t, prisma.product, 'findUnique', async () => ({ id: 'floral-box' }))
  stub(t, prisma.material, 'findMany', async () => [materialRow()])
  stub(t, prisma.recipe, 'update', async () => {
    throw new Error('record not found')
  })
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'PATCH',
    url: '/api/admin/recipes/missing',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      productId: 'floral-box',
      ingredients: [{ materialId: 'material-wax', amount: '1' }],
      fields: [],
    },
  })
  assert.equal(response.statusCode, 404)
})

test('material deletion 409s while a recipe still uses it', async (t) => {
  stub(t, prisma.material, 'delete', async () => {
    throw new Error('foreign key constraint')
  })
  stub(t, prisma.recipeIngredient, 'count', async () => 1)
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'DELETE',
    url: '/api/admin/materials/material-wax',
    headers: { authorization: `Bearer ${token}` },
  })
  assert.equal(response.statusCode, 409)
  assert.match(response.json().error, /used in a recipe/)
})

test('recipe deletion removes the recipe', async (t) => {
  stub(t, prisma.recipe, 'delete', async () => recipeRow())
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'DELETE',
    url: '/api/admin/recipes/recipe-1',
    headers: { authorization: `Bearer ${token}` },
  })
  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.json(), { ok: true })
})

test('recipe deletion 404s on an unknown id', async (t) => {
  stub(t, prisma.recipe, 'delete', async () => {
    throw new Error('record not found')
  })
  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'DELETE',
    url: '/api/admin/recipes/missing',
    headers: { authorization: `Bearer ${token}` },
  })
  assert.equal(response.statusCode, 404)
})
