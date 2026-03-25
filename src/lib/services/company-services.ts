"server-only";
// src/lib/services/company-services.ts
// Company lifecycle state machine — Issue #12.
// Single source of truth for org status lookups used by access-control and middleware.

import { prisma } from "@/lib/prisma";
import { CompanyStatus, UserStatus } from "@/types/index";

/**
 * Returns the current CompanyStatus for a given organisation.
 * Returns null if the organisation does not exist.
 */
export async function getCompanyStatus(
  companyId: number,
): Promise<CompanyStatus | null> {
  const org = await prisma.organisation.findUnique({
    where: { id: companyId },
    select: { status: true },
  });

  if (!org) return null;
  // Prisma enum value strings match our TypeScript enum values
  return org.status as unknown as CompanyStatus;
}

/**
 * Returns the UserStatus for a given user.
 * Returns null if the user does not exist.
 */
export async function getUserStatus(
  userId: string,
): Promise<UserStatus | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { userStatus: true },
  });

  if (!user) return null;
  return user.userStatus as unknown as UserStatus;
}

/**
 * Full recruiter gate: checks both company status and individual user status.
 * A recruiter can only access talent features if:
 *   1. Their organisation is APPROVED
 *   2. Their own userStatus is ACTIVE
 *
 * Returns an object so callers can distinguish which check failed.
 */
export async function checkRecruiterAccess(userId: string): Promise<{
  allowed: boolean;
  reason?: "COMPANY_PENDING" | "COMPANY_SUSPENDED" | "COMPANY_BANNED" | "USER_PENDING" | "USER_SUSPENDED";
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      userStatus: true,
      organisationId: true,
      organisation: { select: { status: true } },
    },
  });

  if (!user) return { allowed: false, reason: "USER_PENDING" };

  // Check individual user status first
  if (user.userStatus === "PENDING_APPROVAL") {
    return { allowed: false, reason: "USER_PENDING" };
  }
  if (user.userStatus === "SUSPENDED") {
    return { allowed: false, reason: "USER_SUSPENDED" };
  }

  // Check company status
  const companyStatus = user.organisation?.status;
  if (companyStatus === "PENDING") {
    return { allowed: false, reason: "COMPANY_PENDING" };
  }
  if (companyStatus === "SUSPENDED") {
    return { allowed: false, reason: "COMPANY_SUSPENDED" };
  }
  if (companyStatus === "BANNED") {
    return { allowed: false, reason: "COMPANY_BANNED" };
  }

  return { allowed: true };
}
