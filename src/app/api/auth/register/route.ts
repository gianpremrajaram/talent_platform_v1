// src/app/api/auth/register/route.ts
// Public endpoint — no auth required.
// Handles recruiter self-registration (#18).
// Student registration is handled separately (Sadhana, #17).

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api-response";
import { userRegistrationSchema } from "@/lib/Validation/UserRegistration";

export const dynamic = "force-dynamic";

function extractDomain(email: string): string {
  const parts = email.split("@");
  return parts.length === 2 ? parts[1].toLowerCase() : "";
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: Request) {
  const body = await req.json();

  const parsed = userRegistrationSchema.safeParse(body);

  if (!parsed.success) {
  return err("VALIDATION_ERROR", "Validation failed", 400, parsed.error.issues);
  }

  const { email, firstName, lastName, companyName, password } = parsed.data;

  const domain = extractDomain(email);
  if (!domain) {
    return err("BAD_REQUEST", "Email must include a valid domain.");
  }

  // Check for duplicate user
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return err("CONFLICT", "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Find or create organisation by domain (1:1 domain rule)
  let organisation = await prisma.organisation.findUnique({
    where: { domain },
  });

  if (!organisation) {
    // New company — create with PENDING status
    const baseSlug = toSlug(companyName);
    // Ensure slug uniqueness by appending domain suffix if needed
    const slug = `${baseSlug}-${domain.replace(/\./g, "-")}`;

    organisation = await prisma.organisation.create({
      data: {
        name: companyName,
        slug,
        domain,
        type: "INDUSTRY",
        status: "PENDING",
      },
    });
  }
  // If org already exists, recruiter joins it regardless of its current status.
  // Access is still blocked until their userStatus is ACTIVE.

  // Find the RECRUITER role
  const recruiterRole = await prisma.role.findUnique({
    where: { key: "RECRUITER" },
  });
  if (!recruiterRole) {
    return err("INTERNAL", "Recruiter role not configured. Contact an admin.");
  }

  // Create user with PENDING_APPROVAL status — no active membership yet
  const user = await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      passwordHash,
      userStatus: "PENDING_APPROVAL",
      organisationId: organisation.id,
      roles: {
        create: { roleId: recruiterRole.id },
      },
    },
    select: { id: true },
  });

  return ok({ userId: user.id, message: "Registration submitted. Awaiting admin approval." });
}
