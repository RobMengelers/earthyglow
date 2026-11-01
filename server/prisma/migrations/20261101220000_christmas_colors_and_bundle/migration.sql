-- Fixed three-colour bundle: no colour or size options.
INSERT INTO "Product" ("id", "name", "priceCents", "active", "updatedAt") VALUES
  ('christmas-tree-dinner-candle-bundle', 'Christmas Tree Dinner Candle Bundle', 885, true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "ProductColor" ("productId", "id", "label", "swatch", "updatedAt") VALUES
  ('christmas-tree-dinner-candle', 'white', 'White', '#f0ebe1', CURRENT_TIMESTAMP),
  ('christmas-tree-dinner-candle', 'pink', 'Pink', '#e8a1b5', CURRENT_TIMESTAMP),
  ('christmas-tree-dinner-candle', 'red', 'Red', '#a71930', CURRENT_TIMESTAMP),
  ('christmas-bubble-candle', 'green', 'Green', '#51865a', CURRENT_TIMESTAMP),
  ('christmas-bubble-candle', 'red', 'Red', '#a71930', CURRENT_TIMESTAMP)
ON CONFLICT ("productId", "id") DO UPDATE SET
  "label" = EXCLUDED."label",
  "swatch" = EXCLUDED."swatch",
  "updatedAt" = EXCLUDED."updatedAt";
