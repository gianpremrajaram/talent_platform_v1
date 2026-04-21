// src/app/api/admin/partner-projects/route.ts
// Admin list of partner project submissions (JobPosting rows).
// Returns rows ordered by postedAt desc. ADMIN only.

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

  const postings = await prisma.jobPosting.findMany({
    orderBy: [{ approvalStatus: "asc" }, { postedAt: "desc" }],
    select: {
      id: true,
      title: true,
      postedAt: true,
      approvalStatus: true,
      organisation: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          memberships: {
            where: { isActive: true },
            select: { membershipTier: { select: { key: true } } },
          },
        },
      },
    },
  });

  const rows = postings.map((j) => {
    const tierKey =
      j.createdBy?.memberships?.[0]?.membershipTier?.key?.toLowerCase() ?? null;
    return {
      id: j.id,
      companyName: j.organisation.name,
      projectName: j.title,
      dateApplied: j.postedAt.toISOString(),
      tier: tierKey,
      status: j.approvalStatus.toLowerCase(),
    };
  });

  return NextResponse.json(rows);
}
