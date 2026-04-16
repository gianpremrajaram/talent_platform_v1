"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Execute suspension or ban (Dual-write: AppSuspension audit log + userStatus sync)
export async function suspendOrBanUser(userId: string, actionType: "SUSPEND" | "BAN") {
  const targetReason = actionType === "BAN" ? "BANNED" : "SUSPENDED";

  await prisma.$transaction(async (tx) => {
    // Action A: Create an AppSuspension audit log entry
    await tx.appSuspension.create({
      data: {
        userId,
        appKey: "TALENT_DISCOVERY",
        reason: targetReason,
      },
    });

    // Action B: Sync userStatus — use SUSPENDED for both suspend and ban.
    // BANNED is tracked via AppSuspension.reason; the UserStatus enum may not yet
    // include BANNED if prisma generate hasn't been re-run after the schema change.
    await tx.user.update({
      where: { id: userId },
      data: { userStatus: "SUSPENDED" },
    });
  });

  revalidatePath(`/membership-dashboard/student-users/${userId}/edit`);
  revalidatePath("/membership-dashboard/student-users");
}

// Lift suspension/ban (Dual-write: lift audit record + restore userStatus to ACTIVE)
export async function liftSuspension(userId: string) {
  await prisma.$transaction(async (tx) => {
    // Action A: Mark the active suspension record as lifted (never delete rows — audit trail)
    await tx.appSuspension.updateMany({
      where: {
        userId,
        appKey: "TALENT_DISCOVERY",
        liftedAt: null,
      },
      data: {
        liftedAt: new Date(),
      },
    });

    // Action B: Restore userStatus to ACTIVE
    await tx.user.update({
      where: { id: userId },
      data: { userStatus: "ACTIVE" },
    });
  });

  revalidatePath(`/membership-dashboard/student-users/${userId}/edit`);
  revalidatePath("/membership-dashboard/student-users");
}