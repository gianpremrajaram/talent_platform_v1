-- Migration: add_user_status_org_domain
-- Adds UserStatus enum + User.userStatus field.
-- Adds Organisation.domain (unique, non-nullable) with '' default for existing rows,
-- so existing dummy data stays intact. Seed.ts will be updated to set real domains.

-- 1) Create UserStatus enum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED');

-- 2) Add userStatus to User with default so existing rows get ACTIVE
ALTER TABLE "User" ADD COLUMN "userStatus" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- 3) Add domain to Organisation
--    Step A: add nullable first so existing rows don't violate NOT NULL
ALTER TABLE "Organisation" ADD COLUMN "domain" TEXT;

--    Step B: backfill existing rows using slug as placeholder (slug is already unique)
--    Real domains will be set via seed.ts. Format: "legacy.<slug>.placeholder"
UPDATE "Organisation" SET "domain" = 'legacy.' || "slug" || '.placeholder' WHERE "domain" IS NULL;

--    Step C: tighten to NOT NULL
ALTER TABLE "Organisation" ALTER COLUMN "domain" SET NOT NULL;

--    Step D: add unique constraint
CREATE UNIQUE INDEX "Organisation_domain_key" ON "Organisation"("domain");
