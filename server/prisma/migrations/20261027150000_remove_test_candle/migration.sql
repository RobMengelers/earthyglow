-- Retire the temporary checkout test product while preserving migration history.
DELETE FROM "Product" WHERE "id" = 'test-candle';
