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
      select: {
        id: true,
        appKey: true,
        reason: true,
        suspendedAt: true,
        liftedAt: true,
      }
    });

    // Flatten database records into distinct timeline events
    const mappedRecords = historyRecords.flatMap((record) => {
      const events = [];

      // Base event: Initial suspension or ban
      events.push({
        id: `${record.id}-initial`, // Suffix ensures unique React keys
        appKey: record.appKey,
        reason: record.reason,
        suspendedAt: record.suspendedAt.toISOString(), 
        action: record.reason === "BANNED" ? "ban" : "suspend",
      });

      // Secondary event: Access restoration (if lifted)
      if (record.liftedAt !== null) {
        events.push({
          id: `${record.id}-lifted`,
          appKey: record.appKey,
          reason: "Access Restored",
          suspendedAt: record.liftedAt.toISOString(),
          action: "lift",
        });
      }

      return events;
    });

    // Re-sort the flattened timeline in descending order (newest first)
    mappedRecords.sort((a, b) => 
      new Date(b.suspendedAt).getTime() - new Date(a.suspendedAt).getTime()
    );

    return NextResponse.json(mappedRecords);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[API_ERROR] suspension-history:", errorMessage);
    
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}