"use server";
import {
  addStudentUniversity,
  deleteStudentUniversity,
} from "@/lib/services/student-services";
import { revalidatePath } from "next/cache";

type AddStudentUniversityInput = {
  userId: string;
  universityName: string;
  fieldOfStudy: string;
  degreeProgram: string;
  grade?: string;
  startDate?: string | null;
  endDate?: string | null;
};

export async function addStudentUniversityAction(
  input: AddStudentUniversityInput,
) {
  const created = await addStudentUniversity(input.userId, {
    universityName: input.universityName.trim(),
    fieldOfStudy: input.fieldOfStudy.trim(),
    degreeProgram: input.degreeProgram.trim(),
    grade: input.grade?.trim() || undefined,
    startDate:
      input.startDate && input.startDate !== null
        ? new Date(input.startDate)
        : undefined,
    endDate:
      input.endDate && input.endDate !== null
        ? new Date(input.endDate)
        : undefined,
  });

  revalidatePath("/talent-discovery-standalone/student-academic-information");

  return created;
}

export async function deleteStudentUniversityAction(id: string) {
  await deleteStudentUniversity(id);
  revalidatePath("/talent-discovery-standalone/student-academic-information");
}
