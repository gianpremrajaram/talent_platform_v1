"server-only";
// src/lib/services/recruiter-search.ts
// Consent-gated student search for Gold/Platinum recruiters — Issue #34.
// Only students who have consented to the recruiter's organisation are returned.

import { prisma } from "@/lib/prisma";
import type {
  StudentSearchFilters,
  PaginatedStudentResults,
  StudentSearchResult,
} from "@/types/index";

const PAGE_SIZE = 10;

/**
 * Search for students who have consented to the recruiter's company.
 * Filters: location (ILIKE), degreeProgram (ILIKE), skills (any match, ILIKE).
 * Pagination: cursor-based, PAGE_SIZE results per call.
 *
 * @param filters   - Search parameters from the UI
 * @param recruiterId - ID of the recruiter performing the search
 */
export async function searchConsentedStudents(
  filters: StudentSearchFilters,
  recruiterId: string,
): Promise<PaginatedStudentResults> {
  // Look up the recruiter's organisation
  const recruiter = await prisma.user.findUnique({
    where: { id: recruiterId },
    select: { organisationId: true },
  });

  if (!recruiter?.organisationId) {
    return { students: [], nextCursor: null };
  }

  const orgId = recruiter.organisationId;

  // Build skill filter conditions — each skill term is an OR match
  const skillConditions =
    filters.skills && filters.skills.length > 0
      ? filters.skills.map((skill) => ({
          studentSkills: {
            some: {
              name: { contains: skill, mode: "insensitive" as const },
            },
          },
        }))
      : [];

  const results = await prisma.user.findMany({
    take: PAGE_SIZE + 1, // fetch one extra to know if there's a next page
    ...(filters.cursor
      ? { cursor: { id: filters.cursor }, skip: 1 }
      : {}),
    where: {
      // Must have STUDENT role
      roles: {
        some: {
          role: { key: "STUDENT" },
        },
      },
      // Must have consented to THIS recruiter's company
      studentCompanyConsents: {
        some: {
          companyId: orgId,
          consented: true,
        },
      },
      // Location filter — matches city, state, country, or address fields
      ...(filters.location
        ? {
            studentPersonalInformation: {
              OR: [
                { city: { contains: filters.location, mode: "insensitive" } },
                { state: { contains: filters.location, mode: "insensitive" } },
                { country: { contains: filters.location, mode: "insensitive" } },
              ],
            },
          }
        : {}),
      // Degree program filter
      ...(filters.degreeProgram
        ? {
            studentUniversities: {
              some: {
                degreeProgram: {
                  contains: filters.degreeProgram,
                  mode: "insensitive",
                },
              },
            },
          }
        : {}),
      // Skills filter — AND across all provided skill terms
      ...(skillConditions.length > 0 ? { AND: skillConditions } : {}),
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
      studentSkills: {
        select: { name: true },
      },
    },
    orderBy: { id: "asc" },
  });

  const hasMore = results.length > PAGE_SIZE;
  const page = hasMore ? results.slice(0, PAGE_SIZE) : results;
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  const students: StudentSearchResult[] = page.map((u) => {
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
    };
  });

  return { students, nextCursor };
}
