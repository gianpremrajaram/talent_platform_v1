import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/getServerAuthSession";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerAuthSession();
  const me = session?.user;
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
      userStatus: true,
      appSuspensions: {
        where: { appKey: "TALENT_DISCOVERY", liftedAt: null },
        select: { reason: true },
        take: 1,
      },
    },
    orderBy: { firstName: "asc" },
  });

  const rows = students.map((u) => {
    const activeSuspension = u.appSuspensions[0];

    let status: string;
    if (activeSuspension?.reason === "BANNED") {
      status = "banned";
    } else if (activeSuspension?.reason === "SUSPENDED") {
      status = "suspended";
    } else if (u.userStatus === "PENDING_APPROVAL") {
      status = "pending_approval";
    } else {
      status = "active";
    }

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
