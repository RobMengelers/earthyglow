-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- Seed the initial catalog. Insert-only (ON CONFLICT DO NOTHING): once a row
-- exists, prices are managed in the database and never overwritten by this
-- migration.
INSERT INTO "Product" ("id", "name", "priceCents", "active", "updatedAt") VALUES
    ('floral-box', 'The Floral Box', 1495, true, CURRENT_TIMESTAMP),
    ('floral-basket', 'The Floral Basket', 1295, true, CURRENT_TIMESTAMP),
    ('coconut-beach', 'Coconut Beach', 1495, true, CURRENT_TIMESTAMP),
    ('autumn-ember', 'Autumn Ember', 1495, true, CURRENT_TIMESTAMP),
    ('pumpkin-spice', 'Pumpkin Spice', 1495, false, CURRENT_TIMESTAMP),
    ('pumpkin-spice-latte', 'Pumpkin Spice Latte', 995, true, CURRENT_TIMESTAMP),
    ('column', 'Column candle', 995, true, CURRENT_TIMESTAMP),
    ('pillar', 'Pillar candle', 695, true, CURRENT_TIMESTAMP),
    ('spiral', 'Spiral candle', 695, true, CURRENT_TIMESTAMP),
    ('shell', 'Shell candle', 495, true, CURRENT_TIMESTAMP),
    ('arch', 'Arch candle', 495, true, CURRENT_TIMESTAMP),
    ('bubble', 'Bubble candle', 495, true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
