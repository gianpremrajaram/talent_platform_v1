-- CreateTable
CREATE TABLE "StudentProjects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "projectLink" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),

    CONSTRAINT "StudentProjects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentProjects_userId_idx" ON "StudentProjects"("userId");

-- AddForeignKey
ALTER TABLE "StudentProjects" ADD CONSTRAINT "StudentProjects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
