import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/getServerAuthSession";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerAuthSession();
    const me = session?.user as any | undefined;
    const roleKeys: string[] = me?.roleKeys ?? [];
    
    if (!me?.id || !roleKeys.includes("ADMIN")) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    // Attempt to query users with PENDING_APPROVAL status
    const pendingUsers = await prisma.user.findMany({
      where: {
        userStatus: "PENDING_APPROVAL",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        organisation: {
          select: { 
            name: true,
          },
        },
      },
      // ⚠️ Temporarily removed orderBy
    });

    const rows = pendingUsers.map((u) => {
      const domain = u.email ? u.email.split("@")[1] : "N/A";
      
      return {
        id: u.id,
        name: u.organisation?.name || "Unknown Company",
        domain: domain,
        email: u.email || "N/A",
        firstName: u.firstName || "N/A",
        lastName: u.lastName || "N/A",
        date: "N/A", 
      };
    });

    return NextResponse.json(rows);

  } catch (error: any) {
    // If an error occurs, the specific red error message will be printed in the VS Code terminal running the server
    console.error("🔥 API Error in pending-partners:", error);
    return NextResponse.json(
      { error: "Something went wrong", details: error.message }, 
      { status: 500 }
    );
  }
}