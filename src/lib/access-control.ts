// src/lib/access-control.ts
import { prisma } from "@/lib/prisma";
import { checkRecruiterAccess } from "@/lib/services/company-services";

// ─────────────────────────────────────────────
// Feature-permission config map (single source of truth)
// Used by both server-side userCanAccessFeature() and
// client-side canAccessFeature()
// ─────────────────────────────────────────────

export type FeatureRule = {
  /** Minimum tier rank required. null = no tier requirement (role-only). */
  minTierRank: number | null;
  /** Roles that grant access regardless of tier. ADMIN is always implicit. */
  allowedRoles: string[];
};

export const FEATURE_PERMISSIONS: Record<string, FeatureRule> = {
  'recruiter-search': { minTierRank: 3, allowedRoles: [] },
  'cv-library': { minTierRank: 3, allowedRoles: [] },
  'job-board-post': { minTierRank: 3, allowedRoles: [] },
  'job-board-browse': { minTierRank: 2, allowedRoles: ['STUDENT'] },
  'student-profile': { minTierRank: null, allowedRoles: ['STUDENT'] },
  'admin-panel': { minTierRank: null, allowedRoles: ['ADMIN'] },
  // Admin Recommendation Gateway (#35)
  // Platinum-only tab that shows admin-curated recommendations for the recruiter's own firm.
  'recommended-students': { minTierRank: 4, allowedRoles: [] },
  // Proactive student search for recruiters (Silver and above), consent-scoped to own firm.
  'talent-search': { minTierRank: 2, allowedRoles: [] },
};

// ─────────────────────────────────────────────
// App-level access (existing, extended)
// ─────────────────────────────────────────────

/**
 * Role-first + tier fallback app access:
 * - ADMIN: always allow for any app.
 * - STUDENT + TALENT_DISCOVERY: role-first bypass (Q1 decision).
 * - IXN_WORKFLOW_MANAGER: allow MODULE_LEADER even without membership.
 * - Otherwise: membership-tier ALLOW rules (existing logic).
 */
export async function userCanAccessApp(userId: string, appKey: string) {
  const [user, app] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
        memberships: {
          where: { isActive: true },
          include: { membershipTier: true },
        },
      },
    }),
    prisma.app.findUnique({
      where: { key: appKey },
      include: {
        appAccessRules: {
          include: { minMembershipTier: true },
        },
      },
    }),
  ]);

  if (!user || !app) return false;

// 👇 --- 你要新增的 Issue #33 核心拦截逻辑开始 --- 👇
  // 去 AppSuspension 表里查一下，这个人在当前这个 App 里有没有正在生效的封禁记录
  const activeSuspension = await prisma.appSuspension.findFirst({
    where: {
      userId: userId,
      appKey: appKey,
      liftedAt: null, // liftedAt 为 null 代表还没被解封
    }
  });

  // 如果查到了记录，说明这人被关小黑屋了，直接一脚踢飞，返回 false！
  if (activeSuspension) {
    return false; 
  }

  const roleKeys = user.roles.map((ur) => ur.role.key);

  // 1) Role-first overrides
  if (roleKeys.includes("ADMIN")) return true;

  // STUDENT bypass for TALENT_DISCOVERY only (Q1 decision — students have
  // no Membership row, so they'd fail the tier check below)
  if (roleKeys.includes("STUDENT") && appKey === "TALENT_DISCOVERY") {
    return true;
  }

  if (appKey === "IXN_WORKFLOW_MANAGER" && roleKeys.includes("MODULE_LEADER")) {
    return true;
  }

  // (#12) Company lifecycle + individual user status gate for recruiters.
  // Blocks pending/suspended/banned company recruiters and individually pending users.
  if (roleKeys.includes("RECRUITER")) {
    const access = await checkRecruiterAccess(userId);
    if (!access.allowed) return false;
  }

  // 2) Membership-tier-based fallback (unchanged from your current policy)
  const activeMemberships = user.memberships.filter((m) => m.isActive);
  if (!activeMemberships.length) return false;

  const highest = activeMemberships.reduce((best, current) => {
    if (!best) return current;
    return current.membershipTier.rank > best.membershipTier.rank ? current : best;
  }, activeMemberships[0]);

  const userRank = highest.membershipTier.rank;
  const rules = app.appAccessRules;

  // No rules → default deny
  if (!rules.length) return false;

  const allowMatch = rules.some((rule) => {
    if (rule.accessType !== "ALLOW") return false;
    const minRank = rule.minMembershipTier?.rank;
    if (minRank == null) return false;
    return userRank >= minRank;
  });

  return allowMatch;
}

// ─────────────────────────────────────────────
// Feature-level access: server-side (DB-backed)
// ─────────────────────────────────────────────

/**
 * Server-side, DB-backed feature access check.
 * Use in server components and API routes for defence-in-depth.
 */
export async function userCanAccessFeature(
  userId: string,
  featureName: string,
): Promise<boolean> {
  const rule = FEATURE_PERMISSIONS[featureName];
  if (!rule) return false; // Unknown feature → deny

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: { include: { role: true } },
      memberships: {
        where: { isActive: true },
        include: { membershipTier: true },
      },
    },
  });

  if (!user) return false;

  const roleKeys = user.roles.map((ur) => ur.role.key);

  // ADMIN always passes
  if (roleKeys.includes("ADMIN")) return true;

  // Check allowed roles (OR logic with tier)
  const rolePasses =
    rule.allowedRoles.length > 0 &&
    rule.allowedRoles.some((r) => roleKeys.includes(r));

  // Check tier rank
  let tierPasses = false;
  if (rule.minTierRank != null) {
    const activeMemberships = user.memberships.filter((m) => m.isActive);
    if (activeMemberships.length > 0) {
      const highest = activeMemberships.reduce((best, current) => {
        if (!best) return current;
        return current.membershipTier.rank > best.membershipTier.rank
          ? current
          : best;
      }, activeMemberships[0]);
      tierPasses = highest.membershipTier.rank >= rule.minTierRank;
    }
  }

  return rolePasses || tierPasses;
}

// ─────────────────────────────────────────────
// Feature-level access: client-side (JWT session)
// ─────────────────────────────────────────────

/**
 * Client-side feature access check — reads from the JWT session.
 * Use in client components alongside TierGate. No DB round-trip.
 *
 * @param session - The NextAuth session object (with extended user fields)
 * @param featureName - Key from FEATURE_PERMISSIONS config map
 */
export function canAccessFeature(
  session: { user?: { roleKeys?: string[]; membershipTierRank?: number | null } } | null,
  featureName: string,
): boolean {
  const rule = FEATURE_PERMISSIONS[featureName];
  if (!rule) return false;

  if (!session?.user) return false;

  const roleKeys: string[] = session.user.roleKeys ?? [];
  const tierRank: number | null = session.user.membershipTierRank ?? null;

  // ADMIN always passes
  if (roleKeys.includes("ADMIN")) return true;

  // Check allowed roles
  const rolePasses =
    rule.allowedRoles.length > 0 &&
    rule.allowedRoles.some((r) => roleKeys.includes(r));

  // Check tier rank
  const tierPasses =
    rule.minTierRank != null && tierRank != null && tierRank >= rule.minTierRank;

  return rolePasses || tierPasses;
}
