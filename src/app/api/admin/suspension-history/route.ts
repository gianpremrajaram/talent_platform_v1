import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/getServerAuthSession";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession();
    
    const user = session?.user as { id?: string; roleKeys?: string[] } | undefined;
    const roleKeys: string[] = user?.roleKeys ?? [];
    
    if (!user?.id || !roleKeys.includes("ADMIN")) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json({ error: "Missing userId parameter." }, { status: 400 });
    }

    const historyRecords = await prisma.appSuspension.findMany({
      where: { userId: targetUserId },
      orderBy: { suspendedAt: "desc" },
      select: {
        id: true,
        appKey: true,
        reason: true,
        suspendedAt: true,
      }
    });

    return NextResponse.json(historyRecords);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[API_ERROR] suspension-history:", errorMessage);
    
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}