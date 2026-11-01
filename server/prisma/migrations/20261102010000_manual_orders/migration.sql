ALTER TABLE "Order" ADD COLUMN "isManual" BOOLEAN NOT NULL DEFAULT false;
UPDATE "Order" SET "isManual" = true WHERE "status" = 'paid' AND "molliePaymentId" IS NULL AND "paymentMethod" IS NULL;
