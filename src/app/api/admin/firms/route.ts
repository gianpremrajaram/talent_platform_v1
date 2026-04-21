// src/app/api/admin/firms/route.ts
// Lightweight list of approved organisations for admin dropdowns.
// Used by the Admin Recommendation Gateway firm selector.
// All OrganisationTypes are eligible; status=APPROVED is the only gate.

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

  const firms = await prisma.organisation.findMany({
    where: { status: "APPROVED" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(firms);
}
