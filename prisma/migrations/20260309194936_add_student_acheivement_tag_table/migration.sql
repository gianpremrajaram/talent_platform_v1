-- CreateTable
CREATE TABLE "StudentAcheivementTag" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentAcheivementTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentAcheivementTag_userId_idx" ON "StudentAcheivementTag"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAcheivementTag_userId_name_key" ON "StudentAcheivementTag"("userId", "name");

-- AddForeignKey
ALTER TABLE "StudentAcheivementTag" ADD CONSTRAINT "StudentAcheivementTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
