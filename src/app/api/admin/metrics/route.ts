// src/app/api/admin/metrics/route.ts
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

    const totalStudents = await prisma.user.count({
      where: {
        roles: {
          some: { role: { key: "STUDENT" } }
        }
      }
    });

    const consentedRecords = await prisma.studentCompanyConsent.findMany({
      where: { consented: true },
      distinct: ['studentId'],
      select: { studentId: true }
    });
    const consentedStudents = consentedRecords.length;

    const activeFirms = await prisma.membership.findMany({
      where: {
        isActive: true,
        user: {
          roles: {
            some: { role: { key: "RECRUITER" } }
          }
        }
      },
      distinct: ['organisationId'],
      select: { organisationId: true }
    });
    const approvedFirms = activeFirms.length;

    const matchablePairs = consentedStudents * approvedFirms;

    return NextResponse.json({
      totalStudents,
      consentedStudents,
      approvedFirms,
      matchablePairs
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[API_ERROR] admin-metrics:", errorMessage);
    
    return NextResponse.json(
      { error: "Failed to fetch metrics" }, 
      { status: 500 }
    );
  }
}