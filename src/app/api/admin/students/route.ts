import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/getServerAuthSession";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerAuthSession();
  const me = session?.user as any | undefined;
  const roleKeys: string[] = me?.roleKeys ?? [];
  if (!me?.id || !roleKeys.includes("ADMIN")) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const students = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          role: { key: "STUDENT" },
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      memberships: {
        select: {
          status: true,
        },
        orderBy: { id: "desc" },
        take: 1,
      },
    },
    orderBy: { firstName: "asc" },
  });

  const rows = students.map((u) => {
    const rawStatus = u.memberships[0]?.status ?? "active";
    const status =
      rawStatus === "suspended" || rawStatus === "banned" ? rawStatus : "active";

    return {
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      userType: "Student",
      email: u.email,
      appScope: "Talent Platform",
      status,
      history: [],
    };
  });

  return NextResponse.json(rows);
}
