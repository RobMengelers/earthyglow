-- AlterTable
-- Nullable so in-person sales can be recorded without contact details. A unique
-- index permits many NULLs, so walk-in customers no longer collide on a
-- placeholder value.
ALTER TABLE "Customer" ALTER COLUMN "email" DROP NOT NULL;
