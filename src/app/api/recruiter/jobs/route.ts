// src/app/api/recruiter/jobs/route.ts
// Recruiter job management — Issue #28.
// POST: create a job posting (Gold+ only, RECRUITER role required).
// GET:  list this firm's own job postings.

import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { userCanAccessFeature } from "@/lib/access-control";
import { checkRecruiterAccess } from "@/lib/services/company-services";
import { createJobPosting, listJobsForFirm } from "@/lib/services/job-board";
import { ok, err } from "@/lib/api-response";
import { jobPostingSchema } from "@/lib/Validation/JobPosting";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerAuthSession();
  if (!session?.user) return err("UNAUTHORIZED");

  const sessionUser = session.user as { id: string; roleKeys?: string[] };
  const userId = sessionUser.id;
  const roleKeys: string[] = sessionUser.roleKeys ?? [];

  if (!roleKeys.includes("RECRUITER") && !roleKeys.includes("ADMIN")) {
    return err("FORBIDDEN");
  }

  if (!roleKeys.includes("ADMIN")) {
    const canPost = await userCanAccessFeature(userId, "job-board-post");
    if (!canPost) {
      return err("FORBIDDEN", "Job posting is available to Gold and Platinum members only.");
    }

    const access = await checkRecruiterAccess(userId);
    if (!access.allowed) {
      return err("FORBIDDEN", "Your company account is not yet approved.");
    }
  }

  const body = await req.json();
  const parsed = jobPostingSchema.safeParse(body);
  if (!parsed.success) {
    return err("BAD_REQUEST", parsed.error.issues[0]?.message ?? "Invalid request.");
  }

  try {
    const job = await createJobPosting(userId, parsed.data);
    return ok(job, 201);
  } catch (e) {
    if (e instanceof Error && e.message === "RECRUITER_NO_ORG") {
      return err("BAD_REQUEST", "Your account is not linked to an organisation.");
    }
    return err("INTERNAL");
  }
}

export async function GET() {
  const session = await getServerAuthSession();
  if (!session?.user) return err("UNAUTHORIZED");

  const sessionUser = session.user as { id: string; roleKeys?: string[] };
  const userId = sessionUser.id;
  const roleKeys: string[] = sessionUser.roleKeys ?? [];

  if (!roleKeys.includes("RECRUITER") && !roleKeys.includes("ADMIN")) {
    return err("FORBIDDEN");
  }

  const jobs = await listJobsForFirm(userId);
  return ok(jobs);
}
