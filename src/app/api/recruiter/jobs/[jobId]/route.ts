// src/app/api/recruiter/jobs/[jobId]/route.ts
// Update or delete a specific job posting — Issue #28.
// PATCH: edit fields or deactivate (isActive: false) / reactivate (isActive: true).
// DELETE: hard delete.
// Both operations are firm-scoped: only the posting firm's recruiters may mutate.

import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { checkRecruiterAccess } from "@/lib/services/company-services";
import { updateJobPosting, deleteJobPosting } from "@/lib/services/job-board";
import { ok, err } from "@/lib/api-response";
import { updateJobPostingSchema } from "@/lib/validation/JobPosting";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  props: { params: Promise<{ jobId: string }> },
) {
  const session = await getServerAuthSession();
  if (!session?.user) return err("UNAUTHORIZED");

  const sessionUser = session.user as { id: string; roleKeys?: string[] };
  const userId = sessionUser.id;
  const roleKeys: string[] = sessionUser.roleKeys ?? [];

  if (!roleKeys.includes("RECRUITER") && !roleKeys.includes("ADMIN")) {
    return err("FORBIDDEN");
  }

  if (!roleKeys.includes("ADMIN")) {
    const access = await checkRecruiterAccess(userId);
    if (!access.allowed) {
      return err("FORBIDDEN", "Your company account is not yet approved.");
    }
  }

  const body = await req.json();
  const parsed = updateJobPostingSchema.safeParse(body);
  if (!parsed.success) {
    return err("BAD_REQUEST", parsed.error.issues[0]?.message ?? "Invalid request.");
  }

  const { jobId } = await props.params;

  let job;
  try {
    job = await updateJobPosting(jobId, userId, parsed.data);
  } catch (e) {
    if (e instanceof Error && e.message === "EXPIRED_JOB") {
      return err("BAD_REQUEST", "Cannot activate an expired job posting. Please edit and extend the expiry date first.");
    }
    return err("INTERNAL");
  }

  if (!job) return err("NOT_FOUND");
  return ok(job);
}

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ jobId: string }> },
) {
  const session = await getServerAuthSession();
  if (!session?.user) return err("UNAUTHORIZED");

  const sessionUser = session.user as { id: string; roleKeys?: string[] };
  const userId = sessionUser.id;
  const roleKeys: string[] = sessionUser.roleKeys ?? [];

  if (!roleKeys.includes("RECRUITER") && !roleKeys.includes("ADMIN")) {
    return err("FORBIDDEN");
  }

  if (!roleKeys.includes("ADMIN")) {
    const access = await checkRecruiterAccess(userId);
    if (!access.allowed) {
      return err("FORBIDDEN", "Your company account is not yet approved.");
    }
  }

  const { jobId } = await props.params;
  const deleted = await deleteJobPosting(jobId, userId);
  if (!deleted) return err("NOT_FOUND");

  return ok({ deleted: true });
}
