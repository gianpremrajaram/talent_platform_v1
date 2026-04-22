// src/app/api/recruiter/applications/route.ts
// Returns all job applications for the recruiter's firm, grouped by job.
// RECRUITER role required.

import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { getApplicationsForFirm } from "@/lib/services/applications";
import { ok, err } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerAuthSession();
  if (!session?.user) return err("UNAUTHORIZED");

  const roleKeys: string[] = (session.user as any).roleKeys ?? [];
  if (!roleKeys.includes("RECRUITER") && !roleKeys.includes("ADMIN")) {
    return err("FORBIDDEN", "Recruiter access required.");
  }

  const recruiterId = session.user.id;
  const grouped = await getApplicationsForFirm(recruiterId);
  return ok(grouped);
}
