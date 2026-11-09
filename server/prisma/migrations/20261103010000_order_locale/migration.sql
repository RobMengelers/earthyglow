-- The language the customer shopped in. It picks the language of their emails
-- and invoice. Orders from before the shop had languages were all English.
ALTER TABLE "Order" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en';
