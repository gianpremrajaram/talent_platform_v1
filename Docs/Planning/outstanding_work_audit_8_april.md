# Talent Platform V1 — Outstanding Work Audit

**Date:** 8 April 2026
**Method:** Cross-referenced GitHub issue states, commit history, merged PRs, weekly progress updates (weeks 1–4), and codebase inspection to verify actual implementation status.

---

## Summary

| Category | Count |
|----------|-------|
| Total tracked issues | 44 |
| Closed on GitHub | 17 |
| Open on GitHub — code delivered, issue still open | 7 |
| Open on GitHub — partial progress | 6 |
| Open on GitHub — not started | 14 |
| Open PRs in review | 2 |
| Untracked bugs (no GitHub issue) | 3 |

---

## 1. Closed Issues (17)

These are closed on GitHub with code verified on `main`.

| # | Title | Layer | Assignee(s) | Closed via |
|---|-------|-------|-------------|------------|
| #2 | Role/tier mapping decision | L1 | gianpremrajaram, Sjk4824 | PR #63 |
| #5 | TierGate component | L1 | gianpremrajaram | PR #74 |
| #6 | Middleware route protection | L1 | gianpremrajaram | PR #74 |
| #7 | RBAC refactor | L1 | gianpremrajaram | PR #74 |
| #8 | Error handling contract | L1 | gianpremrajaram | PR #78 |
| #12 | Company lifecycle state machine | L1 | gianpremrajaram | PR #78 |
| #13 | Prisma schema extension | L1 | gianpremrajaram | PR #71 |
| #14 | Seed test users | L1 | enqil111, Chengyuyang520 | PR #58 |
| #15 | .env.example | L1 | enqil111, Chengyuyang520 | PR #53 |
| #18 | Recruiter self-registration | L1 | gianpremrajaram | PR #78 |
| #22 | UI state components (loading/empty/error) | L2 | Chengyuyang520 | PR #82 |
| #26 | Student profile form | L2 | Sjk4824 | PRs #51–#57 |
| #34 | Recruiter search (consent-gated, Gold/Platinum) | L4 | gianpremrajaram | PR #78 |
| #47 | Mantis component integration | — | Sjk4824 | Pre-allocation |
| #48 | User journey docs + planning | — | gianpremrajaram | PR #65 |
| #77 | Admin RBAC leak fix | L2 | gianpremrajaram | PR #78 |
| #81 | Legacy code refactor (Azure deployment) | — | Sjk4824 | PR #70 |

---

## 2. Issues to Update on GitHub (code on main, issue still open) (7)

These have functional code merged to `main` but remain open on GitHub. Listed with remaining gaps identified by codebase inspection so that issues can be closed or scoped down before closing.

### #3 — Shared type contracts (`src/types/index.ts`)
- **Assignee:** Sjk4824
- **Layer:** L1 | **Labels:** arch
- **What exists:** `src/types/index.ts` exports `ApiResponse<T>`, `UserStatus`, `CompanyStatus`, `TierKey`, `StudentSearchFilters`, `StudentSearchResult`, `PaginatedStudentResults`, `RecruiterRegistrationInput`, `StudentRegistrationInput`. The original spec listed additional types (`UserTier`, `ConsentStatus`, `StudentProfile`, `RecruiterProfile`, `JobPosting`, `AdminRecommendation`, `StudentCV`, `CompanyConsent`) — the project evolved to use Prisma-generated types directly as the shared contract. All service functions import from Prisma client; all page components consume typed service return values. The parallel-builder divergence risk that #3 was designed to prevent has not materialised.
- **Remaining gap:** Entity types not re-exported from the shared file. Low practical impact — Prisma types are the source of truth and are used consistently.
- **Recommendation:** Closeable — the architectural intent (prevent type divergence across parallel builders) is met via Prisma types + typed service layer.

