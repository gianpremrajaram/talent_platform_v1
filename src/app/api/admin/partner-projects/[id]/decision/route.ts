// src/app/api/admin/partner-projects/[id]/decision/route.ts
// Admin approve/reject decision on a JobPosting. ADMIN only.
// Body: { decision: "APPROVED" | "REJECTED" }. Idempotent: re-applying the
// same decision just refreshes reviewedAt/reviewedById.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/getServerAuthSession";

export const dynamic = "force-dynamic";

type Decision = "APPROVED" | "REJECTED";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerAuthSession();
  const me = session?.user;
  const roleKeys: string[] = me?.roleKeys ?? [];
  if (!me?.id || !roleKeys.includes("ADMIN")) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { decision?: string };
  const decision = body.decision?.toUpperCase();
  if (decision !== "APPROVED" && decision !== "REJECTED") {
    return NextResponse.json(
      { error: "decision must be APPROVED or REJECTED." },
      { status: 400 },
    );
  }

  const updated = await prisma.jobPosting.update({
    where: { id },
    data: {
      approvalStatus: decision as Decision,
      reviewedAt: new Date(),
      reviewedById: me.id,
    },
    select: { id: true, approvalStatus: true },
  });

  return NextResponse.json({
    id: updated.id,
    status: updated.approvalStatus.toLowerCase(),
  });
}
