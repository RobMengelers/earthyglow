-- Lets the admin tick off each order line once it is prepared.
ALTER TABLE "OrderItem" ADD COLUMN "checked" BOOLEAN NOT NULL DEFAULT false;
