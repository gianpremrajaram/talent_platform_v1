import { z } from "zod";

export const adminCreateUserSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
});

export const userRegistrationSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required.")
      .email("Please enter a valid email address."),

    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    companyName: z.string().min(1, "Company name is required."),

    password: z.string().min(8, "Password must be at least 8 characters long."),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
