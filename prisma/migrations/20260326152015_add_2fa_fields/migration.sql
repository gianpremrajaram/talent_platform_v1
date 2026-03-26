-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twofa" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twofaSecret" TEXT,
ADD COLUMN     "twofaTempSecret" TEXT;
