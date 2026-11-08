import type { Prisma } from '@prisma/client'

type MaterialUsage = Record<string, number>
type UsageLine = { productId: string; variantId: string | null; colorId: string | null; quantity: number }

// What a set of lines consumes according to the current recipes. Lines without
// a recipe, and custom items, consume nothing.
export async function recipeMaterialUsage(tx: Prisma.TransactionClient, items: UsageLine[]): Promise<MaterialUsage> {
  const recipes = await tx.recipe.findMany({
    where: { productId: { in: items.map(item => item.productId).filter(id => id !== 'custom') } },
    include: { ingredients: true },
    orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
  })
  const usage: MaterialUsage = {}
  for (const item of items) {
    if (item.productId === 'custom') continue
    // Same precedence as production-cost reporting: exact, size, colour, default.
    const recipe = recipes.filter(recipe => recipe.productId === item.productId &&
      (!recipe.variantId || recipe.variantId === item.variantId) &&
      (!recipe.colorId || recipe.colorId === item.colorId))
      .sort((a, b) => (Number(!!b.variantId) * 2 + Number(!!b.colorId)) -
        (Number(!!a.variantId) * 2 + Number(!!a.colorId)))[0]
    for (const ingredient of recipe?.ingredients ?? []) {
      usage[ingredient.materialId] = (usage[ingredient.materialId] ?? 0) + ingredient.amount * item.quantity
    }
  }
  return usage
}

// Moves stock from what was consumed before to what is consumed now.
export async function applyMaterialUsage(tx: Prisma.TransactionClient, previous: MaterialUsage, next: MaterialUsage) {
  const materialIds = [...new Set([...Object.keys(previous), ...Object.keys(next)])].sort()
  for (const materialId of materialIds) {
    const delta = Math.round(((next[materialId] ?? 0) - (previous[materialId] ?? 0)) * 1e9) / 1e9
    if (!delta) continue
    // A paid sale must be recorded even when stock is short. Negative stock
    // exposes the shortage instead of silently discarding material consumption.
    // updateMany permits reversing a snapshot whose material was later deleted.
    await tx.material.updateMany({ where: { id: materialId }, data: { quantity: { decrement: delta } } })
  }
}

// Called inside the transaction that records the sale. The conditional update
// locks the order and makes concurrent/retried payment notifications harmless.
export async function deductOrderMaterials(tx: Prisma.TransactionClient, orderId: string, replace = false) {
  const claimed = await tx.order.updateMany({
    where: { id: orderId, status: 'paid', ...(replace ? {} : { materialsDeductedAt: null }) },
    data: { materialsDeductedAt: new Date() },
  })
  if (!claimed.count) return

  const order = await tx.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { items: true, materialDeductions: true },
  })
  const deductions = await recipeMaterialUsage(tx, order.items)

  // Retain actual consumption, so editing an order can reverse its original
  // amounts even if its recipe has since changed or been deleted.
  await applyMaterialUsage(tx, order.materialDeductions as MaterialUsage, deductions)
  await tx.order.update({ where: { id: orderId }, data: { materialDeductions: deductions } })
}
