// src/app/api/account/create-user/route.ts
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { ok, err } from "@/lib/api-response";
import { userRegistrationSchema } from "@/lib/Validation";

export const dynamic = "force-dynamic";

function generateTempPassword(len = 10) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export async function POST(req: Request) {
  const session = await getServerAuthSession();
  const user = session?.user;
  const roleKeys: string[] = user?.roleKeys ?? [];
  const isAdmin = roleKeys.includes("ADMIN");

  if (!isAdmin) {
    return err("FORBIDDEN");
  }

  const body: unknown = await req.json(); 
    const parsed = userRegistrationSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ');
      return err("VALIDATION_ERROR", message);
    }
  

  const email = parsed.data.email.trim().toLowerCase();
  const firstName = parsed.data.firstName;
  const lastName = parsed.data.lastName;

  if (!email || !firstName || !lastName) {
    return err("BAD_REQUEST", "Email, first name, and last name are required.");
  }

  const tempPassword = generateTempPassword(10);
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  try {
    const created = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash,
      },
      select: { id: true },
    });

    return ok({ userId: created.id, tempPassword });
  } catch {
    return err("CONFLICT", "Could not create user. Email may already exist.");
  }
}
