# Talent Platform V1 — Progress Update

**Date:** 6 April 2026
**Reporting period:** 26 March – 6 April 2026 (Week 4)
**Baseline:** Changes measured against the state reported in the 26 March update

---

## Summary

Week 4 delivered three merged PRs advancing the student-facing layer of the platform. Shared UI state primitives (loading, empty, error) were shipped and all three immediately integrated into `PartnerFullView`'s student search panel, closing the outstanding UI standards issue. Two new student pages were delivered — per-company consent management and account security settings — completing the student-side visibility control flow and the data export feature. Account deletion UI was built and confirmed correct, but the backend server action is not yet wired. Two cross-stream inconsistencies introduced this week require attention before the recruiter search and consent systems can be considered production-ready: the "Revoke All" action in the consent UI does not persist, and the consent-default logic conflicts with the recruiter search join. Both are called out in detail below.

---

## Shared UI State Components — Issue #22

**PR #82, merged 27 March. Author: Chengyuyang520.**

Three shared components were added to `src/components/ui/` to replace ad hoc inline spinners, empty messages, and unhandled render errors across the codebase.

**`LoadingState`** (`src/components/ui/LoadingState.tsx`) renders a centred `CircularProgress` spinner with an optional `message` prop (defaults to `"Loading…"`) and `size` prop (defaults to `40`).

**`EmptyState`** (`src/components/ui/EmptyState.tsx`) renders a centred empty-state block. Props: `message` (defaults to `"No data found."`), optional `description` (secondary caption), optional `icon` (any `ReactNode`), and an optional `actionLabel`/`onAction` pair that renders an outlined button. All optional — works as a one-liner with no props.

**`ErrorBoundary`** (`src/components/ui/ErrorBoundary.tsx`) is a React class component wrapping any subtree that might throw during render. Accepts a `fallback` prop; if omitted, renders a styled red alert box with the error message and a "Try again" reset link. Console-logs the full component stack via `componentDidCatch`. Has a `reset()` method for programmatic recovery. A `TODO` in `componentDidCatch` notes it should be wired to a real logging service when one is available.

**`PartnerFullView.tsx` integration — all three components wired in the same PR.** `src/components/talent-discovery/PartnerFullView.tsx` was updated with the first real usage of all three components, replacing a single inline results block that handled loading, empty, and error states with ad hoc logic. The specific changes:

- `LoadingState` is rendered when `loading && students.length === 0` (i.e. a search is in flight and there are no prior results to show), with the message `"Searching students…"`.
- `EmptyState` is rendered when `searched && !loading && students.length === 0`, with message `"No matching students found."`, description `"Try adjusting your search filters."`, and a "Clear filters" action button that resets `filters`, `students`, `nextCursor`, `searched`, and `error` back to their initial values.
- The results list (`students.map(...)`) is now conditionally rendered only when `searched && students.length > 0`, removing the old inline ternary that produced `"No matching students found."` as a `<p>`.
- `ErrorBoundary` wraps the entire `StudentSearchPanel` subtree inside the `TierGate` — so any unhandled render error in the search panel shows the error boundary UI rather than crashing the page.

A dev-only demo page at `/ui-test` renders all three components with labelled examples. **This page should be removed before production deploy.**

**All new feature pages should use these components.** Do not add new inline spinners, empty-state `<p>` tags, or try/catch render guards — extend these shared components instead.

**Mapped tickets:** #22 (closed)

---

## Student Company Consent Management

**PR #84, merged 7 April. Author: Sadhana Jayakumar (Sjk4824).**

