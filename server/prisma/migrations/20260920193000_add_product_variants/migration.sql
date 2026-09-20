CREATE TABLE "ProductVariant" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "priceCents" INTEGER NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");
INSERT INTO "ProductVariant" ("id", "productId", "label", "priceCents", "updatedAt") VALUES
  ('purple', 'floral-box', 'Purple', 1495, CURRENT_TIMESTAMP),
  ('baby-blue', 'floral-box', 'Baby blue', 1495, CURRENT_TIMESTAMP),
  ('pink', 'floral-box', 'Pink', 1495, CURRENT_TIMESTAMP),
  ('oyster', 'coconut-beach', 'Oyster', 1495, CURRENT_TIMESTAMP),
  ('coconut', 'coconut-beach', 'Coconut', 1795, CURRENT_TIMESTAMP),
  ('shell', 'coconut-beach', 'Shell', 1795, CURRENT_TIMESTAMP),
  ('sea-star', 'coconut-beach', 'Sea star', 1795, CURRENT_TIMESTAMP);
INSERT INTO "ProductVariant" ("id", "productId", "label", "priceCents", "updatedAt") VALUES
  ('pink', 'floral-basket', 'Pink', 1295, CURRENT_TIMESTAMP),
  ('red', 'floral-basket', 'Red', 1295, CURRENT_TIMESTAMP);
