-- White is the basic Natural Glow candle: the plain candle, without a colour
-- poured into it. It keeps the neutral photography, the other colours bring
-- their own pictures.
INSERT INTO "ProductColor" ("productId", "id", "label", "swatch", "updatedAt") VALUES
  ('column', 'white', 'White', '#f0ebe1', CURRENT_TIMESTAMP),
  ('pillar', 'white', 'White', '#f0ebe1', CURRENT_TIMESTAMP),
  ('spiral', 'white', 'White', '#f0ebe1', CURRENT_TIMESTAMP),
  ('shell', 'white', 'White', '#f0ebe1', CURRENT_TIMESTAMP),
  ('arch', 'white', 'White', '#f0ebe1', CURRENT_TIMESTAMP),
  ('bubble', 'white', 'White', '#f0ebe1', CURRENT_TIMESTAMP)
ON CONFLICT ("productId", "id") DO UPDATE SET
  "label" = EXCLUDED."label",
  "swatch" = EXCLUDED."swatch",
  "updatedAt" = EXCLUDED."updatedAt";
