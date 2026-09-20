CREATE TYPE "FulfillmentStatus" AS ENUM ('open', 'processed');
ALTER TABLE "Order" ADD COLUMN "fulfillmentStatus" "FulfillmentStatus" NOT NULL DEFAULT 'open';
ALTER TABLE "Order" ADD COLUMN "carrier" TEXT;
ALTER TABLE "Order" ADD COLUMN "trackingCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "fulfilledAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "fulfillmentEmailSentAt" TIMESTAMP(3);
