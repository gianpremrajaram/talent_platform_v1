import { z } from "zod";

export const jobPostingSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(20).max(5000),
  location: z.string().min(2).max(120),
  salaryBand: z.string().max(80).optional(),
  roleType: z.string().min(1).max(80),
  expiresAt: z.string().datetime({ offset: true }).optional(),
});

// Partial version used by PATCH — all fields optional, plus isActive toggle.
// expiresAt explicitly accepts null or empty string (→ null) so recruiters can
// clear a previously-set expiry date to make a posting evergreen.
export const updateJobPostingSchema = jobPostingSchema.partial().extend({
  isActive: z.boolean().optional(),
  expiresAt: z
    .union([
      z.string().datetime({ offset: true }),
      z.literal(""),
      z.null(),
    ])
    .optional()
    .transform((v) => (v === "" ? null : v)),
});
