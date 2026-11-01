-- Keep historical order lines intact while removing the separate listing.
UPDATE "Product" SET "active" = false, "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'christmas-tree-dinner-candle-bundle';

-- Colour and the fixed mixed bundle are now a single option choice.
DELETE FROM "ProductColor" WHERE "productId" = 'christmas-tree-dinner-candle';

INSERT INTO "ProductVariant" ("id", "productId", "label", "priceCents", "updatedAt") VALUES
  ('christmas-tree-white', 'christmas-tree-dinner-candle', 'White', 295, CURRENT_TIMESTAMP),
  ('christmas-tree-pink', 'christmas-tree-dinner-candle', 'Pink', 295, CURRENT_TIMESTAMP),
  ('christmas-tree-red', 'christmas-tree-dinner-candle', 'Red', 295, CURRENT_TIMESTAMP),
  ('christmas-tree-bundle', 'christmas-tree-dinner-candle', 'Bundle (3 colours)', 885, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "label" = EXCLUDED."label", "priceCents" = EXCLUDED."priceCents",
  "active" = true, "updatedAt" = EXCLUDED."updatedAt";