### #4 — Service layer stubs (`src/lib/services/`)
- **Assignee:** Sjk4824
- **Layer:** L1 | **Labels:** arch
- **What exists:** The spec called for 6 stub files returning dummy data, to be wired later. The project skipped the stub phase and built real implementations directly — the outcome exceeds the spec. `student-services.ts` is a comprehensive module with 30+ functions covering: work experience CRUD, projects CRUD, skills CRUD, achievement tags CRUD, university CRUD, personal info upsert, social links CRUD, CV create/list/delete, and consent status queries. `recruiter-search.ts` provides cursor-paginated consent-gated search. `company-services.ts` handles company status and recruiter access checks. `cv.ts` defines the `CVStorageService` interface for storage abstraction. All page components call service functions — no direct Prisma queries in pages.
- **Remaining gap:** No `job-board.ts` or `recommendations.ts` — these correspond to features not yet built (#28, #35), not to missing architecture.
- **Recommendation:** Closeable — the "pages call typed functions from day one, zero refactoring when real logic lands" goal from the spec is fully achieved. Missing files will be created when their features are built.

### #16 — Login page UI review and refactor
- **Assignee:** Sjk4824
- **Layer:** L1 | **Labels:** feature
- **What exists:** `SignInForm.tsx` handles credentials login for all roles with clear error state ("Invalid email or password"). Register button visible to all unauthenticated users, routes to `/register` with no admin gate. `post-sign-in/page.tsx` implements full role-based routing: Admin → `/membership-dashboard`, Student → `/talent-discovery?view=student`, PENDING_APPROVAL recruiter → `/register/pending`, approved recruiter → `/talent-discovery?view=job-board`. All five acceptance criteria verified met in code.
- **Remaining gap:** None identified.
- **Recommendation:** Closeable.

### #24 — Consent toggle (binary provide/withdraw)
- **Assignee:** Sjk4824
- **Layer:** L2 | **Labels:** feature
- **What exists:** `toggleCompanyConsent` server action (PR #84). `CompanyAccessConsentCard` UI with per-company toggles, summary counts (approved/denied), pagination, and "Revoke All" button. `getMembersWithConsentStatus` service function. Consent writes to `StudentCompanyConsent` table via upsert on composite key. The spec's binary toggle is implemented as per-company granularity — functionally more capable than a single global toggle, since the "Revoke All" button covers the global withdraw use case.
- **Remaining gap:** Bugs B1 (Revoke All doesn't persist) and B2 (consent-default conflicts with recruiter search JOIN) need fixing — see Section 6. Audit logging (#10) is an external dependency assigned to AdamBenmo.
- **Recommendation:** Closeable with B1/B2 tracked separately.

### #25 — Per-company whitelist/blacklist consent
- **Assignee:** Sjk4824
- **Layer:** L2 | **Labels:** feature
- **What exists:** Full per-company consent flow: list of companies with individual toggles, `toggleCompanyConsent` server action, `getMembersWithConsentStatus` service. Recruiter search (`recruiter-search.ts`) enforces per-company consent via JOIN through `StudentCompanyConsent`. The `isVisibleToCompany()` function from the spec is not a standalone function, but the equivalent logic is embedded in the recruiter search query and is the only consumer.
- **Remaining gap:** Same bugs B1/B2 as #24. Audit logging depends on #10.
- **Recommendation:** Closeable with B1/B2 tracked separately.

### #27 — Admin approve/reject company registration
- **Assignee:** enqil111, Chengyuyang520
- **Layer:** L2 | **Labels:** feature
- **What exists:** Admin partners page (`AdminPartnersPage.tsx`) with stat cards and `PartnersTable` component. Approval and suspension modals exist (`SuspensionActionModal.tsx`). UI built across PRs #54, #59, #68, #69.
- **Remaining gap:** Backend not wired to company lifecycle state machine from PR #78. Stat cards show hardcoded mock data. No API route to actually change a company's status from PENDING to APPROVED with tier assignment. Tier selection dropdown during approval not implemented.
- **Recommendation:** Keep open — UI exists but functional approval workflow is not wired.

### #33 — Admin suspend/ban (per-app AppSuspension)
- **Assignee:** enqil111, Chengyuyang520
- **Layer:** L3 | **Labels:** feature
- **What exists:** `AppSuspension` table in schema. `SuspensionActionModal` and `SuspensionHistoryPanel` UI components. `UserManagementTable` with suspend/ban type definitions. Company-services checks `UserStatus` enum.
- **Remaining gap:** No API route to create/lift `AppSuspension` records. `userCanAccessApp()` does not query `AppSuspension` table — only checks `UserStatus` enum on the user record. UI modals not connected to backend.
- **Recommendation:** Keep open — UI shell exists but backend enforcement is missing.

---

## 3. Issues with Partial Progress (6)

Code exists but work remains before acceptance criteria are fully met.

### #17 — Student self-registration with UCL domain check
- **Assignee:** AdamBenmo, enqil111
- **Layer:** L1 | **Labels:** feature
- **What exists:** Shared `/register` page with role selector. Student mode currently shows a placeholder message: "Student registration is managed by UCL. Please contact your programme administrator." `StudentRegistrationInput` type defined. PR #83 (open, enqil111) adds a UI placeholder button for UCL SSO registration.
- **What's missing:** No self-service registration API route for students. No UCL domain validation. No STUDENT role auto-assignment on registration. No post-registration redirect.

### #29 — CV upload, update, delete, replace
- **Assignee:** AdamBenmo
- **Layer:** L3 | **Labels:** feature
- **What exists:** Substantial implementation delivered in PR #75 (Sjk4824). `StudentCVUploadCard` component provides a full upload flow: file picker with drag-and-drop zone, CV name input, version/notes field, tag management with add/remove dialog, file type validation (PDF, DOC, DOCX), and 5MB size limit. Server action (`uploadStudentCVAction`) writes file to local filesystem under `public/media/resumes/{userId}/` and creates `StudentCV` record via `createStudentCV()`. `deleteStudentCVAction` and `deleteStudentCV()` handle removal. Upload, list, and delete are all functional end-to-end.
- **What's missing:** No update/replace flow for existing CVs (can upload new and delete old). Storage backend is local filesystem — not production-ready, pending CV storage decision (#23). `CVStorageService` interface exists in `cv.ts` but is not wired to the upload action.

### #30 — Multiple CV uploads per student
- **Assignee:** AdamBenmo
- **Layer:** L3 | **Labels:** feature
- **What exists:** Delivered in PR #75 (Sjk4824). `StudentCV` model supports 1:many. The upload page allows repeated uploads, each creating a new `StudentCV` record with its own label, notes, and tags. `StudentCVLibraryList` renders all CVs for the user with title, filename, upload date, and tags. Each card supports individual deletion. `getStudentCVs()` returns all CVs ordered by upload date.
- **What's missing:** No primary CV designation. No explicit cap on number of CVs. No inline label editing for existing CVs.

### #31 — CV keyword tagging
- **Assignee:** AdamBenmo
- **Layer:** L3 | **Labels:** feature
- **What exists:** Tag input UI built in `StudentCVUploadCard.tsx` (PR #75, Sjk4824). Students can add and remove keyword tags via a dialog at upload time. Tags stored as `string[]` on the `StudentCV` model. Tags display in `StudentCVLibraryCard` for each CV in the library listing.
- **What's missing:** No editing of tags on existing CVs (tags set at upload time only). No search or filter by tag — the admin recommendation gateway (#35) is intended to consume tags but is not yet built.

### #32 — Account deletion (FK cascade + self-delete)
- **Assignee:** AdamBenmo
- **Layer:** L3 | **Labels:** feature
- **What exists:** Student security settings page with "Delete My Account" button, irreversibility warning checklist, and confirmation dialog (PR #85, Sjk4824). `exportAllData` server action for GDPR data export is fully functional — queries all user relations, packages profile data as JSON and CV files into a ZIP archive, and triggers browser download. Scaffold `DELETE /api/account/delete-user` route exists with transaction support.
- **What's missing:** Student self-delete server action not wired (stub in `action.ts` with TODO comment). Existing `delete-user` route does not cascade to `StudentProfile`, `StudentCompanyConsent`, `StudentCV`, `AdminRecommendation`, `MembershipDashboardMember`, or `AuditLog`. AuditLog anonymisation not implemented.

### #80 — Accessibility gap analysis
- **Assignee:** gianpremrajaram
- **Layer:** — | **Labels:** documentation
- **What exists:** WCAG 2.1 AA referenced in reports. MUI provides built-in ARIA support.
- **What's missing:** No dedicated accessibility audit document. No scoping/timeline estimate. Mantis UI change assessment not completed.

---

## 4. Issues Not Started (14)

No meaningful code, documentation, or decision artefacts found in the codebase for these issues (unless noted).

| # | Title | Layer | Assignee(s) | Blocks / Notes |
|---|-------|-------|-------------|----------------|
| #9 | Zod validation schemas | L1 | AdamBenmo | #26 (form validation), #28 (job posting validation) |
| #10 | Centralised audit logging | L1 | AdamBenmo | #34 (search logging), #35 (recommendation logging) |
| #11 | Centralised student data access layer | L1 | Sjk4824 | #34, #35, #36 |
| #19 | SSO placeholder stub | L1 | AdamBenmo | Nothing (informational for handover) |
| #20 | 2FA review and placeholder | L1 | AdamBenmo, enqil111 | Nothing (informational for handover) |
| #21 | Fix temp password generation (crypto.randomBytes) | L1 | AdamBenmo | #17, #18 |
| #23 | CV storage architecture decision | L2 | AdamBenmo | #29 (CV upload production-readiness) |
| #28 | Recruiter job postings + student browse | L2 | gianpremrajaram | Student browse UI shell exists (`JobOpeningsTable.tsx`, built by Sjk4824) — DataGrid with search, filter, sort, pagination on hardcoded data. Recruiter posting side and API routes not started. |
| #35 | Admin recommendation gateway (A1) | L4 | Sjk4824, gianpremrajaram, enqil111, Chengyuyang520 | #40 |
| #36 | Admin dashboard — Talent Platform metrics | L4 | enqil111, Chengyuyang520 | #39 |
| #37 | Recruiter contacts student (mailto + audit) | L5 | AdamBenmo, gianpremrajaram | #38 |
| #38 | Student notification on contact request | L5 | unassigned | — |
| #39 | Stretch dashboard filters | L5 | unassigned | — |
| #40 | Option B — admin surfaces firms to students | L5 | gianpremrajaram | — |

**Note on #21:** `create-user/route.ts` and `reset-password/route.ts` both still use `Math.random()` for temporary password generation. This is a security issue — `Math.random()` is not cryptographically secure. The fix is a direct replacement with `crypto.randomBytes()`.

---

## 5. Open Pull Requests (2)

| PR | Title | Author | Status | Lines | Related Issue |
|----|-------|--------|--------|-------|---------------|
| #76 | Session timeout during inactivity | Sjk4824 | Open (2 weeks) | +162 / -36 | Not tracked as issue |
| #83 | Student UCL SSO registration placeholder | enqil111 | Open (1 week) | +22 / -4 | #17 |

**PR #76** adds inactivity-based session expiry to the standalone app. Not linked to a tracked issue.

**PR #83** adds a UI placeholder button for UCL SSO student registration. No backend or SSO logic — frontend placeholder only.

---

## 6. Untracked Bugs and Cross-Stream Issues (3)

These were identified in the 6 April progress update and confirmed by codebase inspection. They do not have GitHub issues.

### B1 — "Revoke All Access" does not persist to database
- **Location:** `src/app/talent-discovery-standalone/student-company-consent/CompanyAccessConsentCard.tsx`
- **Description:** The `revokeAll` function sets all company entries to "denied" in React state only. It does not call `toggleCompanyConsent` for any entry. A page reload reverts all changes.
- **Fix:** Iterate the companies list in `revokeAll` and call `toggleCompanyConsent(c.organisationId, false)` for each entry where `organisationId !== null`.
- **Related issues:** #24, #25

### B2 — Consent default conflicts with recruiter search JOIN
- **Location:** `src/lib/services/student-services.ts` (`getMembersWithConsentStatus`) and `src/lib/services/recruiter-search.ts` (`searchConsentedStudents`)
- **Description:** The consent UI returns `consented: true` when no `StudentCompanyConsent` row exists (opt-out model — all companies have access by default). The recruiter search uses an `INNER JOIN` through `StudentCompanyConsent WHERE consented = true`, which returns no result when no row exists. A student who appears as "consented" in the UI is invisible in recruiter search.
- **Fix:** Either change the recruiter search to a `LEFT JOIN` with `COALESCE(consented, true)`, or pre-populate consent rows with `consented = true` for all existing student-company pairs at migration time.
- **Related issues:** #24, #25, #34

### B3 — CV export coupled to local filesystem
- **Location:** `src/app/talent-discovery-standalone/student-security-settings/action.ts` (`exportAllData`)
- **Description:** The data export server action resolves CV file paths as `path.join(process.cwd(), "public", cv.fileUrl)`. If CV storage moves to S3 or external URLs, this will silently skip all CVs in the export archive.
- **Fix:** Must be updated in tandem with any CV storage backend change (#23).
- **Related issues:** #23, #29

---

## 7. Remaining Work by Layer

### L1 — Foundation Lock
L1 is substantially complete. 11 of 20 original L1 issues are closed. Remaining:

| # | Title | Status | Assignee(s) |
|---|-------|--------|-------------|
| #3 | Type contracts | Code on main — closeable (Prisma types serve as contracts) | Sjk4824 |
| #4 | Service stubs | Code on main — closeable (real implementations replace stubs) | Sjk4824 |
| #9 | Zod validation | Not started | AdamBenmo |
| #10 | Audit logging | Not started | AdamBenmo |
| #11 | Student data access layer | Not started | Sjk4824 |
| #16 | Login page | Code on main — closeable | Sjk4824 |
| #17 | Student registration | Partial — placeholder only, PR #83 open | AdamBenmo, enqil111 |
| #19 | SSO placeholder | Not started | AdamBenmo |
| #20 | 2FA placeholder | Not started | AdamBenmo, enqil111 |
| #21 | Temp password fix | Not started | AdamBenmo |

### L2 — Consent, Profiles, Job Board
3 of 7 issues closed (#22, #26, #77). Remaining:

| # | Title | Status | Assignee(s) |
|---|-------|--------|-------------|
| #23 | CV storage decision | Not started | AdamBenmo |
| #24 | Consent toggle | Code on main — closeable (bugs B1, B2 tracked separately) | Sjk4824 |
| #25 | Per-company consent | Code on main — closeable (bugs B1, B2 tracked separately) | Sjk4824 |
| #27 | Admin company approval | UI only — backend not wired | enqil111, Chengyuyang520 |
| #28 | Recruiter job postings | Not started — student browse UI shell exists, recruiter posting + API not built | gianpremrajaram |

### L3 — CV Library & Account Management
0 of 5 issues closed. All open:

| # | Title | Status | Assignee(s) |
|---|-------|--------|-------------|
| #29 | CV upload/CRUD | Partial — upload, list, delete functional; no update/replace; local storage only | AdamBenmo |
| #30 | Multiple CVs | Partial — multiple upload + listing works; no primary CV designation | AdamBenmo |
| #31 | CV keyword tagging | Partial — tag input at upload exists; no edit-in-place or search/filter by tag | AdamBenmo |
| #32 | Account deletion | Partial — UI + GDPR export done; backend cascade missing | AdamBenmo |
| #33 | Admin suspend/ban | UI only — backend not wired | enqil111, Chengyuyang520 |

### L4 — Search, Recommendations, Dashboard
1 of 3 issues closed (#34). Remaining:

| # | Title | Status | Assignee(s) |
|---|-------|--------|-------------|
| #35 | Admin recommendation gateway | Not started (DB model only) | all team |
| #36 | Admin dashboard metrics | Not started (membership metrics exist, no talent metrics) | enqil111, Chengyuyang520 |

### L5 — Notifications & Stretch
0 of 4 issues closed. All open:

| # | Title | Status | Assignee(s) |
|---|-------|--------|-------------|
| #37 | Recruiter contacts student (mailto + audit) | Not started | AdamBenmo, gianpremrajaram |
| #38 | Student notification on contact request | Not started | unassigned |
| #39 | Stretch dashboard filters | Not started | unassigned |
| #40 | Option B — admin surfaces firms to students | Not started | gianpremrajaram |

---

## 8. Open Issue Count by Assignee

| Assignee | Open issues | Closeable / code delivered | Partial | Not started |
|----------|------------|---------------------------|---------|-------------|
| Sjk4824 | 7 | 5 (#3, #4, #16, #24, #25) | 0 | 2 (#11, #35) |
| AdamBenmo | 12 | 0 | 5 (#17, #29, #30, #31, #32) | 7 (#9, #10, #19, #20, #21, #23, #37) |
| enqil111 | 6 | 0 | 3 (#17, #27, #33) | 3 (#20, #35, #36) |
| Chengyuyang520 | 4 | 0 | 2 (#27, #33) | 2 (#35, #36) |
| gianpremrajaram | 5 | 0 | 1 (#80) | 4 (#28, #35, #37, #40) |
| unassigned | 2 | 0 | 0 | 2 (#38, #39) |

Note: Some issues have multiple assignees and are counted under each. "Closeable" means code on main meets acceptance criteria — issue can be closed on GitHub. #29, #30, #31 have significant implementation by Sjk4824 (PRs #75, #84, #85) despite being assigned to AdamBenmo — remaining work on those issues is the gap between current state and full acceptance criteria.

---

## 9. Notes

- Issue status on GitHub may lag behind actual codebase state. This audit used codebase inspection as the primary source of truth for implementation status.
- The original ticket allocation is documented in `Docs/Planning/Talent Platform - Ticket Allocation.md`.
- Weekly progress updates are in `Docs/Weekly Progress Updates/`.
- PR #76 (session timeout) and PR #83 (student registration placeholder) are open and awaiting review.
- The `/ui-test` demo page (shipped in PR #82) should be removed before production deployment.
