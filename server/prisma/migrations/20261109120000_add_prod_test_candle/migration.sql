-- A hidden 40 cent product for testing the live checkout. Only reachable by
-- direct link; retire it with a follow-up migration once testing is done.
INSERT INTO "Product" ("id", "name", "priceCents", "active", "updatedAt") VALUES
  ('test-candle', 'Test candle', 40, true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "priceCents" = EXCLUDED."priceCents",
  "active" = EXCLUDED."active",
  "updatedAt" = EXCLUDED."updatedAt";
