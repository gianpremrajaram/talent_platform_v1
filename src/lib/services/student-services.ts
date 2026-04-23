import "server-only";
import { prisma } from "@/lib/prisma";
import { SocialPlatform } from "@prisma/client";
import fs from "fs";
import path from "path";

//api to get the work expereince of the student
export async function getStudentWorkExperiences(userId: string) {
  return prisma.studentWorkExperience.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });
}
//api to get the projects of the student
export async function getStudentProjects(userId: string) {
  return prisma.studentProjects.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });
}

export async function getStudentProjectCount(userId: string) {
  return prisma.studentProjects.count({ where: { userId } });
}

export async function getStudentTechnicalSkills(userId: string) {
  return prisma.studentSkill.findMany({
    where: { userId },
  });
}

export async function getStudentAcheivementTags(userId: string) {
  return prisma.studentAcheivementTag.findMany({
    where: { userId },
  });
}

export async function addWorkExperience(
  userId: string,
  data: {
    company: string;
    title: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    isCurrent?: boolean;
    location?: string;
  },
) {
  return prisma.studentWorkExperience.create({
    data: {
      userId,
      ...data,
    },
  });
}

export async function addStudentSkill(userId: string, name: string) {
  return prisma.studentSkill.create({
    data: {
      userId,
      name,
    },
  });
}

export async function addStudentAcheivementTag(userId: string, name: string) {
  return prisma.studentAcheivementTag.create({
    data: {
      userId,
      name,
    },
  });
}

export async function deleteStudentAcheivementTag(id: string) {
  return prisma.studentAcheivementTag.delete({
    where: { id },
  });
}

export async function deleteStudentSkill(id: string) {
  return prisma.studentSkill.delete({
    where: { id },
  });
}

export async function addStudentProject(
  userId: string,
  data: {
    title: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    projectLink?: string;
  },
) {
  return prisma.studentProjects.create({
    data: {
      userId,
      ...data,
    },
  });
}

export async function deleteWorkExperience(id: string) {
  return prisma.studentWorkExperience.delete({
    where: { id },
  });
}

export async function deleteStudentProject(id: string) {
  return prisma.studentProjects.delete({
    where: { id },
  });
}

export async function getStudentUniversities(userId: string) {
  return prisma.studentUniversity.findMany({
    where: { userId },
  });
}

export async function getStudentSocialLinks(userId: string) {
  return prisma.studentSocialLink.findMany({
    where: { userId },
  });
}

export async function addStudentUniversity(
  userId: string,
  data: {
    universityName: string;
    degreeProgram: string;
    fieldOfStudy: string;
    grade?: string;
    startDate?: Date;
    endDate?: Date;
  },
) {
  return prisma.studentUniversity.create({
    data: {
      userId,
      ...data,
    },
  });
}

export async function updateStudentUniversity(
  id: string,
  data: {
    universityName?: string;
    degreeProgram?: string;
    fieldOfStudy?: string;
    grade?: string;
    startDate?: Date;
    endDate?: Date;
  },
) {
  return prisma.studentUniversity.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteStudentUniversity(id: string) {
  return prisma.studentUniversity.delete({
    where: { id },
  });
}

export async function getStudentUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, firstName: true, lastName: true, email: true },
  });
}

export async function getStudentPersonalInfo(userId: string) {
  //it will be unique for every user
  return prisma.studentPersonalInformation.findUnique({
    where: { userId },
  });
}

//instead of sep add and update we create one single api that safely handles both cases easily.
export async function upsertStudentPersonalInfo(
  userId: string,
  data: {
    dateOfBirth?: Date;
    gender?: string;
    phoneCode?: string;
    phoneNumber?: string;
    designation?: string;
    address1?: string;
    address2?: string;
    country?: string;
    state?: string;
    city?: string;
    postalCode?: string;
  },
) {
  return prisma.studentPersonalInformation.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
  });
}

export type StudentSocialLinkInput = {
  platform: SocialPlatform;
  url: string;
};

export async function createStudentSocialLink(
  userId: string,
  data: StudentSocialLinkInput,
) {
  return prisma.studentSocialLink.create({
    data: {
      userId,
      platform: data.platform,
      url: data.url,
    },
  });
}

export async function saveStudentSocialLinks(
  userId: string,
  links: StudentSocialLinkInput[],
) {
  return prisma.$transaction(async (tx) => {
    await tx.studentSocialLink.deleteMany({
      where: { userId },
    });

    if (!links.length) {
      return [];
    }

    await tx.studentSocialLink.createMany({
      data: links.map((link) => ({
        userId,
        platform: link.platform,
        url: link.url,
      })),
    });

    return tx.studentSocialLink.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  });
}

export async function updateStudentSocialLink(
  id: string,
  data: Partial<StudentSocialLinkInput>,
) {
  return prisma.studentSocialLink.update({
    where: { id },
    data: {
      ...(data.platform !== undefined ? { platform: data.platform } : {}),
      ...(data.url !== undefined ? { url: data.url } : {}),
    },
  });
}

export async function deleteStudentSocialLink(id: string) {
  return prisma.studentSocialLink.delete({
    where: { id },
  });
}

export async function createStudentCV(
  userId: string,
  data: {
    label: string;
    fileUrl: string;
    notes?: string;
    tags?: string[];
  },
) {
  return prisma.studentCV.create({
    data: {
      userId,
      label: data.label,
      fileUrl: data.fileUrl,
      notes: data.notes,
      tags: data.tags ?? [],
    },
  });
}

