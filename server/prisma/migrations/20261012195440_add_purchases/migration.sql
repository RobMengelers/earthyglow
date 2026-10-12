-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "dateBought" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "costCents" INTEGER NOT NULL,
    "documentName" TEXT,
    "documentMime" TEXT,
    "documentBytes" BYTEA,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Purchase_dateBought_idx" ON "Purchase"("dateBought");
