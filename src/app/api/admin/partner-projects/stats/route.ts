// src/app/api/admin/partner-projects/stats/route.ts
// Stat-card counts for the Partner Project Approvals page.
// Returns pending total, approved today, rejected today, and the number of
// distinct partner organisations with at least one approved posting.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/getServerAuthSession";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerAuthSession();
  const me = session?.user;
  const roleKeys: string[] = me?.roleKeys ?? [];
  if (!me?.id || !roleKeys.includes("ADMIN")) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [pending, approvedToday, rejectedToday, activePartnerOrgs] =
    await Promise.all([
      prisma.jobPosting.count({ where: { approvalStatus: "PENDING" } }),
      prisma.jobPosting.count({
        where: {
          approvalStatus: "APPROVED",
          reviewedAt: { gte: startOfToday },
        },
      }),
      prisma.jobPosting.count({
        where: {
          approvalStatus: "REJECTED",
          reviewedAt: { gte: startOfToday },
        },
      }),
      prisma.jobPosting
        .findMany({
          where: { approvalStatus: "APPROVED" },
          select: { organisationId: true },
          distinct: ["organisationId"],
        })
        .then((rows) => rows.length),
    ]);

  return NextResponse.json({
    pending,
    approvedToday,
    rejectedToday,
    activePartners: activePartnerOrgs,
  });
}
