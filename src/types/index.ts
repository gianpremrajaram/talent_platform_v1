// src/types/index.ts
// Central type contracts for the Talent Platform.
// All API routes, service functions, and components import from here.

// ─────────────────────────────────────────────
// API RESPONSE SHAPE (#8)
// ─────────────────────────────────────────────

/**
 * Standard API response envelope.
 * Every API route returns this shape so clients can always destructure
 * { success, data, error } without guessing the shape per route.
 */
export type ApiResponse<T = null> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

/** Individual user approval state. Separate from company-level CompanyStatus. */
export enum UserStatus {
  ACTIVE = "ACTIVE",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  SUSPENDED = "SUSPENDED",
}

/** Company lifecycle state — controls whether recruiter can access talent features. */
export enum CompanyStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED",
}

/** Membership tier keys — matches MembershipTier.key in the DB. */
export enum TierKey {
  BRONZE = "BRONZE",
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
}

// ─────────────────────────────────────────────
// RECRUITER SEARCH (#34)
// ─────────────────────────────────────────────

export interface StudentSearchFilters {
  location?: string;
  degreeProgram?: string;
  skills?: string[];
  cursor?: string;
}

export interface StudentSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  degreeProgram: string | null;
  location: string | null;
  skills: string[];
}

export interface PaginatedStudentResults {
  students: StudentSearchResult[];
  nextCursor: string | null;
}

// ADMIN RECOMMENDATION GATEWAY (#35)

/**
 * Filter input for the admin candidate panel and recruiter talent search.
 * Uses exact-match only (no LIKE %...%) so results stay precise.
 */
export interface CandidateFilters {
  /** Required: scopes the consent LEFT JOIN to this firm's consented students. */
  firmId: number;
  /** Exact city match (case-insensitive). */
  city?: string;
  /** Exact country match (case-insensitive). */
  country?: string;
  /** Exact degree program match (case-insensitive). */
  degreeProgram?: string;
  /** Skill tag terms; each must exact-match a StudentSkill.name. */
  skills?: string[];
  /** CV tag terms; each must exact-match a StudentCV.tags entry. */
  cvTags?: string[];
  /** Cursor for pagination (cuid of last row from previous page). */
  cursor?: string;
}

/**
 * A student shown in the admin candidate panel or on a recruiter's
 * Recommended Students tab. Includes degree, location, skills, and CV count.
 */
export interface RecommendationCandidate {
  id: string;
  firstName: string;
  lastName: string;
  degreeProgram: string | null;
  location: string | null;
  skills: string[];
  cvCount: number;
}

export interface PaginatedCandidates {
  candidates: RecommendationCandidate[];
  nextCursor: string | null;
}

/** A single recommendation row, as shown in the admin's right-panel list. */
export interface RecommendationRow {
  id: string;
  studentId: string;
  firmId: number;
  adminId: string;
  createdAt: string;       // ISO string
  revokedAt: string | null; // ISO string or null
  student: {
    firstName: string;
    lastName: string;
    email: string;
  };
  firm: { name: string };
}

export interface AddRecommendationInput {
  studentId: string;
  firmId: number;
}

// ─────────────────────────────────────────────
// JOB BOARD (#28)
// ─────────────────────────────────────────────

export interface JobPostingResult {
  id: string;
  title: string;
  description: string;
  location: string;
  salaryBand: string | null;
  roleType: string;
  postedAt: string;       // ISO string
  expiresAt: string | null; // ISO string or null
  isActive: boolean;
  organisationId: number;
  organisation: { name: string };
}

export interface CreateJobPostingInput {
  title: string;
  description: string;
  location: string;
  salaryBand?: string;
  roleType: string;
  expiresAt?: string;
}

export interface UpdateJobPostingInput {
  title?: string;
  description?: string;
  location?: string;
  salaryBand?: string;
  roleType?: string;
  expiresAt?: string | null;
  isActive?: boolean;
}

export interface PaginatedJobPostings {
  jobs: JobPostingResult[];
  nextCursor: string | null;
}

// ─────────────────────────────────────────────
// REGISTRATION (#18)
// ─────────────────────────────────────────────

export interface RecruiterRegistrationInput {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  password: string;
}

export interface StudentRegistrationInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

// ─────────────────────────────────────────────
// JOB APPLICATIONS
// ─────────────────────────────────────────────

export interface JobApplicationInput {
  cvId?: string;
  coverLetter?: string;
}

export interface JobApplicationResult {
  id: string;
  jobId: string;
  studentId: string;
  cvId: string | null;
  coverLetter: string | null;
  appliedAt: string; // ISO string
  student: { firstName: string; lastName: string; email: string };
  job: { title: string; organisation: { name: string } };
  cv: { id: string; label: string; fileUrl: string } | null;
}

/** Grouped view for recruiter: one job with all its applicants. */
export interface JobApplicationsForJob {
  jobId: string;
  jobTitle: string;
  organisationName: string;
  applications: JobApplicationResult[];
}
