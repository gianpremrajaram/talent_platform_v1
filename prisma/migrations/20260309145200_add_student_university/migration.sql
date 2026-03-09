-- CreateTable
CREATE TABLE "StudentUniversity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "universityName" TEXT NOT NULL,
    "fieldOfStudy" TEXT NOT NULL,
    "grade" TEXT,
    "degreeProgram" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentUniversity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentUniversity_userId_idx" ON "StudentUniversity"("userId");

-- AddForeignKey
ALTER TABLE "StudentUniversity" ADD CONSTRAINT "StudentUniversity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
