// src/app/api/recruiter/recommended-students/route.ts
// Admin Recommendation Gateway (#35): recruiter-facing view.
// GET /api/recruiter/recommended-students
//
// Returns active (non-revoked) AdminRecommendation rows for the recruiter's
// own organisation only. firmId is resolved from the server session, never
// from the client, so cross-firm visibility is not possible.
//
// Access: RECRUITER role at Platinum tier (rank 4). Admins may also call it.

import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { prisma } from "@/lib/prisma";
import { userCanAccessFeature } from "@/lib/access-control";
import { getRecommendedStudentsForFirm } from "@/lib/services/recommendations";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerAuthSession();
  const me = session?.user;
  const roleKeys: string[] = me?.roleKeys ?? [];

  if (!me?.id) {
    return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  }

  const isAdmin = roleKeys.includes("ADMIN");
  const isRecruiter = roleKeys.includes("RECRUITER");

  if (!isAdmin && !isRecruiter) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // Platinum gate for recruiters; admin bypasses.
  if (!isAdmin) {
    const allowed = await userCanAccessFeature(me.id, "recommended-students");
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
  }

  const recruiter = await prisma.user.findUnique({
    where: { id: me.id },
    select: { organisationId: true },
  });

  if (!recruiter?.organisationId) {
    return NextResponse.json(
      { error: "Recruiter has no organisation linked." },
      { status: 403 },
    );
  }

  const rows = await getRecommendedStudentsForFirm(recruiter.organisationId);
  return NextResponse.json(rows);
}
