ALTER TABLE "Order"
  ADD COLUMN "materialsDeductedAt" TIMESTAMP(3),
  ADD COLUMN "materialDeductions" JSONB NOT NULL DEFAULT '{}';

-- Preserve the existing stock baseline. Only pending and future orders consume
-- stock automatically; old sales may already have been accounted for manually.
UPDATE "Order" SET "materialsDeductedAt" = CURRENT_TIMESTAMP WHERE "status" <> 'pending';
