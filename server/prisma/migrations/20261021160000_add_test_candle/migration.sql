-- A test product that costs 50 cents, used to try the checkout and the coupon
-- codes end to end. The storefront lists it in "The Scented Glow" collection.
-- Remove the row (and this migration) when the testing is done.
INSERT INTO "Product" ("id", "name", "priceCents", "active", "updatedAt") VALUES
  ('test-candle', 'Test candle', 50, true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "priceCents" = EXCLUDED."priceCents",
  "active" = EXCLUDED."active",
  "updatedAt" = EXCLUDED."updatedAt";
