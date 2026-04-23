// src/app/api/admin/partner-projects/stats/route.ts
// Stat-card counts for the All Job Postings admin page.

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

  const now = new Date();

  const [totalJobs, activeJobs, expiredJobs, activePartnerOrgs] = await Promise.all([
    prisma.jobPosting.count(),
    prisma.jobPosting.count({
      where: { isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    }),
    prisma.jobPosting.count({
      where: { expiresAt: { lte: now } },
    }),
    prisma.jobPosting
      .findMany({ select: { organisationId: true }, distinct: ["organisationId"] })
      .then((rows) => rows.length),
  ]);

  return NextResponse.json({ totalJobs, activeJobs, expiredJobs, activePartners: activePartnerOrgs });
}
