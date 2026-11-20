-- The Winter Wonderland Candle is sold out: stop it from being ordered.
UPDATE "Product" SET "active" = false, "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'winter-wonderland-candle';
