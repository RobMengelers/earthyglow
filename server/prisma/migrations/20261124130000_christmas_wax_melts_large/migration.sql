-- The Christmas wax melts now come in two sizes: the existing 7 x 7 cm box
-- (Small) and a 10 x 10 cm box with double the melts (Large).
INSERT INTO "ProductVariant" ("id", "productId", "label", "priceCents", "updatedAt") VALUES
  ('sweet-christmas-wax-melts-small', 'sweet-christmas-wax-melts', 'Small', 295, CURRENT_TIMESTAMP),
  ('sweet-christmas-wax-melts-large', 'sweet-christmas-wax-melts', 'Large', 495, CURRENT_TIMESTAMP),
  ('white-christmas-wax-melts-small', 'white-christmas-wax-melts', 'Small', 295, CURRENT_TIMESTAMP),
  ('white-christmas-wax-melts-large', 'white-christmas-wax-melts', 'Large', 495, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "label" = EXCLUDED."label", "priceCents" = EXCLUDED."priceCents",
  "active" = true, "updatedAt" = EXCLUDED."updatedAt";
