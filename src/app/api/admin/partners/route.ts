import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/getServerAuthSession";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerAuthSession();
  const user = session?.user as { id?: string; roleKeys?: string[] } | undefined;
  const roleKeys: string[] = user?.roleKeys ?? [];
  
  if (!user?.id || !roleKeys.includes("ADMIN")) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  // 1. Expand query scope: Fetch the real status of the Organisation and AppSuspension records
  const partners = await prisma.user.findMany({
    where: {
      userStatus: "ACTIVE",
      // To avoid missing any partners (e.g., Amazon, which might be set to OTHER or UNIVERSITY)
      // We remove the strict 'type: "INDUSTRY"' restriction; as long as there is an organisationId, it's included
      organisationId: { not: null },
      organisation: {
        status: { not: "PENDING" }
      }
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      organisation: {
        select: { 
          name: true,
          status: true // Fetch the company's real approval status
        },
      },
      appSuspensions: { // Fetch penalty/suspension logs
        where: { appKey: "TALENT_DISCOVERY", liftedAt: null }, // Only fetch currently active suspensions/bans
        select: { reason: true },
        take: 1, // One active penalty record is enough
      },
      memberships: {
        select: {
          membershipTier: { select: { key: true } },
        },
        orderBy: { id: "desc" },
        take: 1,
      },
    },
    orderBy: { organisation: { name: "asc" } },
  });

  const rows = partners.map((u) => {
    const membership = u.memberships[0];
    const orgStatus = u.organisation?.status;
    const activeSuspension = u.appSuspensions[0];

    // 2. Core logic: Calculate the "Effective Status"
    let finalStatus = "active";
    if (activeSuspension) {
      // If there is an unlifted penalty record, prioritize showing the penalty status (suspended or banned)
      finalStatus = activeSuspension.reason.toLowerCase();
    } else if (orgStatus === "SUSPENDED" || orgStatus === "BANNED" || orgStatus === "PENDING") {
      // Otherwise, fall back to the company's base approval status
      finalStatus = orgStatus.toLowerCase();
    }

    return {
      id: u.id,
      name: u.organisation?.name ?? `${u.firstName} ${u.lastName}`,
      userType: "Company",
      tierLabel: membership?.membershipTier
        ? membership.membershipTier.key.charAt(0) + membership.membershipTier.key.slice(1).toLowerCase()
        : undefined,
      email: u.email,
      appScope: "Talent Platform",
      status: finalStatus,
      history: [],
    };
  });

  return NextResponse.json(rows);
}