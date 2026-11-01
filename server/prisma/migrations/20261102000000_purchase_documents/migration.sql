CREATE TABLE "PurchaseDocument" (
  "id" TEXT NOT NULL,
  "purchaseId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "mime" TEXT NOT NULL,
  "bytes" BYTEA NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PurchaseDocument_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PurchaseDocument_purchaseId_fkey" FOREIGN KEY ("purchaseId")
    REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "PurchaseDocument_purchaseId_idx" ON "PurchaseDocument"("purchaseId");

-- Preserve every existing attachment before removing the single-file columns.
INSERT INTO "PurchaseDocument" ("id", "purchaseId", "name", "mime", "bytes", "createdAt")
SELECT "id", "id", COALESCE("documentName", 'document'),
       COALESCE("documentMime", 'application/octet-stream'), "documentBytes", "createdAt"
FROM "Purchase" WHERE "documentBytes" IS NOT NULL;

ALTER TABLE "Purchase" DROP COLUMN "documentName",
  DROP COLUMN "documentMime", DROP COLUMN "documentBytes";
