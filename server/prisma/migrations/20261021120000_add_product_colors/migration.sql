CREATE TABLE "ProductColor" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "swatch" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductColor_pkey" PRIMARY KEY ("productId", "id"),
  CONSTRAINT "ProductColor_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "OrderItem" ADD COLUMN "colorId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "colorLabel" TEXT;

-- The Natural Glow range comes in four colours. The same palette is shared by
-- every shape in the collection, so it is seeded per product.
INSERT INTO "ProductColor" ("productId", "id", "label", "swatch", "updatedAt") VALUES
  ('column', 'pink', 'Pink', '#e8a1b5', CURRENT_TIMESTAMP),
  ('column', 'purple', 'Purple', '#9b72c4', CURRENT_TIMESTAMP),
  ('column', 'brown', 'Brown', '#8a6a52', CURRENT_TIMESTAMP),
  ('column', 'baby-blue', 'Baby blue', '#9fc9e8', CURRENT_TIMESTAMP),
  ('pillar', 'pink', 'Pink', '#e8a1b5', CURRENT_TIMESTAMP),
  ('pillar', 'purple', 'Purple', '#9b72c4', CURRENT_TIMESTAMP),
  ('pillar', 'brown', 'Brown', '#8a6a52', CURRENT_TIMESTAMP),
  ('pillar', 'baby-blue', 'Baby blue', '#9fc9e8', CURRENT_TIMESTAMP),
  ('spiral', 'pink', 'Pink', '#e8a1b5', CURRENT_TIMESTAMP),
  ('spiral', 'purple', 'Purple', '#9b72c4', CURRENT_TIMESTAMP),
  ('spiral', 'brown', 'Brown', '#8a6a52', CURRENT_TIMESTAMP),
  ('spiral', 'baby-blue', 'Baby blue', '#9fc9e8', CURRENT_TIMESTAMP),
  ('shell', 'pink', 'Pink', '#e8a1b5', CURRENT_TIMESTAMP),
  ('shell', 'purple', 'Purple', '#9b72c4', CURRENT_TIMESTAMP),
  ('shell', 'brown', 'Brown', '#8a6a52', CURRENT_TIMESTAMP),
  ('shell', 'baby-blue', 'Baby blue', '#9fc9e8', CURRENT_TIMESTAMP),
  ('arch', 'pink', 'Pink', '#e8a1b5', CURRENT_TIMESTAMP),
  ('arch', 'purple', 'Purple', '#9b72c4', CURRENT_TIMESTAMP),
  ('arch', 'brown', 'Brown', '#8a6a52', CURRENT_TIMESTAMP),
  ('arch', 'baby-blue', 'Baby blue', '#9fc9e8', CURRENT_TIMESTAMP),
  ('bubble', 'pink', 'Pink', '#e8a1b5', CURRENT_TIMESTAMP),
  ('bubble', 'purple', 'Purple', '#9b72c4', CURRENT_TIMESTAMP),
  ('bubble', 'brown', 'Brown', '#8a6a52', CURRENT_TIMESTAMP),
  ('bubble', 'baby-blue', 'Baby blue', '#9fc9e8', CURRENT_TIMESTAMP)
ON CONFLICT ("productId", "id") DO UPDATE SET "label" = EXCLUDED."label", "swatch" = EXCLUDED."swatch", "updatedAt" = EXCLUDED."updatedAt";
