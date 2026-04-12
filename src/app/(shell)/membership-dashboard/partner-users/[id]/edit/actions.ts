"use server";

import prisma from "@/lib/prisma";
import { OrganisationType, CompanyStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Execute suspension or ban
export async function suspendOrBanUser(userId: string, actionType: "SUSPEND" | "BAN") {
  await prisma.appSuspension.create({
    data: {
      userId: userId,
      appKey: "TALENT_DISCOVERY", 
      reason: actionType === "BAN" ? "BANNED" : "SUSPENDED", 
    },
  });
  
  revalidatePath(`/membership-dashboard/partner-users/${userId}/edit`);
}

// Lift suspension/ban
export async function liftSuspension(userId: string) {
  await prisma.appSuspension.updateMany({
    where: {
      userId: userId,
      appKey: "TALENT_DISCOVERY",
      liftedAt: null, 
    },
    data: {
      liftedAt: new Date(), 
    },
  });
  
  revalidatePath(`/membership-dashboard/partner-users/${userId}/edit`);
} // <--- The previously missing brace is closed here!

// Update organisation information (It is now outside, independent and safe)
export async function updateOrganisation(orgId: string, userId: string, data: {
  slug?: string;
  domain?: string;
  type?: string;
  status?: string;
}) {
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