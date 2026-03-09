"use server";

import { revalidatePath } from "next/cache";
import { addWorkExperience } from "@/lib/services/student-services";

export async function addWorkExperienceAction(
  userId: string,
  data: {
    company: string;
    title: string;
    description?: string;
    startDate?: string; // format: yyyy-mm
    endDate?: string; // format: yyyy-mm
    isCurrent?: boolean;
    location?: string;
  },
) {
  const created = await addWorkExperience(userId, {
    company: data.company,
    title: data.title,
    description: data.description || undefined,
    startDate: data.startDate ? new Date(`${data.startDate}-01`) : undefined,
    endDate: data.endDate ? new Date(`${data.endDate}-01`) : undefined,
    isCurrent: data.isCurrent ?? false,
    location: data.location || undefined,
  });

  revalidatePath("/talent-discovery-standalone/student-skills-experience");

  return {
    id: created.id,
    role: created.title,
    company: created.company,
    startDate: created.startDate ? created.startDate.toISOString() : "",
    endDate: created.endDate ? created.endDate.toISOString() : "",
    description: created.description ?? "",
  };
}
