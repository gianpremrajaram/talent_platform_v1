// src/app/api/recruiter/search/route.ts
// Consent-gated student search endpoint — Issue #34.
// Gold/Platinum recruiters only. Checks tier via userCanAccessFeature.

import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { userCanAccessFeature } from "@/lib/access-control";
import { searchConsentedStudents } from "@/lib/services/recruiter-search";
import { ok, err } from "@/lib/api-response";
import type { StudentSearchFilters } from "@/types/index";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerAuthSession();
  if (!session?.user) return err("UNAUTHORIZED");

  const userId = session.user.id;
  const roleKeys: string[] = session.user.roleKeys ?? [];

  // Must have RECRUITER role
  if (!roleKeys.includes("RECRUITER") && !roleKeys.includes("ADMIN")) {
    return err("FORBIDDEN");
  }

  // Gold/Platinum tier gate (ADMIN bypasses)
  if (!roleKeys.includes("ADMIN")) {
    const canSearch = await userCanAccessFeature(userId, "recruiter-search");
    if (!canSearch) {
      return err(
        "FORBIDDEN",
        "Recruiter search is available to Gold and Platinum members only.",
      );
    }
  }

  const url = new URL(req.url);
  const filters: StudentSearchFilters = {
    location: url.searchParams.get("location") ?? undefined,
    degreeProgram: url.searchParams.get("degreeProgram") ?? undefined,
    skills: url.searchParams.getAll("skills").filter(Boolean),
    cursor: url.searchParams.get("cursor") ?? undefined,
  };

  // TODO (#34 audit): log search action to AuditLog table once audit service is wired
  const results = await searchConsentedStudents(filters, userId);

  return ok(results);
}
