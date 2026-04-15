import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/getServerAuthSession";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerAuthSession();
    
    const user = session?.user as { id?: string; roleKeys?: string[] } | undefined;
    const roleKeys: string[] = user?.roleKeys ?? [];
    
    if (!user?.id || !roleKeys.includes("ADMIN")) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    // find “user-userStatus : PENDING_APPROVAL” or “organisation-status: PENDING”
    const pendingUsers = await prisma.user.findMany({
      where: {
        OR: [
          { userStatus: "PENDING_APPROVAL" },
          { organisation: { status: "PENDING" } }
        ]
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true, 
        organisation: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" }, 
    });

    const rows = pendingUsers.map((u) => ({
      id: u.id,
      name: u.organisation?.name || "No Org Linked",
      domain: u.email ? u.email.split("@")[1] : "N/A",
      email: u.email || "N/A",
      firstName: u.firstName || "N/A",
      lastName: u.lastName || "N/A",
      date: u.createdAt ? u.createdAt.toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json(rows);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[API_ERROR] pending-partners:", errorMessage);
    
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}