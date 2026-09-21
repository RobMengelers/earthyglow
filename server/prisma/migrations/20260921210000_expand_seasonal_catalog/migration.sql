-- Catalog additions verified against earthyglow.nl on 21 September 2026.
-- Insert-only: preserve any existing catalog prices and availability.
INSERT INTO "Product" ("id", "name", "priceCents", "active", "updatedAt") VALUES
  ('ghostlight-dinner-candle', 'Ghostlight Dinner Candle', 295, true, CURRENT_TIMESTAMP),
  ('pumpkin-boo', 'Pumpkin Boo', 895, true, CURRENT_TIMESTAMP),
  ('boo-boo', 'Boo Boo', 895, true, CURRENT_TIMESTAMP),
  ('scary-boo', 'Scary Boo', 895, true, CURRENT_TIMESTAMP),
  ('pumpkin-spice-wax-melts', 'Pumpkin Spice Wax Melts', 495, true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "ProductVariant" ("id", "productId", "label", "priceCents", "updatedAt") VALUES
  ('column-bundle', 'column', 'Bundle', 1995, CURRENT_TIMESTAMP),
  ('column-large', 'column', 'Large', 1295, CURRENT_TIMESTAMP),
  ('column-small', 'column', 'Small', 995, CURRENT_TIMESTAMP),
  ('pillar-bundle', 'pillar', 'Bundle', 2495, CURRENT_TIMESTAMP),
  ('pillar-large', 'pillar', 'Large', 1295, CURRENT_TIMESTAMP),
  ('pillar-medium', 'pillar', 'Medium', 995, CURRENT_TIMESTAMP),
  ('pillar-small', 'pillar', 'Small', 695, CURRENT_TIMESTAMP),
  ('spiral-bundle', 'spiral', 'Bundle', 2495, CURRENT_TIMESTAMP),
  ('spiral-large', 'spiral', 'Large', 1295, CURRENT_TIMESTAMP),
  ('spiral-medium', 'spiral', 'Medium', 995, CURRENT_TIMESTAMP),
  ('spiral-small', 'spiral', 'Small', 695, CURRENT_TIMESTAMP),
  ('shell-bundle', 'shell', 'Bundle', 1195, CURRENT_TIMESTAMP),
  ('shell-large', 'shell', 'Large', 895, CURRENT_TIMESTAMP),
  ('shell-small', 'shell', 'Small', 495, CURRENT_TIMESTAMP),
  ('arch-bundle', 'arch', 'Bundle', 1595, CURRENT_TIMESTAMP),
  ('arch-large', 'arch', 'Large', 895, CURRENT_TIMESTAMP),
  ('arch-medium', 'arch', 'Medium', 695, CURRENT_TIMESTAMP),
  ('arch-small', 'arch', 'Small', 495, CURRENT_TIMESTAMP),
  ('bubble-bundle', 'bubble', 'Bundle', 1595, CURRENT_TIMESTAMP),
  ('bubble-large', 'bubble', 'Large', 895, CURRENT_TIMESTAMP),
  ('bubble-medium', 'bubble', 'Medium', 695, CURRENT_TIMESTAMP),
  ('bubble-small', 'bubble', 'Small', 495, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
