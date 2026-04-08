import { z } from "zod";

export const studentProfileSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500),

  skills: z.array(z.string().min(1)).min(1, "At least one skill required"),

  projects: z.array(
    z.object({
      title: z.string().min(3),
      description: z.string().min(10),
    })
  ).optional(),
});