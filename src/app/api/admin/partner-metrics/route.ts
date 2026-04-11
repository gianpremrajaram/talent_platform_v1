// src/app/api/admin/partner-metrics/route.ts
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

    // 1. 获取所有行业招聘人员，并“顺藤摸瓜”带上他们有效的封禁记录
    const recruiters = await prisma.user.findMany({
      where: {
        organisation: { type: "INDUSTRY" },
      },
      select: {
        userStatus: true,
        organisation: {
          select: { status: true },
        },
        // 🌟 核心魔法：只查没有被 lifted 的惩罚记录
        appSuspensions: {
          where: { liftedAt: null }, 
          select: { reason: true }
        }
      },
    });

    let active = 0, pending = 0, suspended = 0, banned = 0;

    // 2. 遍历用户，根据真实的 AppSuspension 记录来计算卡片数字
    recruiters.forEach((u) => {
      // 根据你数据库截图里的数据规律，reason 字段直接存了操作类型
      const isBanned = u.appSuspensions.some(s => s.reason === "BANNED");
      const isSuspended = u.appSuspensions.some(s => s.reason === "SUSPENDED");

      // 优先级：Banned > Suspended > Pending > Active
      if (isBanned) {
        banned++;
      } else if (isSuspended) {
        suspended++;
      } else if (u.userStatus === "PENDING_APPROVAL" || u.organisation?.status === "PENDING") {
        pending++;
      } else {
        active++;
      }
    });

    return NextResponse.json({
      active,
      pending,
      suspended,
      banned,
      total: recruiters.length, // 依然保持准确的总账号人数
    });

  } catch (error) {
    console.error("[API_ERROR] partner-metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch partner metrics" },
      { status: 500 }
    );
  }
}