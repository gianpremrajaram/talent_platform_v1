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
