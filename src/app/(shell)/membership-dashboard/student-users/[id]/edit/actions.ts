"use server";

import prisma from "@/lib/prisma"; // Adjust path if necessary
import { revalidatePath } from "next/cache";

// Execute suspension or ban
export async function suspendOrBanUser(userId: string, actionType: "SUSPEND" | "BAN") {
  // As per Issue #33: Insert a new record into AppSuspension
  await prisma.appSuspension.create({
    data: {
      userId: userId,
      appKey: "TALENT_DISCOVERY", // Issue requires Per-app (limited to the current talent platform)
      reason: actionType === "BAN" ? "BANNED" : "SUSPENDED", // Use reason to distinguish between suspension and permanent ban
    },
  });
  
  // Refresh the current page so the UI reads the latest state
  revalidatePath(`/membership-dashboard/partner-users/${userId}/edit`);
}

// Lift suspension/ban
export async function liftSuspension(userId: string) {
  // As per Issue #33: Lifting a suspension only updates liftedAt, absolutely no row deletion (to retain audit records rows not deleted)
  await prisma.appSuspension.updateMany({
    where: {
      userId: userId,
      appKey: "TALENT_DISCOVERY",
      liftedAt: null, // Find the currently active suspension record
    },
    data: {
      liftedAt: new Date(), // Apply the unban timestamp
    },
  });
  
  revalidatePath(`/membership-dashboard/partner-users/${userId}/edit`);
}