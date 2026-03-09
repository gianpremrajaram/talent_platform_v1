-- CreateTable
CREATE TABLE "StudentWorkExperience" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,

    CONSTRAINT "StudentWorkExperience_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentWorkExperience_userId_idx" ON "StudentWorkExperience"("userId");

-- AddForeignKey
ALTER TABLE "StudentWorkExperience" ADD CONSTRAINT "StudentWorkExperience_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
