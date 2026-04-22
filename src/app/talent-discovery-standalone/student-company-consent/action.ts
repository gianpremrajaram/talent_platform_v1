"use server";

import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { prisma } from "@/lib/prisma";

export async function toggleCompanyConsent(
  organisationId: number,
  consented: boolean,
) {
  const session = await getServerAuthSession();
  const studentId = session?.user?.id;
  if (!studentId) throw new Error("Unauthorized");

  await prisma.studentCompanyConsent.upsert({
    where: { studentId_companyId: { studentId, companyId: organisationId } },
    update: { consented },
    create: { studentId, companyId: organisationId, consented },
  });
}

export async function revokeAllConsent() {
  const session = await getServerAuthSession();
  const studentId = session?.user?.id;
  if (!studentId) throw new Error("Unauthorized");

  await prisma.studentCompanyConsent.updateMany({
    where: { studentId },
    data: { consented: false },
  });
}
