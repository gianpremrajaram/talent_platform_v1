-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED', 'BANNED');

-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "status" "CompanyStatus" NOT NULL DEFAULT 'APPROVED';

-- CreateTable
CREATE TABLE "StudentCompanyConsent" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "consented" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentCompanyConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "organisationId" INTEGER NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "salaryBand" TEXT,
    "roleType" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminRecommendation" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "firmId" INTEGER NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "AdminRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSuspension" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "appKey" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "suspendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "liftedAt" TIMESTAMP(3),

    CONSTRAINT "AppSuspension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentCV" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentCV_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentCompanyConsent_companyId_idx" ON "StudentCompanyConsent"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentCompanyConsent_studentId_companyId_key" ON "StudentCompanyConsent"("studentId", "companyId");

-- CreateIndex
CREATE INDEX "JobPosting_organisationId_idx" ON "JobPosting"("organisationId");

-- CreateIndex
CREATE INDEX "JobPosting_createdByUserId_idx" ON "JobPosting"("createdByUserId");

-- CreateIndex
CREATE INDEX "JobPosting_isActive_postedAt_idx" ON "JobPosting"("isActive", "postedAt");

-- CreateIndex
CREATE INDEX "AdminRecommendation_firmId_revokedAt_idx" ON "AdminRecommendation"("firmId", "revokedAt");

-- CreateIndex
CREATE INDEX "AdminRecommendation_studentId_idx" ON "AdminRecommendation"("studentId");

-- CreateIndex
CREATE INDEX "AdminRecommendation_adminId_idx" ON "AdminRecommendation"("adminId");

-- CreateIndex
CREATE INDEX "AppSuspension_userId_appKey_idx" ON "AppSuspension"("userId", "appKey");

-- CreateIndex
CREATE INDEX "StudentCV_userId_idx" ON "StudentCV"("userId");

-- AddForeignKey
ALTER TABLE "StudentCompanyConsent" ADD CONSTRAINT "StudentCompanyConsent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCompanyConsent" ADD CONSTRAINT "StudentCompanyConsent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminRecommendation" ADD CONSTRAINT "AdminRecommendation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminRecommendation" ADD CONSTRAINT "AdminRecommendation_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminRecommendation" ADD CONSTRAINT "AdminRecommendation_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppSuspension" ADD CONSTRAINT "AppSuspension_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCV" ADD CONSTRAINT "StudentCV_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
