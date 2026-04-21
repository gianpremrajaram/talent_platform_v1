// src/app/api/admin/recommendations/candidates/route.ts
// Admin Recommendation Gateway (#35): candidate filter panel.
//
// GET /api/admin/recommendations/candidates
//   ?firmId=&city=&country=&degreeProgram=&skills=a,b&cvTags=x,y&cursor=...
//
// Access:
//   ADMIN may query any firmId (dual-proxy: shortlisting on behalf of the firm).
//   RECRUITER (Silver and above) may only query their own firm. firmId is
//   overridden server-side with their organisationId to prevent scope leakage.
//   This is the shared endpoint used by the proactive Talent Search feature
//   for Silver, Gold, and Platinum recruiters.

import { NextResponse, type NextRequest } from "next/server";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { prisma } from "@/lib/prisma";
import { userCanAccessFeature } from "@/lib/access-control";
import { getConsentedStudentsForFilter } from "@/lib/services/recommendations";
import type { CandidateFilters } from "@/types/index";

export const dynamic = "force-dynamic";

function parseCsv(value: string | null): string[] | undefined {
  if (!value) return undefined;
  const parts = value
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : undefined;
}

export async function GET(req: NextRequest) {
  const session = await getServerAuthSession();
  const me = session?.user;
  const roleKeys: string[] = me?.roleKeys ?? [];
  if (!me?.id) {
    return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  }

  const isAdmin = roleKeys.includes("ADMIN");
  const isRecruiter = roleKeys.includes("RECRUITER");

  // Recruiters need talent-search permission (Silver+).
  if (!isAdmin) {
    if (!isRecruiter) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    const allowed = await userCanAccessFeature(me.id, "talent-search");
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
  }

  const sp = req.nextUrl.searchParams;
  const requestedFirmIdRaw = sp.get("firmId");
  const requestedFirmId = requestedFirmIdRaw ? Number(requestedFirmIdRaw) : NaN;

  let firmId: number;
  if (isAdmin) {
    if (!requestedFirmIdRaw || Number.isNaN(requestedFirmId)) {
      return NextResponse.json(
        { error: "firmId is required." },
        { status: 400 },
      );
    }
    firmId = requestedFirmId;
  } else {
    // Recruiter: force-scope to their own firm; ignore any provided firmId.
    const recruiter = await prisma.user.findUnique({
      where: { id: me.id },
      select: { organisationId: true },
    });
    if (!recruiter?.organisationId) {
      return NextResponse.json(
        { error: "Recruiter has no organisation." },
        { status: 403 },
      );
    }
    firmId = recruiter.organisationId;
  }

  const filters: CandidateFilters = {
    firmId,
    city: sp.get("city") ?? undefined,
    country: sp.get("country") ?? undefined,
    degreeProgram: sp.get("degreeProgram") ?? undefined,
    skills: parseCsv(sp.get("skills")),
    cvTags: parseCsv(sp.get("cvTags")),
    cursor: sp.get("cursor") ?? undefined,
  };

  const result = await getConsentedStudentsForFilter(filters);
  return NextResponse.json(result);
}
