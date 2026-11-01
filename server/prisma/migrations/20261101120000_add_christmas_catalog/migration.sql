-- Christmas 2026 catalog additions. Insert-only: preserve any existing
-- catalog prices and availability managed through the admin portal.
INSERT INTO "Product" ("id", "name", "priceCents", "active", "updatedAt") VALUES
  ('festive-glow-box', 'The Festive Glow Box', 1495, true, CURRENT_TIMESTAMP),
  ('hot-cocoa', 'Hot Cocoa', 995, true, CURRENT_TIMESTAMP),
  ('gluhwein', 'Gluhwein', 995, true, CURRENT_TIMESTAMP),
  ('winter-wonderland-candle', 'Winter Wonderland Candle', 1495, true, CURRENT_TIMESTAMP),
  ('christmas-bubble-candle', 'Christmas Bubble Candle', 695, true, CURRENT_TIMESTAMP),
  ('christmas-tree-dinner-candle', 'Christmas Tree Dinner Candle', 295, true, CURRENT_TIMESTAMP),
  ('twisted-tree-candle', 'Twisted Tree Candle', 1295, true, CURRENT_TIMESTAMP),
  ('sweet-christmas-wax-melts', 'Sweet Christmas Wax Melts', 295, true, CURRENT_TIMESTAMP),
  ('white-christmas-wax-melts', 'White Christmas Wax Melts', 295, true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- The Twisted Tree Candle uses the Natural Glow colour palette, where white is
-- the basic candle with the neutral photography.
INSERT INTO "ProductColor" ("productId", "id", "label", "swatch", "updatedAt") VALUES
  ('twisted-tree-candle', 'white', 'White', '#f0ebe1', CURRENT_TIMESTAMP),
  ('twisted-tree-candle', 'pink', 'Pink', '#e8a1b5', CURRENT_TIMESTAMP),
  ('twisted-tree-candle', 'red', 'Red', '#c94c55', CURRENT_TIMESTAMP)
ON CONFLICT ("productId", "id") DO UPDATE SET
  "label" = EXCLUDED."label",
  "swatch" = EXCLUDED."swatch",
  "updatedAt" = EXCLUDED."updatedAt";
