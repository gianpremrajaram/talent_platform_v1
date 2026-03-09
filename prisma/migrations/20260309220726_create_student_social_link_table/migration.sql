-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('LINKEDIN', 'FACEBOOK', 'GITHUB', 'TWITTER');

-- CreateTable
CREATE TABLE "StudentSocialLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentSocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentSocialLink_userId_idx" ON "StudentSocialLink"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSocialLink_userId_platform_key" ON "StudentSocialLink"("userId", "platform");

-- AddForeignKey
ALTER TABLE "StudentSocialLink" ADD CONSTRAINT "StudentSocialLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
