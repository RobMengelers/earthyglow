-- Retire the temporary 40 cent checkout test product and its test orders. Only
-- orders made up entirely of the test product are removed; order items and the
-- coupon redemption follow through their cascades.
DELETE FROM "Order"
WHERE "id" IN (SELECT "orderId" FROM "OrderItem" WHERE "productId" = 'test-candle')
  AND NOT EXISTS (
    SELECT 1 FROM "OrderItem" other
    WHERE other."orderId" = "Order"."id" AND other."productId" <> 'test-candle'
  );

DELETE FROM "Product" WHERE "id" = 'test-candle';
