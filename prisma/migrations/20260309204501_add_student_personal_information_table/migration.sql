-- CreateTable
CREATE TABLE "StudentPersonalInformation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "phoneCode" TEXT,
    "phoneNumber" TEXT,
    "designation" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentPersonalInformation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentPersonalInformation_userId_key" ON "StudentPersonalInformation"("userId");

-- CreateIndex
CREATE INDEX "StudentPersonalInformation_userId_idx" ON "StudentPersonalInformation"("userId");

-- AddForeignKey
ALTER TABLE "StudentPersonalInformation" ADD CONSTRAINT "StudentPersonalInformation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
