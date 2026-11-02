ALTER TABLE "Recipe" ADD COLUMN "variantId" TEXT, ADD COLUMN "colorId" TEXT;
CREATE UNIQUE INDEX "Recipe_option_unique" ON "Recipe" ("productId", COALESCE("variantId", ''), COALESCE("colorId", '')) WHERE "variantId" IS NOT NULL OR "colorId" IS NOT NULL;