// Function replacing student CV's and deleting the old file from the server.
export async function replaceStudentCV(cvId: string, file: File) {
  const existing = await prisma.studentCV.findUnique({
    where: { id: cvId },
  });

  if (!existing) {
    throw new Error("CV not found");
  }

  //converts file
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  //ensures the file exists
  const uploadDir = path.join(process.cwd(), "public/uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);

  fs.writeFileSync(filePath, buffer);

  const oldPath = path.join(process.cwd(), "public", existing.fileUrl);

  // Delete the old file if it exists
  if (existing.fileUrl) {
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  // Update DB record with new file URL
  return prisma.studentCV.update({
    where: { id: cvId },
    data: {
      fileUrl: `/uploads/${fileName}`,
      uploadedAt: new Date(),
    },
  });
}

export async function getStudentCVs(userId: string) {
  return prisma.studentCV.findMany({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
  });
}

export async function deleteStudentCV(id: string) {
  return prisma.studentCV.delete({
    where: { id },
  });
}

/**
 * Seeds StudentCompanyConsent rows (consented = true) for every organisation
 * the student doesn't already have a row for. Safe to call multiple times —
 * skipDuplicates means existing rows are never overwritten.
 */
export async function seedStudentConsentRows(studentId: string) {
  const orgs = await prisma.organisation.findMany({ select: { id: true } });
  if (orgs.length === 0) return;

  await prisma.studentCompanyConsent.createMany({
    data: orgs.map((o) => ({
      studentId,
      companyId: o.id,
      consented: true,
    })),
    skipDuplicates: true,
  });
}

// ─── Public profile (privacy-safe, recruiter/admin view) ─────────────────────

/**
 * Returns all information a recruiter or admin is allowed to see.
 * Deliberately excludes: email, phone, address, date of birth, gender.
 */
export async function getStudentPublicProfile(studentId: string) {
  const [user, profile, universities, workExperiences, skills, achievements, projects, socialLinks] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: studentId },
        select: { id: true, firstName: true, lastName: true },
      }),
      prisma.studentProfile.findUnique({
        where: { userId: studentId },
        select: { bio: true },
      }),
      prisma.studentUniversity.findMany({
        where: { userId: studentId },
        orderBy: { startDate: "desc" },
      }),
      prisma.studentWorkExperience.findMany({
        where: { userId: studentId },
        orderBy: { startDate: "desc" },
      }),
      prisma.studentSkill.findMany({ where: { userId: studentId } }),
      prisma.studentAcheivementTag.findMany({ where: { userId: studentId } }),
      prisma.studentProjects.findMany({
        where: { userId: studentId },
        orderBy: { startDate: "desc" },
      }),
      prisma.studentSocialLink.findMany({ where: { userId: studentId } }),
    ]);

  if (!user) return null;

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    bio: profile?.bio ?? null,
    universities,
    workExperiences,
    skills,
    achievements,
    projects,
    socialLinks,
  };
}

export type StudentPublicProfile = NonNullable<
  Awaited<ReturnType<typeof getStudentPublicProfile>>
>;

/**
 * Access control for the student public profile view.
 * - ADMIN: always allowed.
 * - RECRUITER: allowed if the student has applied to any of their org's jobs
 *              OR has an active consent record for their organisation.
 */
export async function canViewStudentProfile(
  viewerId: string,
  studentId: string,
): Promise<boolean> {
  const viewer = await prisma.user.findUnique({
    where: { id: viewerId },
    select: {
      organisationId: true,
      roles: { select: { role: { select: { key: true } } } },
    },
  });
  if (!viewer) return false;

  const roleKeys = viewer.roles.map((r) => r.role.key);

  if (roleKeys.includes("ADMIN")) return true;

  if (roleKeys.includes("RECRUITER") && viewer.organisationId) {
    // Applicant check — student explicitly applied to one of their jobs
    const application = await prisma.jobApplication.findFirst({
      where: {
        studentId,
        job: { organisationId: viewer.organisationId },
      },
      select: { id: true },
    });
    if (application) return true;

    // Consent check — student has given explicit consent for this org
    const consent = await prisma.studentCompanyConsent.findUnique({
      where: {
        studentId_companyId: {
          studentId,
          companyId: viewer.organisationId,
        },
      },
      select: { consented: true },
    });
    return consent?.consented === true;
  }

  return false;
}

export async function updateStudentCVTags(
  cvId: string,
  data: { label?: string; tags?: string[] },
) {
  return prisma.studentCV.update({
    where: { id: cvId },
    data,
  });
}

export async function getMembersWithConsentStatus(studentId: string) {
  const members = await prisma.membershipDashboardMember.findMany({
    include: {
      membership: {
        include: { organisation: true },
      },
    },
  });

  // Collect org IDs that back these member entries.
  const orgIds = members
    .map((m) => m.membership?.organisation?.id)
    .filter((id): id is number => id != null);

  // Lazy-seed: create missing consent rows so the DB and UI are always in sync.
  if (orgIds.length > 0) {
    await prisma.studentCompanyConsent.createMany({
      data: orgIds.map((companyId) => ({
        studentId,
        companyId,
        consented: true,
      })),
      skipDuplicates: true,
    });
  }

  // Read the now-guaranteed rows back as a map for O(1) lookup.
  const consents = await prisma.studentCompanyConsent.findMany({
    where: { studentId, companyId: { in: orgIds } },
    select: { companyId: true, consented: true },
  });
  const consentMap = new Map(consents.map((c) => [c.companyId, c.consented]));

  return members.map((m) => ({
    id: m.id,
    memberKey: m.memberKey,
    organisationId: m.membership?.organisation?.id ?? null,
    name: m.membership?.organisation?.name ?? m.memberKey,
    consented:
      m.membership?.organisation?.id != null
        ? (consentMap.get(m.membership.organisation.id) ?? true)
        : true,
  }));
}
