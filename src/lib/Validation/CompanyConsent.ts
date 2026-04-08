import { z } from "zod";

export const companyConsentSchema = z.object({
  type: z.enum(["PRIVACY_POLICY", "TERMS_OF_SERVICE"]),

  accepted: z.boolean(),

  timestamp: z.date().optional(),
});