import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { PrismaClient } from '@prisma/client'
import { deductOrderMaterials } from '../src/material-stock.js'

// Point this explicitly at a migrated, disposable PostgreSQL database.
const url = process.env.MATERIAL_STOCK_TEST_DATABASE_URL

test('PostgreSQL: payment concurrency, separate orders, edits and rollback keep stock consistent', { skip: !url }, async () => {
  const db = new PrismaClient({ datasources: { db: { url } } })
  const productId = `stock-test-${randomUUID()}`
  const materialId = randomUUID()
  const customerId = randomUUID()
  const orderIds: string[] = []
  try {
    await db.product.create({ data: { id: productId, name: 'Stock test', priceCents: 100 } })
    await db.material.create({ data: { id: materialId, name: 'Test wax', unit: 'kg', quantity: 10 } })
    await db.recipe.create({ data: { productId, ingredients: { create: { materialId, amount: 0.25 } } } })
    await db.customer.create({ data: { id: customerId, firstName: 'Test', lastName: 'Stock' } })
    for (let i = 0; i < 3; i++) {
      const order = await db.order.create({ data: {
        orderNumber: randomUUID(), customerId, subtotalCents: 200, shippingCents: 0, totalCents: 200,
        address: '', postalCode: '', city: '', country: '',
        items: { create: { productId, name: 'Stock test', quantity: 2, unitPriceCents: 100, lineTotalCents: 200 } },
      } })
      orderIds.push(order.id)
    }
    const pay = (id: string) => db.$transaction(async tx => {
      await tx.order.update({ where: { id }, data: { status: 'paid', paidAt: new Date() } })
      await deductOrderMaterials(tx, id)
    })
    const stock = async () => (await db.material.findUniqueOrThrow({ where: { id: materialId } })).quantity
    await Promise.all([pay(orderIds[0]), pay(orderIds[0]), pay(orderIds[1])])
    assert.equal(await stock(), 9)

    await assert.rejects(db.$transaction(async tx => {
      await tx.order.update({ where: { id: orderIds[2] }, data: { status: 'paid' } })
      await deductOrderMaterials(tx, orderIds[2])
      throw new Error('Injected failure after deduction')
    }), /Injected failure/)
    assert.equal(await stock(), 9)
    const rolledBack = await db.order.findUniqueOrThrow({ where: { id: orderIds[2] } })
    assert.equal(rolledBack.status, 'pending')
    assert.equal(rolledBack.materialsDeductedAt, null)
    await pay(orderIds[2])
    assert.equal(await stock(), 8.5)

    await db.$transaction(async tx => {
      await tx.order.update({ where: { id: orderIds[0] }, data: { items: { updateMany: { where: {}, data: { quantity: 4 } } } } })
      await deductOrderMaterials(tx, orderIds[0], true)
    })
    assert.equal(await stock(), 8)
    await pay(orderIds[0])
    assert.equal(await stock(), 8)
  } finally {
    await db.order.deleteMany({ where: { customerId } })
    await db.customer.deleteMany({ where: { id: customerId } })
    await db.product.deleteMany({ where: { id: productId } })
    await db.material.deleteMany({ where: { id: materialId } })
    await db.$disconnect()
  }
})
