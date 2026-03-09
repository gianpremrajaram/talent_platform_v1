/*
  Warnings:

  - You are about to drop the column `email` on the `StudentPersonalInformation` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `StudentPersonalInformation` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `StudentPersonalInformation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StudentPersonalInformation" DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "lastName";
