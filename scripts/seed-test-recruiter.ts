#!/usr/bin/env ts-node
// scripts/seed-test-recruiter.ts
// Idempotent test fixture for Issue #28 E2E testing.
// Creates a test recruiter with an APPROVED org and active Gold membership,
// bypassing the admin approval flow which currently strips the RECRUITER role
// (pending fix tracked separately — see #27).
//
// Run: npx ts-node scripts/seed-test-recruiter.ts
//
// Credentials created:
//   Email:    test-recruiter@test-company.example.com
//   Password: TestRecruiter123!
//   Tier:     Gold (rank 3)

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TEST_EMAIL = "test-recruiter@test-company.example.com";
const TEST_PASSWORD = "TestRecruiter123!";
const TEST_ORG_SLUG = "test-company-scaffold";
const TEST_ORG_DOMAIN = "test-company.example.com";

async function main() {
  // 1) Upsert organisation (APPROVED)
  let org = await prisma.organisation.findUnique({ where: { slug: TEST_ORG_SLUG } });
  if (!org) {
    org = await prisma.organisation.create({
      data: {
        name: "Test Company",
        slug: TEST_ORG_SLUG,
        domain: TEST_ORG_DOMAIN,
        type: "INDUSTRY",
        status: "APPROVED",
      },
    });
    console.log(`Created org: ${org.name} (id=${org.id})`);
  } else {
    if (org.status !== "APPROVED") {
      await prisma.organisation.update({ where: { id: org.id }, data: { status: "APPROVED" } });
      console.log(`Updated org status to APPROVED: ${org.name}`);
    } else {
      console.log(`Org exists: ${org.name} (id=${org.id})`);
    }
  }

  // 2) Verify prerequisites seeded
  const recruiterRole = await prisma.role.findUnique({ where: { key: "RECRUITER" } });
  if (!recruiterRole) throw new Error("RECRUITER role not seeded — run: npx prisma db seed");

  const goldTier = await prisma.membershipTier.findFirst({ where: { rank: 3 } });
  if (!goldTier) throw new Error("Gold tier not seeded (rank=3) — run: npx prisma db seed");

  // 3) Upsert user
  let user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  if (!user) {
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);
    user = await prisma.user.create({
      data: {
        email: TEST_EMAIL,
        firstName: "Test",
        lastName: "Recruiter",
        passwordHash,
        userStatus: "ACTIVE",
        organisationId: org.id,
        roles: { create: { roleId: recruiterRole.id } },
      },
    });
    console.log(`Created user: ${user.email} (id=${user.id})`);
  } else {
    // Ensure ACTIVE + correct org
    await prisma.user.update({
      where: { id: user.id },
      data: { userStatus: "ACTIVE", organisationId: org.id },
    });
    // Ensure RECRUITER role assigned
    const hasRole = await prisma.userRole.findFirst({
      where: { userId: user.id, roleId: recruiterRole.id },
    });
    if (!hasRole) {
      await prisma.userRole.create({ data: { userId: user.id, roleId: recruiterRole.id } });
      console.log(`Assigned RECRUITER role to existing user: ${user.email}`);
    } else {
      console.log(`User exists: ${user.email} (id=${user.id})`);
    }
  }

  // 4) Upsert Gold membership
  const existingMembership = await prisma.membership.findFirst({
    where: { userId: user.id, isActive: true },
  });
  if (!existingMembership) {
    await prisma.membership.create({
      data: {
        userId: user.id,
        organisationId: org.id,
        membershipTierId: goldTier.id,
        isActive: true,
        status: "active",
      },
    });
    console.log(`Created Gold membership for ${user.email}`);
  } else {
    console.log(`Membership exists for ${user.email} (tier id=${existingMembership.membershipTierId})`);
  }

  console.log("\nTest recruiter ready:");
  console.log(`  Email:    ${TEST_EMAIL}`);
  console.log(`  Password: ${TEST_PASSWORD}`);
  console.log(`  Org:      Test Company (APPROVED)`);
  console.log(`  Tier:     Gold`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
