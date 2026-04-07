"use server";

import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import JSZip from "jszip";
import fs from "fs/promises";
import path from "path";

//TODO: implement the student profile delete functionality

export async function exportAllData(
  userId: string,
): Promise<
  { ok: true; base64: string; filename: string } | { ok: false; error: string }
> {
  // Server-side guard: confirm the caller owns this userId
  const session = await getServerAuthSession();
  const me = session?.user as any | undefined;
  if (!me?.id || me.id !== userId)
    return { ok: false, error: "Not signed in." };

  // ── Pull all student data from DB ─────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
      userStatus: true,
      organisation: { select: { name: true, slug: true, type: true } },
      roles: { select: { role: { select: { key: true, label: true } } } },
      memberships: {
        include: {
          membershipTier: { select: { key: true, label: true, rank: true } },
          organisation: { select: { name: true } },
        },
      },
      studentProfile: true,
      studentPersonalInformation: true,
      studentSocialLinks: true,
      studentUniversities: true,
      workExperiences: true,
      studentProjects: true,
      studentSkills: true,
      studentAcheivementTags: true,
      consents: { orderBy: { createdAt: "asc" } },
      studentCompanyConsents: {
        include: { company: { select: { name: true, slug: true } } },
        orderBy: { updatedAt: "desc" },
      },
      studentCVs: { orderBy: { uploadedAt: "asc" } },
      auditLogs: {
        where: { actorId: userId },
        orderBy: { timestamp: "desc" },
        take: 500,
      },
    },
  });

  if (!user) return { ok: false, error: "User not found." };

  // ── Assemble profile JSON ─────────────────────────────────────────────────
  const profileData = {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      userStatus: user.userStatus,
      organisation: user.organisation,
      roles: user.roles.map((r) => r.role),
      memberships: user.memberships,
    },
    profile: {
      bio: user.studentProfile,
      personalInformation: user.studentPersonalInformation,
      socialLinks: user.studentSocialLinks,
      universities: user.studentUniversities,
      workExperiences: user.workExperiences,
      projects: user.studentProjects,
      skills: user.studentSkills,
      achievementTags: user.studentAcheivementTags,
    },
    consent: {
      platformConsents: user.consents,
      companyConsents: user.studentCompanyConsents.map((c) => ({
        company: c.company,
        consented: c.consented,
        updatedAt: c.updatedAt,
      })),
    },
    cvMetadata: user.studentCVs.map((cv) => ({
      id: cv.id,
      label: cv.label,
      fileUrl: cv.fileUrl,
      notes: cv.notes,
      tags: cv.tags,
      uploadedAt: cv.uploadedAt,
    })),
    auditLog: user.auditLogs,
  };

  // ── Build zip ─────────────────────────────────────────────────────────────
  const zip = new JSZip();

  zip.file("profile-data.json", JSON.stringify(profileData, null, 2));

  // Attach CV files from public/media/resumes/{userId}/
  // fileUrl is stored as e.g. /media/resumes/{userId}/filename.pdf
  // — resolve against <cwd>/public to get the real disk path.
  const publicRoot = path.join(process.cwd(), "public");
  const cvFolder = zip.folder("cvs");

  for (const cv of user.studentCVs) {
    try {
      const filePath = path.join(publicRoot, cv.fileUrl);
      const fileBuffer = await fs.readFile(filePath);
      const safeLabel = cv.label.replace(/[^a-z0-9_\-. ]/gi, "_");
      const ext = path.extname(filePath) || ".pdf";
      cvFolder!.file(`${safeLabel}${ext}`, fileBuffer);
    } catch {
      // File missing from disk — skip silently; metadata is still in JSON
    }
  }

  const base64 = await zip.generateAsync({ type: "base64" });
  const filename = `ucl-talent-data-export-${new Date().toISOString().slice(0, 10)}.zip`;

  return { ok: true, base64, filename };
}
