"server-only";
// src/lib/services/job-board.ts
// Job board CRUD — Issue #28.
// All write operations are firm-scoped: callers pass recruiterId and the
// service verifies the target job belongs to the recruiter's organisation.

import { prisma } from "@/lib/prisma";
import type {
  JobPostingResult,
  CreateJobPostingInput,
  UpdateJobPostingInput,
  PaginatedJobPostings,
} from "@/types/index";

const PAGE_SIZE = 20;

// ─── Select shape ─────────────────────────────────────────────────────────────

const JOB_SELECT = {
  id: true,
  title: true,
  description: true,
  location: true,
  salaryBand: true,
  roleType: true,
  postedAt: true,
  expiresAt: true,
  isActive: true,
  organisationId: true,
  organisation: { select: { name: true } },
} as const;

// Shape returned by Prisma for a JobPosting row with JOB_SELECT applied.
type JobPostingRow = {
  id: string;
  title: string;
  description: string;
  location: string;
  salaryBand: string | null;
  roleType: string;
  postedAt: Date;
  expiresAt: Date | null;
  isActive: boolean;
  organisationId: number;
  organisation: { name: string };
};

function toJobResult(job: JobPostingRow): JobPostingResult {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    location: job.location,
    salaryBand: job.salaryBand ?? null,
    roleType: job.roleType,
    postedAt: job.postedAt.toISOString(),
    expiresAt: job.expiresAt ? job.expiresAt.toISOString() : null,
    isActive: job.isActive,
    organisationId: job.organisationId,
    organisation: { name: job.organisation.name },
  };
}

// ─── Organisation lookup ──────────────────────────────────────────────────────

async function getOrgId(recruiterId: string): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: { id: recruiterId },
    select: { organisationId: true },
  });
  return user?.organisationId ?? null;
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function createJobPosting(
  recruiterId: string,
  input: CreateJobPostingInput,
): Promise<JobPostingResult> {
  const orgId = await getOrgId(recruiterId);
  if (!orgId) throw new Error("RECRUITER_NO_ORG");

  // A job posted with a past expiry date must start inactive.
  const expiresAtDate = input.expiresAt ? new Date(input.expiresAt) : null;
  const isActive = expiresAtDate !== null ? expiresAtDate > new Date() : true;

  const job = await prisma.jobPosting.create({
    data: {
      organisationId: orgId,
      createdByUserId: recruiterId,
      title: input.title,
      description: input.description,
      location: input.location,
      salaryBand: input.salaryBand ?? null,
      roleType: input.roleType,
      expiresAt: expiresAtDate,
      isActive,
    },
    select: JOB_SELECT,
  });

  return toJobResult(job);
}

// ─── LIST OWN FIRM'S POSTINGS ─────────────────────────────────────────────────

export async function listJobsForFirm(
  recruiterId: string,
): Promise<JobPostingResult[]> {
  const orgId = await getOrgId(recruiterId);
  if (!orgId) return [];

  const jobs = await prisma.jobPosting.findMany({
    where: { organisationId: orgId },
    orderBy: { postedAt: "desc" },
    select: JOB_SELECT,
  });

  return jobs.map(toJobResult);
}

// ─── LIST ACTIVE JOBS (public browse) ────────────────────────────────────────

export async function listActiveJobs(
  cursor?: string,
): Promise<PaginatedJobPostings> {
  const now = new Date();

  const results = await prisma.jobPosting.findMany({
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    where: {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { postedAt: "desc" },
    select: JOB_SELECT,
  });

  const hasMore = results.length > PAGE_SIZE;
  const page = hasMore ? results.slice(0, PAGE_SIZE) : results;
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  return { jobs: page.map(toJobResult), nextCursor };
}

// ─── UPDATE (firm-scoped) ─────────────────────────────────────────────────────

export async function updateJobPosting(
  jobId: string,
  recruiterId: string,
  patch: UpdateJobPostingInput,
): Promise<JobPostingResult | null> {
  const orgId = await getOrgId(recruiterId);
  if (!orgId) return null;

  const existing = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    select: { organisationId: true, isActive: true, expiresAt: true },
  });
  if (!existing || existing.organisationId !== orgId) return null;

  // Guard: block explicit reactivation of an expired job.
  // The caller must extend the expiry date first (either in the same patch or
  // via a prior edit). Using patch.expiresAt as the effective expiry allows
  // { isActive: true, expiresAt: "<future>" } to succeed in one atomic call.
  if (patch.isActive === true) {
    // null means the expiry is being cleared → evergreen, never blocked.
    // undefined means no change to expiresAt → fall back to existing value.
    const effectiveExpiry =
      patch.expiresAt !== undefined
        ? (patch.expiresAt === null ? null : new Date(patch.expiresAt))
        : existing.expiresAt;
    const now = new Date();
    if (effectiveExpiry !== null && effectiveExpiry <= now) {
      throw new Error("EXPIRED_JOB");
    }
  }

  // ── Auto-sync isActive with expiresAt ──────────────────────────────────────
  // Caller intent (explicit isActive in patch) always wins.
  // When caller only changes the date, derive isActive automatically:
  //   • new date in the past   → deactivate (prevents zombie active listings)
  //   • new date in the future → reactivate ONLY if the job was previously
  //     expired (preserves deliberate manual deactivation)
  let effectiveIsActive = patch.isActive;

  if (patch.expiresAt !== undefined && patch.isActive === undefined) {
    if (patch.expiresAt === null) {
      // Clearing the expiry makes the posting evergreen; reactivate if it was
      // previously expired so it doesn't stay stuck in an inactive state.
      const wasExpired =
        existing.expiresAt !== null && existing.expiresAt <= new Date();
      if (wasExpired) effectiveIsActive = true;
    } else {
      const newExpiry = new Date(patch.expiresAt);
      const now = new Date();
      if (newExpiry <= now) {
        effectiveIsActive = false;
      } else {
        const wasExpired = existing.expiresAt !== null && existing.expiresAt <= now;
        if (wasExpired) effectiveIsActive = true;
      }
    }
  }

  const job = await prisma.jobPosting.update({
    where: { id: jobId },
    data: {
      ...(patch.title !== undefined && { title: patch.title }),
      ...(patch.description !== undefined && { description: patch.description }),
      ...(patch.location !== undefined && { location: patch.location }),
      ...(patch.salaryBand !== undefined && { salaryBand: patch.salaryBand }),
      ...(patch.roleType !== undefined && { roleType: patch.roleType }),
      ...(effectiveIsActive !== undefined && { isActive: effectiveIsActive }),
      ...(patch.expiresAt !== undefined && {
        expiresAt: patch.expiresAt ? new Date(patch.expiresAt) : null,
      }),
    },
    select: JOB_SELECT,
  });

  return toJobResult(job);
}

// ─── DELETE (firm-scoped, hard delete) ───────────────────────────────────────

export async function deleteJobPosting(
  jobId: string,
  recruiterId: string,
): Promise<boolean> {
  const orgId = await getOrgId(recruiterId);
  if (!orgId) return false;

  const existing = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    select: { organisationId: true },
  });
  if (!existing || existing.organisationId !== orgId) return false;

  await prisma.jobPosting.delete({ where: { id: jobId } });
  return true;
}
