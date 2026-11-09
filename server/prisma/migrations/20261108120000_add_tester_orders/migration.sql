-- Products used for testing or filming: they consume materials but are not sales.
CREATE TABLE "TesterOrder" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL,
    "materialDeductions" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TesterOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TesterOrderItem" (
    "id" TEXT NOT NULL,
    "testerOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variantId" TEXT,
    "variantLabel" TEXT,
    "colorId" TEXT,
    "colorLabel" TEXT,
    "quantity" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TesterOrderItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TesterOrder_usedAt_idx" ON "TesterOrder"("usedAt");
CREATE INDEX "TesterOrderItem_testerOrderId_idx" ON "TesterOrderItem"("testerOrderId");

ALTER TABLE "TesterOrderItem" ADD CONSTRAINT "TesterOrderItem_testerOrderId_fkey" FOREIGN KEY ("testerOrderId") REFERENCES "TesterOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