Students can now view and toggle which partner companies have access to their profile and CVs. This wires the `StudentCompanyConsent` table (added in the schema extension, PR #71) to a student-facing UI for the first time.

### What was shipped

**Route:** `/talent-discovery-standalone/student-company-consent`

**Page** (`student-company-consent/page.tsx`) is a server component. It reads the authenticated session, redirects to `/sign-in` if unauthenticated, then calls `getMembersWithConsentStatus(userId)` and passes the result to `CompanyAccessConsentCard`.

**Service function** (`src/lib/services/student-services.ts`, `getMembersWithConsentStatus`). Queries `MembershipDashboardMember`, joining through `Membership → Organisation → StudentCompanyConsent` filtered by `studentId`. Returns `MemberWithConsent[]`: each entry contains `id` (dashboard member row id), `memberKey`, `organisationId` (nullable — `null` if the organisation record is missing), `name` (org name or memberKey fallback), and `consented` (boolean).

**Server action** (`student-company-consent/action.ts`, `toggleCompanyConsent`). Takes `organisationId: number` and `consented: boolean`. Reads the session server-side to get `studentId`, then upserts a `StudentCompanyConsent` row using the composite unique key `{ studentId, companyId }`. Guards: throws `"Unauthorized"` if no session.

**Client component** (`CompanyAccessConsentCard.tsx`). Initialises React state from the `members` prop, mapping each to an internal `Company` shape. Renders summary count cards (approved / denied), a paginated list (5 per page) of company rows, and a "Revoke All Access" button. Each row has a per-company toggle button that calls `toggleCompanyConsent` and updates local state. A `Snackbar` toast confirms each change. Pagination buttons appear only when there are more than 5 companies.

**Sidebar** (`StudentSideBar.tsx`). A new "Account and Security" nav section was added with two items: "Company Consent" (`/student-company-consent`) and "Security Settings" (`/student-security-settings`). Any further student settings pages must be added to the `settingsItems` array in this file.

### Cross-dependencies and known issues

**1. Consent default conflicts with recruiter search (action required).** `getMembersWithConsentStatus` returns `consented: true` when no `StudentCompanyConsent` row exists for a given company — this is an opt-out model, meaning the UI shows all companies as having access until the student explicitly revokes. However, the recruiter search service shipped in PR #78 (`recruiter-search.ts`) enforces consent via a JOIN through `StudentCompanyConsent WHERE consented = true`. If no row exists, the JOIN produces no result, so the student is invisible to recruiter search despite the consent UI indicating full access. These two behaviours are contradictory. The recruiter search must be updated to treat a missing consent row as consented (e.g., via a `LEFT JOIN` with `COALESCE(consented, true)`), or consent rows must be pre-populated with `consented = true` for all existing students at migration time. This must be resolved before the recruiter search and consent features are tested together.

**2. "Revoke All Access" does not persist.** The `revokeAll` function in `CompanyAccessConsentCard` sets all entries to `"denied"` in React state but does not call `toggleCompanyConsent` for any of them. A database write only occurs when a student uses the individual per-row toggle. The "Revoke All" bulk action is therefore a UI-only operation — a page reload will revert it. Fix: iterate over the current companies list in `revokeAll` and call `toggleCompanyConsent(c.organisationId, false)` for each entry where `organisationId !== null`.

**3. `organisationId` nullability.** If a `MembershipDashboardMember` row has no associated `Organisation` (e.g. a membership without an org record), `organisationId` is `null`. The `toggleStatus` handler guards this correctly (`if (c.organisationId !== null)`) — it skips the server action silently. The student sees the toggle animate but the change is not saved. This is acceptable as a graceful no-op for now, but the data integrity cause should be investigated if any companies are showing incorrectly in the list.

**4. Logo and `since` fields are not populated.** The `Company` shape in `CompanyAccessConsentCard` has `logoUrl` and `since` fields that are always empty strings — `getMembersWithConsentStatus` does not return them. The avatar renders the first letter of the company name as a fallback. No functional impact, but logo support will require extending the service function to include an `Organisation.logoUrl` field (not currently in the schema).

**Mapped tickets:** #24, #25 (code on main, issues open)

---

## Student Security Settings — Data Export and Account Deletion UI

**PR #85, merged 7 April. Author: Sadhana Jayakumar (Sjk4824).**

A new account management page gives students two self-service controls: a GDPR-compliant full data export and an account deletion flow. The export is fully functional. The deletion UI is complete but the backend is not yet wired.

**New dependency: `jszip`.** The package was added to `package.json`. Run `npm install` after pulling this branch.

### What was shipped

**Route:** `/talent-discovery-standalone/student-security-settings`

**Page** (`student-security-settings/page.tsx`) is a server component. Reads the session, redirects unauthenticated users, and passes `userId` and `email` to the `AccountManagement` client component.

**`AccountManagement` component** (`SecutiySettingsPage.tsx`) renders three section cards:

- **Account Email** — displays the session email as a read-only field. Copy states that email is managed by UCL SSO and cannot be changed.
- **Export Your Data** — a single "Export All Data" button. While exporting, the button disables and its label changes to "Exporting…". On success, triggers a browser download of a ZIP file. On failure, shows an error toast.
- **Delete Account** — a danger-styled section with an irreversibility warning checklist and a "Delete My Account" button that opens a confirmation dialog before proceeding.

**`exportAllData` server action** (`student-security-settings/action.ts`). Server-side guard confirms the calling session owns the requested `userId`. Queries `prisma.user.findUnique` with a comprehensive `select` covering: account fields, roles, memberships, all student profile relations (`studentProfile`, `studentPersonalInformation`, `studentSocialLinks`, `studentUniversities`, `workExperiences`, `studentProjects`, `studentSkills`, `studentAcheivementTags`), consent records (`consents`, `studentCompanyConsents`), CV metadata (`studentCVs`), and the last 500 audit log entries. Assembles this into a typed `profileData` object, writes it as `profile-data.json` into a JSZip archive. Then iterates `studentCVs`, resolves each `fileUrl` against `<cwd>/public`, reads the file from disk, and adds it to a `cvs/` folder in the archive using the CV label as the filename. Missing files are skipped silently. Returns the ZIP as a base64 string plus a datestamped filename. The client decodes the base64, constructs a `Blob`, and triggers an anchor click to download.

**Account deletion stub.** `handleDeleteAccount` in the client component currently calls `setDeleteDialogOpen(false)` and fires a toast — no server action is invoked. The `action.ts` file has a `//TODO: implement the student profile delete functionality` comment. The dialog and confirmation flow are production-ready; only the server-side call is missing.

### Cross-dependencies and known issues

**1. Export is coupled to local CV storage.** `exportAllData` resolves CV file paths as `path.join(process.cwd(), "public", cv.fileUrl)`, where `fileUrl` is a path like `/media/resumes/{userId}/filename.pdf`. This is hardcoded to the local filesystem storage established in PR #75 (CV upload). If CV storage moves to S3 or any external URL, the export action must be updated to fetch files remotely instead of reading from disk. The two features must change together.

**2. Account deletion backend needs implementing.** The server action stub is in `src/app/talent-discovery-standalone/student-security-settings/action.ts`. Per the CLAUDE.md architectural decision, suspension/deletion should use the `AppSuspension` table (scoped by `appKey`) rather than writing to the parent `User` record directly, to avoid cross-app side effects if the platform expands. A hard delete, if required, should cascade across: `StudentCV` files on disk (and from `public/media/resumes/{userId}/`), all student profile relation rows, `StudentCompanyConsent` rows, and audit log entries per GDPR. The `DELETE /api/account/delete` route in the scaffold API may be the starting point — verify its current implementation before building a new one.

**3. Sidebar entry uses a generic icon.** Both "Company Consent" and "Security Settings" entries in `StudentSideBar` use `SettingsOutlinedIcon`. If a dedicated icon (e.g. `SecurityOutlinedIcon`) is preferred for the security page, update the `settingsItems` array in `src/components/talent-discovery/student-components/StudentSideBar.tsx`.

**Mapped tickets:** Account management / security settings (no specific ticket identified from commit history)

---

## What Comes Next

The consent management and export features bring the student account control surface to a near-complete state. The immediate priorities for the next sprint are:

- **Recruiter search / consent default reconciliation** — the `LEFT JOIN` fix or data migration described above must be resolved before end-to-end recruiter search testing is meaningful. This is the most pressing cross-stream dependency.
- **"Revoke All" persistence fix** — a targeted fix in `CompanyAccessConsentCard.tsx:revokeAll` to iterate and call `toggleCompanyConsent` for each company.
- **Account deletion backend** — wire `handleDeleteAccount` to a server action implementing the deletion logic per the architectural decisions above.
- **Student self-registration** (#17) — the student-side registration flow remains unstarted.
- **Admin company approval wiring** (#27) — the approval UI has been styled; it needs connecting to the company lifecycle state machine from PR #78.
- **Recruiter job posting** (#28) — not yet started.
- **Service layer stubs and type contracts** (#3, #4) — still open; parallel feature work is accumulating around them.
- **Data validation layer** (#9) — Zod schemas for form inputs; no progress this period.

---

## Ticket Status Overview

| Status | Count | Tickets / notes |
|--------|-------|-----------------|
| Closed this period | 1 | #22 |
| Closed previously | 8 | #2, #5, #6, #7, #13, #14, #15, #47, #48 |
| Code on main (issue open) | 11 | #8, #12, #16, #18, #24, #25, #26, #27, #33, #34, #77 |
| Partial / UI only | 3 | #29, #30, account deletion (UI merged, backend pending) |
| Not yet started | 21 | #3, #4, #9–#11, #17, #19–#23, #28, #31–#32, #35–#40 |

All ticket numbers reference [github.com/gianpremrajaram/scaffold/issues](https://github.com/gianpremrajaram/scaffold/issues).
