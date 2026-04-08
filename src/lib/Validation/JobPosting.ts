import { z } from "zod";

export const jobPostingSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),

  location: z.string().min(2),

  salary: z.number().min(0).optional(),

  requiredSkills: z.array(z.string()).min(1),
});