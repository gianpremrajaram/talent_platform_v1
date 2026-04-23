// src/app/api/jobs/[jobId]/apply/route.ts
// Student applies to a job posting. STUDENT role required.

import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { applyToJob } from "@/lib/services/applications";
import { ok, err } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const session = await getServerAuthSession();
  if (!session?.user) return err("UNAUTHORIZED");

  const roleKeys: string[] = (session.user as any).roleKeys ?? [];
  if (!roleKeys.includes("STUDENT")) {
    return err("FORBIDDEN", "Only students can apply for jobs.");
  }

  const studentId = session.user.id;
  const { jobId } = await params;

  let body: { cvId?: string; coverLetter?: string } = {};
  try {
    body = await req.json();
  } catch {
    // ignore parse error, validation below will catch missing cvId
  }

  if (!body.cvId) {
    return err("BAD_REQUEST", "A CV is required to apply for a job.");
  }

  try {
    const application = await applyToJob(studentId, jobId, {
      cvId: body.cvId,
      coverLetter: body.coverLetter,
    });
    return ok(application);
  } catch (e: any) {
    if (e?.message === "JOB_NOT_FOUND") return err("NOT_FOUND", "Job not found.");
    if (e?.message === "JOB_INACTIVE") return err("BAD_REQUEST", "This job is no longer accepting applications.");
    if (e?.message === "JOB_EXPIRED") return err("BAD_REQUEST", "This job posting has expired.");
    return err("INTERNAL", "Could not submit application.");
  }
}
