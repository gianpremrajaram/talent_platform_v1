import "server-only";
import { prisma } from "@/lib/prisma";

export async function getStudentWorkExperiences(userId: string) {
  return prisma.studentWorkExperience.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
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
