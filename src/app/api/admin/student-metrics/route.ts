// src/app/api/admin/student-metrics/route.ts
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

    // 1. 过滤：只找拥有 "STUDENT" 角色的用户！这就彻底隔绝了 Partner 数据。
    const students = await prisma.user.findMany({
      where: {
        roles: {
          some: { role: { key: "STUDENT" } }
        }
      },
      select: {
        userStatus: true,
        // 2. 顺藤摸瓜：只拉取这些学生身上没被解封的惩罚记录
        appSuspensions: {
          where: { liftedAt: null },
          select: { reason: true }
        }
      },
    });

    let active = 0, suspended = 0, banned = 0;

    // 3. 统计逻辑（和 Partner 一样优先判断最严重的）
    students.forEach((u) => {
      const isBanned = u.appSuspensions.some(s => s.reason === "BANNED");
      const isSuspended = u.appSuspensions.some(s => s.reason === "SUSPENDED");

      if (isBanned) {
        banned++;
      } else if (isSuspended) {
        suspended++;
      } else {
        // 学生没有 pending 状态，只要没被 ban/suspend 就是 active
        active++;
      }
    });

    // 4. 返回 4 个卡片的数据
    return NextResponse.json({
      active,
      suspended,
      banned,
      total: students.length,
    });

  } catch (error) {
    console.error("[API_ERROR] student-metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch student metrics" },
      { status: 500 }
    );
  }
}