CREATE TABLE "CompanyDocument" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "mime" TEXT NOT NULL,
  "bytes" BYTEA NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "storedBytes" INTEGER NOT NULL,
  "compressed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CompanyDocument_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CompanyDocument_createdAt_idx" ON "CompanyDocument"("createdAt");
