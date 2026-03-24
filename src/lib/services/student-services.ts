import "server-only";
import { prisma } from "@/lib/prisma";
import { SocialPlatform } from "@prisma/client";

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
