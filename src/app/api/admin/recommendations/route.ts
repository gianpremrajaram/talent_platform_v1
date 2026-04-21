// src/app/api/admin/recommendations/route.ts
// Admin Recommendation Gateway (#35): add + list endpoints.
// POST /api/admin/recommendations          ADMIN only, create a recommendation.
// GET  /api/admin/recommendations?firmId=  ADMIN only, list (optional firm filter).

import { NextResponse, type NextRequest } from "next/server";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import {
  addRecommendation,
  getAdminRecommendationsView,
} from "@/lib/services/recommendations";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  const me = session?.user;
  const roleKeys: string[] = me?.roleKeys ?? [];
  if (!me?.id || !roleKeys.includes("ADMIN")) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const studentId = typeof body?.studentId === "string" ? body.studentId : null;
  const firmId = typeof body?.firmId === "number" ? body.firmId : null;
  if (!studentId || firmId == null) {
    return NextResponse.json(
      { error: "studentId and firmId are required." },
      { status: 400 },
    );
  }

  const created = await addRecommendation({ studentId, firmId }, me.id);
  return NextResponse.json({ id: created.id }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerAuthSession();
  const me = session?.user;
  const roleKeys: string[] = me?.roleKeys ?? [];
  if (!me?.id || !roleKeys.includes("ADMIN")) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const firmIdParam = req.nextUrl.searchParams.get("firmId");
  const firmId = firmIdParam ? Number(firmIdParam) : undefined;
  if (firmIdParam && Number.isNaN(firmId)) {
    return NextResponse.json({ error: "firmId must be a number." }, { status: 400 });
  }

  const rows = await getAdminRecommendationsView(firmId);
  return NextResponse.json(rows);
}
