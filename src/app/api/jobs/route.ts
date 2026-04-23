// src/app/api/jobs/route.ts
// Active job listings browse feed — Issue #28.
// Available to: STUDENT role, Silver+ (rank >= 2) recruiter, ADMIN.
// Requires job-board-browse feature access (config in access-control.ts).
// Cursor-paginated. Returns only isActive=true and not yet expired postings.

import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { userCanAccessFeature } from "@/lib/access-control";
import { listActiveJobs } from "@/lib/services/job-board";
import { ok, err } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerAuthSession();
  if (!session?.user) return err("UNAUTHORIZED");

  const sessionUser = session.user as { id: string; roleKeys?: string[] };
  const userId = sessionUser.id;
  const roleKeys: string[] = sessionUser.roleKeys ?? [];

  if (!roleKeys.includes("ADMIN")) {
    const canBrowse = await userCanAccessFeature(userId, "job-board-browse");
    if (!canBrowse) {
      return err("FORBIDDEN", "Job board browsing is available to Silver and above members.");
    }
  }

  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor") ?? undefined;

  const isStudent = roleKeys.includes("STUDENT");
  const results = await listActiveJobs(cursor, isStudent ? userId : undefined);
  return ok(results);
}
