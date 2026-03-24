"use server";

import {
  createStudentCV,
  deleteStudentCV,
} from "@/lib/services/student-services";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function uploadStudentCVAction(formData: FormData) {
  const userId = formData.get("userId") as string;
  const label = formData.get("label") as string;
  const notes = formData.get("notes") as string | null;
  const tagsRaw = formData.get("tags") as string | null;
  const file = formData.get("file") as File | null;

  if (!userId) {
    return { success: false, error: "User not authenticated." };
  }
  if (!label?.trim()) {
    return { success: false, error: "CV name is required." };
  }
  if (!file || file.size === 0) {
    return { success: false, error: "Please select a file to upload." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Only PDF and Word documents are allowed.",
    };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: `File must be under ${MAX_FILE_SIZE_MB}MB.`,
    };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();
  const fileName = `${timestamp}_${safeName}`;

  // public/media/resumes/{userId}/
  const uploadDir = path.join(
    process.cwd(),
    "public",
    "media",
    "resumes",
    userId,
  );
  await mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  const fileUrl = `/media/resumes/${userId}/${fileName}`;

  const tags: string[] = tagsRaw
    ? JSON.parse(tagsRaw).filter((t: string) => t.trim())
    : [];

  const cv = await createStudentCV(userId, {
    label: label.trim(),
    fileUrl,
    notes: notes?.trim() || undefined,
    tags,
  });

  revalidatePath("/talent-discovery-standalone/student-cv-functions");

  return { success: true, cv };
}

export async function deleteStudentCVAction(id: string) {
  await deleteStudentCV(id);
  revalidatePath("/talent-discovery-standalone/student-cv-functions");
}
