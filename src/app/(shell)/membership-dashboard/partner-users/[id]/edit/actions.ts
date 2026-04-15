"use server";

import prisma from "@/lib/prisma";
import { OrganisationType, CompanyStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Execute suspension or ban (Dual-write: Audit Log + State Update)
export async function suspendOrBanUser(userId: string, actionType: "SUSPEND" | "BAN") {
  // 1. First, find the corresponding organisationId by userId
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organisationId: true }
  });

  const targetStatus = actionType === "BAN" ? "BANNED" : "SUSPENDED";

  // 2. Use a transaction to guarantee atomic dual-writes
  await prisma.$transaction(async (tx) => {
    // Action A: Create an AppSuspension audit log entry (records the timestamp)
    await tx.appSuspension.create({
      data: {
        userId: userId,
        appKey: "TALENT_DISCOVERY", 
        reason: targetStatus, 
      },
    });

    // Action B: Sync the status update to the Organisation table
    if (user?.organisationId) {
      await tx.organisation.update({
        where: { id: user.organisationId },
        data: { status: targetStatus },
      });
    }
  });
  
  revalidatePath(`/membership-dashboard/partner-users/${userId}/edit`);
}

// Lift suspension/ban (Dual-write: Lift Log + State Restore)
export async function liftSuspension(userId: string) {
  // 1. First, find the corresponding organisationId by userId
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organisationId: true }
  });

  // 2. Use a transaction to guarantee atomic dual-writes
  await prisma.$transaction(async (tx) => {
    // Action A: Update the AppSuspension audit log (add liftedAt timestamp)
    await tx.appSuspension.updateMany({
      where: {
        userId: userId,
        appKey: "TALENT_DISCOVERY",
        liftedAt: null, 
      },
      data: {
        liftedAt: new Date(), 
      },
    });

    // Action B: Revert the Organisation status back to APPROVED
    if (user?.organisationId) {
      await tx.organisation.update({
        where: { id: user.organisationId },
        data: { status: "APPROVED" },
      });
    }
  });
  
  revalidatePath(`/membership-dashboard/partner-users/${userId}/edit`);
}

// Update organisation information (It is now outside, independent and safe)
export async function updateOrganisation(orgId: number, userId: string, data: {
  slug?: string;
  domain?: string;
  type?: string;
  status?: string;
}) {
  // 1. Apply strict runtime validation
  if (data.type && !Object.values(OrganisationType).includes(data.type as OrganisationType)) {
    throw new Error(`Invalid Organisation Type: ${data.type}`);
  }
  if (data.status && !Object.values(CompanyStatus).includes(data.status as CompanyStatus)) {
    throw new Error(`Invalid Company Status: ${data.status}`);
  }

  // 2. Save securely to the database upon successful validation
  await prisma.organisation.update({
    where: { id: Number(orgId) },
    data: {
      ...(data.slug   !== undefined && { slug:   data.slug }),
      ...(data.domain !== undefined && { domain: data.domain }),
      ...(data.type   !== undefined && { type:   data.type as OrganisationType }),
      ...(data.status !== undefined && { status: data.status as CompanyStatus }),
    },
  });
  
  revalidatePath(`/membership-dashboard/partner-users/${userId}/edit`);
}