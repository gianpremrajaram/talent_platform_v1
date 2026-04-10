import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/getServerAuthSession";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession();
    const me = session?.user as any | undefined;
    const roleKeys: string[] = me?.roleKeys ?? [];
    
    if (!me?.id || !roleKeys.includes("ADMIN")) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    // Extract userId from the query parameters (e.g., ?userId=123)
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json({ error: "Missing userId parameter." }, { status: 400 });
    }

    // Fetch the real suspension history from the AppSuspension table
    const historyRecords = await prisma.appSuspension.findMany({
      where: {
        userId: targetUserId,
      },
      orderBy: {
        suspendedAt: "desc", // Most recent suspensions first
      },
      select: {
        id: true,
        appKey: true,
        reason: true,
        suspendedAt: true,
      }
    });

    return NextResponse.json(historyRecords);

  } catch (error: any) {
    console.error("🔥 API Error fetching suspension history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history.", details: error.message }, 
      { status: 500 }
    );
  }
}