import test from 'node:test'
import assert from 'node:assert/strict'
import type { Prisma } from '@prisma/client'
import { deductOrderMaterials } from '../src/material-stock.js'

function fixture() {
  const state = {
    paid: true, claimed: false,
    items: [{ productId: 'candle', variantId: 'large', colorId: 'pink', quantity: 3 }],
    materialDeductions: {} as Record<string, number>,
    stock: { wax: 10, wick: 10 } as Record<string, number>,
    recipes: [
      { productId: 'candle', variantId: null, colorId: null, ingredients: [{ materialId: 'wax', amount: 1 }] },
      { productId: 'candle', variantId: 'large', colorId: null, ingredients: [{ materialId: 'wax', amount: 2 }] },
      { productId: 'candle', variantId: null, colorId: 'pink', ingredients: [{ materialId: 'wax', amount: 1.5 }] },
      { productId: 'candle', variantId: 'large', colorId: 'pink', ingredients: [{ materialId: 'wax', amount: 2.5 }, { materialId: 'wick', amount: 1 }] },
    ],
  }
  const tx = {
    order: {
      updateMany: async ({ where }: { where: { materialsDeductedAt?: null } }) => {
        if (!state.paid || (where.materialsDeductedAt === null && state.claimed)) return { count: 0 }
        state.claimed = true
        return { count: 1 }
      },
      findUniqueOrThrow: async () => state,
      update: async ({ data }: { data: { materialDeductions: Record<string, number> } }) => {
        state.materialDeductions = data.materialDeductions
      },
    },
    recipe: { findMany: async () => state.recipes },
    material: { updateMany: async ({ where, data }: { where: { id: string }; data: { quantity: { decrement: number } } }) => {
      state.stock[where.id] -= data.quantity.decrement
    } },
  } as unknown as Prisma.TransactionClient
  return { state, tx }
}

test('paid orders consume exact-option recipe times quantity, only once under concurrent delivery', async () => {
  const { state, tx } = fixture()
  await Promise.all([deductOrderMaterials(tx, 'order'), deductOrderMaterials(tx, 'order')])
  assert.deepEqual(state.stock, { wax: 2.5, wick: 7 })
  assert.deepEqual(state.materialDeductions, { wax: 7.5, wick: 3 })
  await deductOrderMaterials(tx, 'order')
  assert.equal(state.stock.wax, 2.5)
})

test('recipe fallback prefers variant, then colour, then product default', async () => {
  for (const [variantId, colorId, wax] of [['large', 'white', 4], ['small', 'pink', 5.5], ['small', 'white', 7]] as const) {
    const { state, tx } = fixture()
    state.items[0] = { productId: 'candle', variantId, colorId, quantity: 3 }
    await deductOrderMaterials(tx, 'order')
    assert.equal(state.stock.wax, wax)
  }
})

test('unpaid orders and products without recipes do not consume materials', async () => {
  const { state, tx } = fixture()
  state.paid = false
  await deductOrderMaterials(tx, 'order')
  assert.equal(state.claimed, false)
  state.paid = true
  state.items[0].productId = 'no-recipe'
  await deductOrderMaterials(tx, 'order')
  assert.deepEqual(state.stock, { wax: 10, wick: 10 })
})

test('shared materials aggregate across order lines and shortages remain visible', async () => {
  const { state, tx } = fixture()
  state.items.push({ productId: 'candle', variantId: 'small', colorId: 'white', quantity: 4 })
  await deductOrderMaterials(tx, 'order')
  assert.deepEqual(state.stock, { wax: -1.5, wick: 7 })
})

test('editing restores the saved consumption even after recipe changes and removal', async () => {
  const { state, tx } = fixture()
  await deductOrderMaterials(tx, 'order')
  state.items[0].quantity = 1
  state.recipes[3].ingredients[0].amount = 3
  await deductOrderMaterials(tx, 'order', true)
  assert.deepEqual(state.stock, { wax: 7, wick: 9 })
  await deductOrderMaterials(tx, 'order', true)
  assert.deepEqual(state.stock, { wax: 7, wick: 9 })
  state.items = []
  state.recipes = []
  await deductOrderMaterials(tx, 'order', true)
  assert.deepEqual(state.stock, { wax: 10, wick: 10 })
})
