import "server-only";
import { prisma } from "@/lib/prisma";

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
