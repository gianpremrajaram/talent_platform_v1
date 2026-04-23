"server-only";
// src/lib/services/recommendations.ts
// Admin Recommendation Gateway (#35) service layer.
//
// Candidate queries scope through StudentCompanyConsent via a Prisma `some`
// filter, which maps to an EXISTS/LEFT JOIN (not an INNER JOIN). Cursor-based
// pagination (fetch PAGE_SIZE + 1) so the UI scales past 1000+ students.
//
// Skill, location, and degree filters use exact case-insensitive match; no
// blind LIKE %...% fuzzy matching, per the feature plan constraint.

import { prisma } from "@/lib/prisma";
import type {
  AddRecommendationInput,
  CandidateFilters,
  PaginatedCandidates,
  RecommendationCandidate,
  RecommendationRow,
} from "@/types/index";

const PAGE_SIZE = 20;

/**
 * Create a recommendation. Idempotent: returns the existing row when an
 * active (not revoked) recommendation already exists for this (student, firm).
 * Revoked rows are never revived.
 */
export async function addRecommendation(
  input: AddRecommendationInput,
  adminId: string,
) {
  const existing = await prisma.adminRecommendation.findFirst({
    where: {
      studentId: input.studentId,
      firmId: input.firmId,
      revokedAt: null,
    },
  });
  if (existing) return existing;

  return prisma.adminRecommendation.create({
    data: {
      studentId: input.studentId,
      firmId: input.firmId,
      adminId,
    },
  });
}

/**
 * Soft-revoke a recommendation by setting revokedAt. The row is preserved
 * for the audit trail. No-op if already revoked.
 */
export async function revokeRecommendation(recommendationId: string) {
  return prisma.adminRecommendation.updateMany({
    where: { id: recommendationId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/**
 * Active recommendations for a single firm. Used by the recruiter's
 * Platinum-only "Recommended Students" tab. Revoked rows are excluded.
 */
export async function getRecommendedStudentsForFirm(
  firmId: number,
): Promise<RecommendationRow[]> {
  const rows = await prisma.adminRecommendation.findMany({
    where: {
      firmId,
      revokedAt: null,
      student: {
        studentCompanyConsents: {
          some: { companyId: firmId, consented: true },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      student: { select: { firstName: true, lastName: true, email: true } },
      firm: { select: { name: true } },
    },
  });

  return rows.map(serializeRecommendation);
}

/**
 * Full recommendation list for the admin view. Includes revoked rows so
 * admins see the audit trail. Optionally scoped to one firm.
 */
export async function getAdminRecommendationsView(
  firmId?: number,
): Promise<RecommendationRow[]> {
  const rows = await prisma.adminRecommendation.findMany({
    where: firmId != null ? { firmId } : {},
    orderBy: [{ revokedAt: "asc" }, { createdAt: "desc" }],
    include: {
      student: { select: { firstName: true, lastName: true, email: true } },
      firm: { select: { name: true } },
    },
  });

  return rows.map(serializeRecommendation);
}

/**
 * Candidate pool for admin filtering. Returns only students who consented
 * to the selected firm. Students with an active TALENT_DISCOVERY suspension
 * are excluded; userStatus must be ACTIVE.
 */
export async function getConsentedStudentsForFilter(
  filters: CandidateFilters,
): Promise<PaginatedCandidates> {
  if (!filters.firmId) {
    return { candidates: [], nextCursor: null };
  }

  // Exact-match skill conditions. ANDed across all provided skills.
  const skillConditions =
    filters.skills && filters.skills.length > 0
      ? filters.skills.map((skill) => ({
          studentSkills: {
            some: {
              name: { equals: skill, mode: "insensitive" as const },
            },
          },
        }))
      : [];

  // `has` uses the PostgreSQL array-contains operator, so each CV tag term
  // must appear verbatim in StudentCV.tags (no LIKE).
  const cvTagConditions =
    filters.cvTags && filters.cvTags.length > 0
      ? filters.cvTags.map((tag) => ({
          studentCVs: {
            some: { tags: { has: tag } },
          },
        }))
      : [];

  const andConditions = [...skillConditions, ...cvTagConditions];

  const rows = await prisma.user.findMany({
    take: PAGE_SIZE + 1,
    ...(filters.cursor
      ? { cursor: { id: filters.cursor }, skip: 1 }
      : {}),
    where: {
      userStatus: "ACTIVE",
      roles: { some: { role: { key: "STUDENT" } } },
      // Consent LEFT JOIN: only students who consented to this firm.
      studentCompanyConsents: {
        some: { companyId: filters.firmId, consented: true },
      },
      // Exclude students currently suspended/banned from the talent app.
      appSuspensions: {
        none: { appKey: "TALENT_DISCOVERY", liftedAt: null },
      },
      // Exact city/country match when provided.
      ...(filters.city || filters.country
        ? {
            studentPersonalInformation: {
              ...(filters.city
                ? { city: { equals: filters.city, mode: "insensitive" as const } }
                : {}),
              ...(filters.country
                ? { country: { equals: filters.country, mode: "insensitive" as const } }
                : {}),
            },
          }
        : {}),
      // Exact degree match when provided.
      ...(filters.degreeProgram
        ? {
            studentUniversities: {
              some: {
                degreeProgram: {
                  equals: filters.degreeProgram,
                  mode: "insensitive" as const,
                },
              },
            },
          }
        : {}),
      ...(andConditions.length > 0 ? { AND: andConditions } : {}),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      studentPersonalInformation: {
        select: { city: true, country: true },
      },
      studentUniversities: {
        select: { degreeProgram: true },
        orderBy: { startDate: "desc" },
        take: 1,
      },
      studentSkills: { select: { name: true } },
      _count: { select: { studentCVs: true } },
    },
    orderBy: { id: "asc" },
  });

  const hasMore = rows.length > PAGE_SIZE;
  const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  const candidates: RecommendationCandidate[] = page.map((u) => {
    const info = u.studentPersonalInformation;
    const location = info
      ? [info.city, info.country].filter(Boolean).join(", ") || null
      : null;
    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      degreeProgram: u.studentUniversities[0]?.degreeProgram ?? null,
      location,
      skills: u.studentSkills.map((s) => s.name),
      cvCount: u._count.studentCVs,
    };
  });

  return { candidates, nextCursor };
}

type RecommendationWithRelations = {
  id: string;
  studentId: string;
  firmId: number;
  adminId: string;
  createdAt: Date;
  revokedAt: Date | null;
  student: { firstName: string; lastName: string; email: string };
  firm: { name: string };
};

function serializeRecommendation(r: RecommendationWithRelations): RecommendationRow {
  return {
    id: r.id,
    studentId: r.studentId,
    firmId: r.firmId,
    adminId: r.adminId,
    createdAt: r.createdAt.toISOString(),
    revokedAt: r.revokedAt ? r.revokedAt.toISOString() : null,
    student: r.student,
    firm: r.firm,
  };
}
