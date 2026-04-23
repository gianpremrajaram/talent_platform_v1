"server-only";
// src/lib/services/applications.ts
// Job application service — student applies to a job, recruiter views applicants.

import { prisma } from "@/lib/prisma";
import type {
  JobApplicationInput,
  JobApplicationResult,
  JobApplicationsForJob,
} from "@/types/index";

// ─── Select shape ─────────────────────────────────────────────────────────────

const APPLICATION_SELECT = {
  id: true,
  jobId: true,
  studentId: true,
  cvId: true,
  coverLetter: true,
  appliedAt: true,
  student: { select: { firstName: true, lastName: true, email: true } },
  job: { select: { title: true, organisation: { select: { name: true } } } },
  cv: { select: { id: true, label: true, fileUrl: true } },
} as const;

type ApplicationRow = {
  id: string;
  jobId: string;
  studentId: string;
  cvId: string | null;
  coverLetter: string | null;
  appliedAt: Date;
  student: { firstName: string; lastName: string; email: string };
  job: { title: string; organisation: { name: string } };
  cv: { id: string; label: string; fileUrl: string } | null;
};

function toResult(row: ApplicationRow): JobApplicationResult {
  return {
    id: row.id,
    jobId: row.jobId,
    studentId: row.studentId,
    cvId: row.cvId,
    coverLetter: row.coverLetter,
    appliedAt: row.appliedAt.toISOString(),
    student: row.student,
    job: row.job,
    cv: row.cv,
  };
}

// ─── APPLY ────────────────────────────────────────────────────────────────────

/**
 * Submit a job application. Idempotent — returns the existing application
 * if the student has already applied. Throws if the job doesn't exist or
 * is no longer active.
 */
export async function applyToJob(
  studentId: string,
  jobId: string,
  input: JobApplicationInput,
): Promise<JobApplicationResult> {
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    select: { id: true, isActive: true, expiresAt: true },
  });

  if (!job) throw new Error("JOB_NOT_FOUND");
  if (!job.isActive) throw new Error("JOB_INACTIVE");
  if (job.expiresAt && job.expiresAt <= new Date()) throw new Error("JOB_EXPIRED");

  // Return existing application rather than erroring — safe to call twice.
  const existing = await prisma.jobApplication.findUnique({
    where: { jobId_studentId: { jobId, studentId } },
    select: APPLICATION_SELECT,
  });
  if (existing) return toResult(existing);

  const application = await prisma.jobApplication.create({
    data: {
      jobId,
      studentId,
      cvId: input.cvId ?? null,
      coverLetter: input.coverLetter ?? null,
    },
    select: APPLICATION_SELECT,
  });

  return toResult(application);
}

// ─── STUDENT: own applications ────────────────────────────────────────────────

export async function getStudentApplications(
  studentId: string,
): Promise<JobApplicationResult[]> {
  const rows = await prisma.jobApplication.findMany({
    where: { studentId },
    orderBy: { appliedAt: "desc" },
    select: APPLICATION_SELECT,
  });
  return rows.map(toResult);
}

/** Check whether a student has already applied for a given job. */
export async function hasApplied(
  studentId: string,
  jobId: string,
): Promise<boolean> {
  const row = await prisma.jobApplication.findUnique({
    where: { jobId_studentId: { jobId, studentId } },
    select: { id: true },
  });
  return row !== null;
}

// ─── RECRUITER: applications for their firm's jobs ────────────────────────────

/**
 * Returns all applications for jobs belonging to the recruiter's organisation,
 * grouped by job posting. Recruiter must have an organisationId set.
 */
export async function getApplicationsForFirm(
  recruiterId: string,
): Promise<JobApplicationsForJob[]> {
  const recruiter = await prisma.user.findUnique({
    where: { id: recruiterId },
    select: { organisationId: true },
  });

  if (!recruiter?.organisationId) return [];

  const jobs = await prisma.jobPosting.findMany({
    where: { organisationId: recruiter.organisationId, approvalStatus: "APPROVED" },
    orderBy: { postedAt: "desc" },
    select: {
      id: true,
      title: true,
      organisation: { select: { name: true } },
      applications: {
        orderBy: { appliedAt: "desc" },
        select: APPLICATION_SELECT,
      },
    },
  });

  return jobs.map((job) => ({
    jobId: job.id,
    jobTitle: job.title,
    organisationName: job.organisation.name,
    applications: job.applications.map(toResult),
  }));
}
