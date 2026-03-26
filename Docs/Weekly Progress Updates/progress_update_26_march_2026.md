# Talent Platform V1 — Progress Update

**Date:** 26 March 2026
**Reporting period:** 19–26 March 2026 (Week 3)
**Baseline:** Changes measured against the state reported in the 19 March update

---

## Summary

Week 3 delivered the L1 foundation lock and pushed one feature stream ahead into L4. The TierGate component, middleware route protection, and RBAC refactor were completed and merged, closing the three-issue access control cluster that gates all subsequent feature work. A combined delivery then completed the error handling contract, company lifecycle state machine, and recruiter self-registration with pending-approval flow, while also shipping a consent-gated recruiter search service and its API endpoint. Shared type contracts were bootstrapped as part of this work. A security bug allowing admin-only navigation and page access to leak into recruiter sessions was patched in the same delivery. On the student-facing side, the CV library moved from a UI shell to functional local-storage upload and rendering. An inactivity session timeout feature is under review in an open pull request. Admin panel styling was refined with colour and sizing adjustments to data tables.

---

## Access Control — L1 Foundation Lock

The three-issue access control cluster (#5, #6, #7) was completed and merged via PR #74, closing the last architectural prerequisite for parallel L2+ feature work.

**TierGate component (#5).** A reusable `<TierGate>` client component that reads tier and role from the JWT session with no additional database calls. Supports `requiredTier`, `requiredRole`, and a combined `requireAll` mode. ADMIN role bypasses all gates. A development bypass toggle (`NEXT_PUBLIC_TIER_GATE_BYPASS`) is available for local testing. All parallel builders can now wrap restricted UI sections with `<TierGate requiredTier="GOLD">` instead of writing inline tier checks.

**Middleware route protection (#6).** A Next.js middleware with declarative route rules covering `/talent-discovery`, `/membership-dashboard`, `/account`, and `/api/account` paths. Unauthenticated users are redirected to sign-in with a callback URL. Talent discovery sub-views (`student`, `cv-library`, `job-board`) have individual tier and role requirements enforced before page render. Static route rules protect admin-only paths. Denial redirects to a dedicated `/access-denied` page with a reason code.

**RBAC refactor (#7).** Inline tier checks in the talent discovery page were replaced with a centralised feature-permission config map in `access-control.ts`. Two new access functions were added: `userCanAccessFeature()` for server-side DB-backed checks in API routes and server components, and `canAccessFeature()` for client-side JWT-based checks with no database round-trip. The feature-permission map (`recruiter-search`, `cv-library`, `job-board-post`, `job-board-browse`, `student-profile`, `admin-panel`) serves as the single source of truth for both layers.

**Mapped tickets:** #5 (TierGate — closed), #6 (middleware — closed), #7 (RBAC refactor — closed)

---

## L1 Completion, Recruiter Search, and Security Patch

A combined delivery via PR #78 closed three further L1 foundation items, shipped the first L4 feature, and patched a security bug.

**Error handling contract (#8).** A shared `ApiResponse<T>` type was defined in `src/types/index.ts`, providing a standard envelope (`{ success, data?, error? }`) for all API routes. Helper functions `ok()` and `err()` in `src/lib/api-response.ts` construct these responses with preset HTTP status codes and error messages. The recruiter registration and search endpoints were built using this pattern as reference implementations.

**Company lifecycle state machine (#12).** A `UserStatus` enum (`ACTIVE`, `PENDING_APPROVAL`, `SUSPENDED`) was added to the Prisma schema alongside a `domain` field on the Organisation model. A new `company-services.ts` module in the service layer provides `getCompanyStatus()`, `getUserStatus()`, and `checkRecruiterAccess()` — the last of which evaluates both company status and individual user status, returning a typed reason code on denial. The existing `userCanAccessApp()` function was extended to call `checkRecruiterAccess()` for any user with the RECRUITER role, blocking access when the company is pending, suspended, or banned, or when the individual user is pending or suspended.

**Recruiter self-registration (#18).** A public `/register` page was created with a role selector toggling between recruiter and student modes. The recruiter flow collects name, work email, company name, and password, and posts to `/api/auth/register`. The API route extracts the email domain, finds or creates an Organisation (with PENDING status for new companies), creates the user with `PENDING_APPROVAL` status and the RECRUITER role, and returns a confirmation. The post-registration view informs the user their account is awaiting admin approval. Student registration is deferred to a separate implementation (#17) and currently displays a placeholder message.

**Recruiter search — consent-gated, Gold/Platinum only (#34).** A new `recruiter-search.ts` service function performs cursor-paginated student search, filtered by location, degree programme, and skills. Only students who have explicitly consented to the recruiter's organisation are included in results — enforced by a JOIN through `StudentCompanyConsent`. The `GET /api/recruiter/search` endpoint checks RECRUITER role, verifies Gold or Platinum tier via `userCanAccessFeature()`, and delegates to the service function. Shared type contracts (`StudentSearchFilters`, `StudentSearchResult`, `PaginatedStudentResults`) were defined in `src/types/index.ts`.

**Admin RBAC leak patch (#77).** A bug was identified where non-admin partner users could see admin-only navigation items (Project, Partners, Students) in the membership dashboard sidebar, and could access admin pages via direct URL — exposing cross-company data or causing runtime crashes. The fix added an `adminOnly` flag to sidebar navigation items and filters them based on session role keys. Server-side admin pages were updated to check for ADMIN role before rendering.

**Mapped tickets:** #8 (error handling contract — code delivered, issue remains open), #12 (company lifecycle — code delivered, issue remains open), #18 (recruiter registration — code delivered, issue remains open), #34 (recruiter search — code delivered, issue remains open), #77 (admin RBAC leak — code delivered, issue remains open)

---

## CV Library

The CV library advanced from a UI shell to a functional upload and display flow via PR #75. The upload component was wired to a server action that persists CV files to local storage via a new student services function, with references tracked in the database. A `.gitkeep` was added for the local storage directory and `.gitignore` was updated to exclude uploaded files. The library listing page was rebuilt with a dedicated `StudentCVLibraryList` component rendering stored CVs. The upload card component was refactored to improve layout and interaction patterns.

**Mapped tickets:** #29 (CV upload — open, further progress), #30 (multiple CVs — open, listing delivered)

---

## Admin Panel

Admin panel data table components received styling adjustments via PR #73, including colour and text size refinements across the partner and student management pages. The `UserManagementTable` component was extended with additional row formatting, while the `PartnersTable` was simplified by removing unused inline styles.

**Mapped tickets:** #27 (admin company approval — open, ongoing), #33 (admin suspend/ban — open, ongoing)

---

## In-Progress Work (Unmerged)

**Session timeout (PR #76, open).** An inactivity-based session timeout feature for the standalone app is under review. The implementation adds 162 lines across the session handling layer, detecting long periods of inactivity and triggering session expiry. This is not yet merged into main.

---

## What Comes Next

With the L1 access control layer locked (#5, #6, #7) and the error handling, company lifecycle, and registration foundations in place (#8, #12, #18), the project is positioned for parallel L2 feature development. The immediate priorities are:

- **Student self-registration** (#17) — completing the student-side registration flow on the shared `/register` page, with UCL domain validation
- **Consent toggle and per-company consent** (#24, #25) — wiring the existing `StudentCompanyConsent` table to service functions and the student UI
- **Recruiter job posting** (#28) — text-only job postings for partner users
- **Admin company approval wiring** (#27) — connecting the approval UI to the company lifecycle state machine now that #12 is in place
- **Service layer stubs and type contracts completion** (#3, #4) — filling in the remaining stub files and types that other streams will import
- **Data validation layer** (#9) — Zod schemas for form validation

Open issues #8, #12, #18, and #34 have code delivered on main but remain open on GitHub pending formal review or testing sign-off.

**Key open tickets for next phase:** #3, #4, #9, #17, #24, #25, #27, #28

---

## Ticket Status Overview

| Status | Count | Tickets |
|--------|-------|---------|
| Closed this period | 3 | #5, #6, #7 |
| Closed previously | 5 | #2, #13, #14, #15, #47 |
| Code on main (issue open) | 9 | #8, #12, #16, #18, #26, #27, #33, #34, #77 |
| In progress (PR open) | 1 | PR #76 (session timeout) |
| In progress (UI/partial) | 2 | #29, #30 |
| Not yet started | 22 | #3, #4, #9–#11, #17, #19–#25, #28, #31–#32, #35–#40 |

All ticket numbers reference [github.com/gianpremrajaram/scaffold/issues](https://github.com/gianpremrajaram/scaffold/issues).
