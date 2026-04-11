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

  const partners = await prisma.user.findMany({
    where: {
      userStatus: "ACTIVE",
      organisation: {
        type: "INDUSTRY",
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      organisation: {
        select: { name: true },
      },
      memberships: {
        select: {
          status: true,
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
    const rawStatus = membership?.status ?? "active";
    const status =
      rawStatus === "suspended" || rawStatus === "banned" ? rawStatus : "active";

    return {
      id: u.id,
      name: u.organisation?.name ?? `${u.firstName} ${u.lastName}`,
      userType: "Company",
      tierLabel: membership?.membershipTier
        ? membership.membershipTier.key.charAt(0) + membership.membershipTier.key.slice(1).toLowerCase()
        : undefined,
      email: u.email,
      appScope: "Talent Platform",
      status,
      history: [],
    };
  });

  return NextResponse.json(rows);
}
