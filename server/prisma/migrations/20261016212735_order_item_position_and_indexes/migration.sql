-- DropIndex
DROP INDEX "Order_status_idx";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Order_status_paidAt_idx" ON "Order"("status", "paidAt");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "RecipeIngredient_materialId_idx" ON "RecipeIngredient"("materialId");
