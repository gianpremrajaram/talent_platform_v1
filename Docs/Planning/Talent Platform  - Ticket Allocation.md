# Talent Platform V1 — Team Allocation & Build Plan

**Last updated:** 8 March 2026
**Owner:** Gian
**Status:** L1 Foundation Lock in progress — parallel feature work begins once L1 is complete

---

** Always pull latest changes/view in progress branches** <- point AI at those codebases to better understand if others have built either parts of your ticket OR if there reusable components.
** L1 before L2.** No feature wiring starts until the full L1 foundation is complete. UI shells with dummy data are fine in parallel; real DB calls are not. This means work can get started on L2+ tickets with placeholders.




## Progress Update — Sadhana

Before allocations, the following has already been completed or is actively in progress. GitHub issues should be updated to reflect this.

| Work completed | Mapped ticket | Status |
|----------------|---------------|--------|
| Login routing + post-login redirect structure | #16 Login page review/refactor | In Progress |
| Side nav + top nav components (reusable) | Not a tracked issue — infra/DX work | Done — note on #13 |
| Student dashboard page with dummy data | #26 Student profile form | In Progress — UI shell, backend not wired |
| Personal information page | Part of #26 | In Progress |
| Academic information page | Part of #26 | In Progress |
| CV upload page (UI shell) | #29 CV upload/CRUD | In Progress — UI only |
| CV library page (UI shell) | #29 / #30 | In Progress — UI only |
| Mantis component integration | Not tracked — scaffold work | Done |
| Browse job board modification | #28 Recruiter job postings | In Progress — student browse side |

**Key note:** Sadhana is building UI shells with dummy data ahead of backend wiring. This is the correct pattern — stubs get replaced with real service calls once L1 lands. No page code needs to change when backend is wired.

---

## Team Allocation Overview

All ticket numbers reference [github.com/gianpremrajaram/talent-platform-v1/issues](https://github.com/gianpremrajaram/talent-platform-v1/issues). Layers L1–L5 define build order: L1 must be fully complete before L2 begins, and so on.

| Team member | Stream | Tickets |
|-------------|--------|---------|
| Gian | Orchestration + Recruiter stream | #2, #5, #6, #7, #12, #13, #18, #34 |
| Sadhana | Tech lead + Student stream | #3, #4, #8, #16, #24, #25, #26 |
| Adam | Job board + CV library | #21, #9, #23, #28, #29, #30, #31, #32, #10, #37 |
| Chengyu + Lienqi | Admin panel | #15, #14, #22, #27, #33, #35, #36, #39 |

---

## Gian — Orchestration + Recruiter Stream

**Why this scope:** Gian has full visibility of the overall architecture and dependency graph. The orchestration tickets (#2, #5, #6, #7, #12) are the shared engine that every other stream imports from — tier gating, route protection, and company state management affect every user-facing feature. If any other developer builds these without the full dependency context, architectural trade-offs will be made inconsistently. The recruiter stream (#18, #34) gives a concrete end-to-end feature path alongside the infrastructure work.

### Tickets

| # | Title | Layer | Depends on | Blocks |
|---|-------|-------|------------|--------|
| #2 | Role/tier mapping decision | L1 | Nothing | #3, #5, #6, #7, #16, #17, #18 |
| #13 | Extend Prisma schema for V1 | L1 | Nothing (enum values from #2) | Every L2 feature |
| #5 | TierGate component | L1 | #2 | #7, all L2 tier-restricted UI |
| #6 | Middleware route protection | L1 | #2 | All L2 route access |
| #7 | RBAC refactor | L1 | #2, #5 | #12, all L2 feature gating |
| #12 | Company lifecycle state machine | L1 | #3, #7 | #18, #27, #33 |
| #18 | Recruiter self-registration | L1 | #13, #12 | #27 (Chengyu) |
| #34 | Recruiter search | L4 | #11 (Sadhana), #25 (Sadhana) | #37 (Adam) |

### Scope detail

**#2** is a decision document, not code. Output is a mapping table committed to `CLAUDE.md` documenting which existing scaffold `Role` and `MembershipTier` values correspond to student/recruiter-silver/recruiter-gold/recruiter-platinum/admin. This gates everything — without it, every developer interprets the tier model differently.

**#13** adds 6 new models to `prisma/schema.prisma` in a single migration: `StudentProfile`, `StudentCompanyConsent`, `JobPosting`, `StudentCV`, `AdminRecommendation`, `AppSuspension`. Run `npx prisma migrate dev` then `npx prisma generate`. All team members must pull and run migrate after this lands — post in team channel per migration protocol before pushing.

**#5 TierGate** is a single React client component (`src/components/TierGate.tsx`). Reads `membershipTierRank` and `roleKeys` from the JWT via `useSession`. Renders children only if the user meets the tier/role requirement; renders null otherwise. Supports `tier`, `role`, and combined props. Dev bypass mode controlled by env var.

**#6 Middleware** is `src/middleware.ts`. Decodes the JWT cookie, checks auth and tier rank, redirects to `/sign-in` or `/access-denied` before any page renders. Route-to-tier mapping table is defined in the issue body. First layer of defence; TierGate (#5) is the second layer within the page.

**#7 RBAC refactor** removes hardcoded `SILVERRANK = 2`, `GOLDRANK = 3` constants from `src/app/talent-discovery/page.tsx` (lines 69–70). Adds `userCanAccessFeature(userId, featureName)` to `src/lib/access-control.ts` with a central feature-permission config map.

**#12 Company lifecycle** defines a `CompanyStatus` enum (PENDING, APPROVED, SUSPENDED, BANNED), creates `getCompanyStatus(companyId)` in a service file, and wires it into `userCanAccessApp` so pending/suspended companies are blocked from talent features.

**#18 Recruiter self-registration** extends the shared register page (built by Sadhana in #17) with recruiter-specific flow — company email, name, company name, password. Account created in PENDING state, no talent access until admin approves via #27. Recruiter sees "awaiting approval" on login.

**#34 Recruiter search** is the L4 payoff of all orchestration work — Gold/Platinum recruiters search for consented students with three simultaneous rules: consent gate, tier gate, and filters (location, degree, experience). All searches logged via audit function (#10). Depends on consent being wired (#25, Sadhana) and student data access layer (#11, Sadhana).

---

## Sadhana — Tech Lead + Student Stream

**Why this scope:** Sadhana has the deepest existing codebase familiarity and has already progressed the student-facing UI significantly. She owns the shared type contracts (#3) and service stubs (#4) which every other stream imports from — this is the correct owner given her tech lead role. The consent and student profile stream (#24, #25, #26) follows naturally from the UI shells she has already built.

### Tickets

| # | Title | Layer | Depends on | Blocks |
|---|-------|-------|------------|--------|
| #3 | Shared type contracts | L1 | #2 (Gian) | #4, #8, #10, #12, all L2 |
| #4 | Service layer stubs | L1 | #3 | #11, #24, all L2 |
| #8 | Error handling contract | L1 | #3 | #9 (Adam), #22, all L2 API routes |
| #16 | Login page review/refactor | L1 | #2 (Gian) | All authenticated features |
| #24 | Consent toggle — binary | L2 | #4, #14 | #25 |
| #25 | Per-company consent | L2 | #24 | #34 (Gian), #35 (Chengyu/Lienqi) |
| #26 | Student profile form | L2 | #9 (Adam), #17 | #29 (Adam) |

### Scope detail

**#3 Type contracts** is a single file `src/types/index.ts` defining shared TypeScript types for every entity that crosses a component boundary: `UserTier`, `ConsentStatus`, `UserRole`, `StudentProfile`, `RecruiterProfile`, `JobPosting`, `AdminRecommendation`, `StudentCV`, `CompanyConsent`, `ApiResponse<T>`. Once merged, changing a type requires a PR reviewed by at least one other stream owner.

**#4 Service stubs** creates `src/lib/services/` with 6 files: `consent.ts`, `student-profile.ts`, `job-board.ts`, `recommendations.ts`, `recruiter-search.ts`, `cv.ts`. Each exports typed async functions returning hardcoded dummy data. Pages call real function names from day one — when real DB logic lands later, pages need zero changes.

**#8 Error contract** defines `ApiResponse<T>` shape (`success`, `data?`, `error?` with `code` and `message`), creates a client-side error boundary component, and refactors at least one existing API route as a reference implementation.

**#16** is already in progress. Scope: validate post-login routing for all roles, add recruiter-specific redirect (currently missing), add register link for unauthenticated users without admin gate.

**#24 Consent toggle** wires `src/lib/services/consent.ts` stub to real Prisma queries against `StudentCompanyConsent`. `setConsent(studentId, status)` creates/updates rows. Default is hidden (no rows). Consent changes logged via audit function.

**#25 Per-company consent** extends #24 with per-company granularity. UI lists approved companies with individual toggles. `isVisibleToCompany(studentId, companyId)` is the function all recruiter-facing queries must call — never bypass this.

**#26 Student profile form** fills the empty `StudentView.tsx` shell with a real form writing to `StudentProfile` table. Fields: skills (tag input), experience years, degree type (dropdown from enum in #13), location, certifications, projects (structured input), LinkedIn URL, GitHub URL. Validates with Zod schema (#9, Adam).

---

## Adam — Job Board + CV Library

**Why this scope:** The job board and CV library form a clean, well-bounded vertical — recruiter posts, student browses and uploads, data flows through the service layer. Adam starts with L1 foundational tasks (#21, #9) then owns both feature streams end-to-end. #23 (CV storage decision) is assigned here because the CV stream owner should make the storage call.

### Tickets

| # | Title | Layer | Depends on | Blocks |
|---|-------|-------|------------|--------|
| #21 | Fix crypto.randomBytes bug | L1 | Nothing | #17, #18 |
| #9 | Zod validation schemas | L1 | #3 (Sadhana), #8 (Sadhana) | #26, #28 |
| #23 | CV storage decision | L2 | Nothing (decision) | #29 |
| #28 | Recruiter job postings + student browse | L2 | #9, #27 (Chengyu) | Nothing |
| #29 | CV upload/CRUD | L3 | #23, #26 (Sadhana) | #30, #31 |
| #30 | Multiple CVs per student | L3 | #29 | Nothing |
| #31 | CV keyword tagging | L3 | #29 | #35 (optional filter) |
| #32 | Account deletion FK cascade fix | L3 | #13 (Gian) | Nothing |
| #10 | Audit logging pattern | L1 | #3 (Sadhana) | #34, #35 |
| #37 | Recruiter contact — mailto + audit log | L5 | #34 (Gian) | #38 |

### Scope detail

**#21** is a one-line fix: replace `Math.random` with `crypto.randomBytes` in `src/app/api/account/create-user/route.ts`. Unblocks both registration flows.

**#9 Zod schemas** installs Zod and creates validation schemas co-located with type contracts for: `StudentProfile`, `JobPosting`, `UserRegistration`, `CompanyConsent`. At least one existing API route refactored to use schema validation as a reference. Validation errors return structured messages via the error contract (#8).

**#23** is a decision document. Three options: (A) URL field — student provides hosted link, zero infrastructure; (B) S3-compatible object storage; (C) PostgreSQL bytea — not recommended. Playbook recommends Option A for V1. The `StudentCV` schema stores `fileUrl: string` regardless — swapping backend later changes only the service layer, not the schema or UI.

**#28** covers both sides of the job board: recruiter posting form in `PartnerJobBoardView.tsx` (title, location, salary band, role type, description, expiry date), and student browse listing view. Only the posting firm can edit/delete. Input validated with Zod schemas.

**#29–#31** are the CV library stack. #29 is core CRUD (upload, update, delete, replace) using the storage abstraction interface defined in #13. #30 extends to support multiple CVs per student with labels. #31 adds keyword tag input that writes to an array field, feeding into the admin recommendation filter.

**#10 Audit logging** creates `src/lib/services/audit.ts` with `auditLog(action, actorId, targetStudentId?, metadata?)`. Action enum covers all GDPR-relevant operations: `CV_VIEWED`, `STUDENT_SEARCHED`, `RECOMMENDATION_CREATED`, `CONSENT_CHANGED`. Wires into existing `AuditLog` Prisma model (already in scaffold — no schema change needed). Function must be non-blocking.

**#37** is a mailto link on student cards in recruiter search results. Click opens `mailto:student@ucl.ac.uk` with pre-filled subject. Click is logged as an `AuditLog` entry. Only starts after Gian delivers #34.

---

## Chengyu + Lienqi — Admin Panel

**Why this scope:** The admin panel is a self-contained stream that predominantly consumes services built by other streams rather than defining new ones. The work spans L1 through L5 and covers the admin approval flow, suspension controls, the recommendation gateway (highest-complexity feature in the project), and dashboard metrics. Both developers are allocated to this stream and should split tickets between them.

### Tickets

| # | Title | Layer | Depends on | Blocks |
|---|-------|-------|------------|--------|
| #15 | .env.example | L1 | Nothing | Developer onboarding |
| #14 | Seed test users | L1 | #13 (Gian) | #24, #26 testing |
| #22 | UI state components (loading/empty/error) | L2 | #8 (Sadhana) | Nothing strictly |
| #27 | Admin company approval UI | L2 | #18 (Gian), #12 (Gian) | #28 (Adam), #35 |
| #33 | Admin suspend/ban | L3 | #13 (Gian), #12 (Gian) | Nothing |
| #35 | Recommendation gateway | L4 | #11 (Sadhana), #25 (Sadhana), #27 | #40 |
| #36 | Admin dashboard metrics | L4 | #24 (Sadhana), #27 | #39 |
| #39 | Dashboard filters | L5 | #36 | Nothing |

### Scope detail

**#15** creates `.env.example` documenting `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and placeholders for future vars. Committed to repo; `CLAUDE.md` updated to reference it. Any new env var added to code must be added here in the same commit.

**#14** extends `prisma/seed.ts` to create: at least 3 student users with varying consent states, 1 admin user, 1 approved recruiter with firm association, 1 pending recruiter for approval flow testing. Seed is idempotent.

**#22** creates three shared UI components in `src/components/ui/`: `LoadingState` (spinner/skeleton), `EmptyState` (customisable message), `ErrorState` (using error contract from #8). Consistent with existing MUI theme. At least one existing page refactored to use them as reference.

**#27** is the admin panel section for pending company registrations. Lists pending companies with name, domain, registrant email, and date. Approve action: tier dropdown (silver/gold/platinum), creates/links Organisation, assigns MEMBER role — reuses existing `update-user` transaction logic. Reject action prevents access. This ticket directly unblocks Adam's #28 (job board requires approved companies to exist).

**#33** implements per-app suspension via the `AppSuspension` table. Admin can suspend or ban a student/company scoped to the talent platform only, without affecting other apps. `userCanAccessApp` checks for active suspension.

**#35 Recommendation gateway** is the highest-complexity feature in the project. Three-layer dependency chain: (1) consent check — student must have consented for the target firm, (2) tier gate — firm must be Gold or Platinum, (3) per-firm data isolation — each firm sees only students recommended to them. Admin filters consented students, selects target firms, creates `AdminRecommendation` rows. Recruiter view calls `getRecommendationsForFirm(firmId)` — JOIN through consent table to verify consent hasn't been withdrawn since tagging. Admin can revoke by setting `revokedAt`; row remains for audit.

**#36** computes four metrics: total registered students (`COUNT(User) WHERE role = STUDENT`), consented students (`COUNT DISTINCT studentId FROM StudentCompanyConsent WHERE consented = true`), approved companies, matchable pairs. Rendered as pie/donut chart. Extends the existing admin dashboard tab structure via `SecondaryNav.tsx`.

---

## Dependencies Summary

The two most important rules for the team:

**Rule 1 — L1 before L2.** No feature wiring starts until the full L1 foundation is complete. UI shells with dummy data are fine in parallel; real DB calls are not.

**Rule 2 — Schema change protocol.** Before any developer pushes a commit touching `prisma/schema.prisma`, post in the team channel: *"Schema change incoming — pull and run `npx prisma migrate dev` before continuing."* Every team member must pull and migrate before resuming work. Never push two independent schema changes in sequence.

### Critical handoff points

| Delivered by | Ticket | Who is waiting | Why |
|-------------|--------|----------------|-----|
| Gian | #2 Role/Tier Mapping | Sadhana (#3) | Type contracts can't be written without agreed tier model |
| Gian | #13 Schema extension | Everyone doing L2 | No feature can store data without tables |
| Sadhana | #3 Type contracts | Adam (#9), Chengyu/Lienqi | All Zod schemas and service stubs import from here |
| Sadhana | #17 Student registration | #24 consent, #26 profile | Consent toggle has nothing to attach to without students |
| Gian | #18 Recruiter registration | Chengyu/Lienqi #27 | Admin can't approve companies that don't exist |
| Chengyu/Lienqi | #27 Admin company approval | Adam #28 | Job board requires approved companies |
| Sadhana | #24, #25 Consent | Gian #34, Chengyu/Lienqi #35 | Search and recommendations must filter by real consent |
| Gian | #34 Recruiter search | Adam #37 | Contact button only makes sense on search results |

---

## Prioritisation by Team Member

This section defines the order of work for each developer. No exact deadlines — sequencing matters more than timing. Items marked **start now** have no dependencies and can begin immediately.

---

### Gian

In strict order — each unlocks the next:

1. **#2 Role/Tier Mapping** — start now, tonight. Decision document only, no code. 30 minutes. Unblocks Sadhana's #3 and the entire orchestration stack. Do this before writing a single line of schema.
2. **#13 Schema extension** — immediately after #2, same session. Enum values decided in #2 go directly into the schema models. Post migration protocol in team channel before pushing.
3. **#12 Company Lifecycle** — after #13 is merged. Depends on #3 (Sadhana) and #7, but #7 depends on #5 so the order is: #5 → #7 → #12. Unblocks Chengyu's #27 and your own #18.
4. **#5 TierGate** — can start as soon as #2 is done (no dependency on #13). One React component. Feeds into #7 → #12 chain.

After these four, the team can begin parallel L2 work. Remaining tickets (#6, #7, #18, #34) follow in dependency order from this foundation.

---

### Sadhana

Continue UI shell work in parallel now — this is not wasted. Real wiring starts after Gian's #2 lands:

1. **#16 Login page** — already in progress. Complete recruiter routing and register link.
2. **#3 Type contracts** — first thing after Gian merges #2. This unblocks Adam's #9 and the whole service layer.
3. **#8 Error contract** — immediately after #3. Adam's #9 depends on both #3 and #8.
4. **#4 Service stubs** — after #3. Unblocks L2 testing for everyone.
5. **#24 → #25 → #26** — in this order once L1 is complete. Consent toggle before per-company before profile form (profile is the dependency for Adam's #29).

---

### Adam

Two things can start now regardless of L1:

1. **#21 Crypto bug fix** — start now, no dependencies. Unblocks #17 and #18 registration flows.
2. **#23 CV storage decision** — start now. Decision document, no code. Unblocks the entire CV stream.

Then in order once L1 lands:

3. **#9 Zod validation** — after Sadhana's #3 and #8. Foundation for both #28 and #26.
4. **#28 Job postings** — after #9 and Chengyu's #27.
5. **#29 → #30 → #31** — CV stream in sequence, each depends on the prior. Start after #23 (yours) and #26 (Sadhana).
6. **#32 Account deletion** — after #13 (Gian). Independent of CV stream, can be slotted in anytime after L1.
7. **#10 Audit logging** — after Sadhana's #3. Can run in parallel with CV stream.
8. **#37 Recruiter contact** — last; depends on Gian's #34.

---

### Chengyu + Lienqi

Two tickets can start now:

1. **#15 .env.example** — start now, no dependencies. Quick win.
2. **#14 Seed users** — after Gian's #13. First available task after schema lands.

Then in order:

3. **#22 UI state components** — after Sadhana's #8. Recommended before L2 UI work begins.
4. **#27 Admin company approval** — after Gian's #18 and #12. This is the critical L2 delivery for the admin stream — unblocks Adam's #28.
5. **#33 Admin suspend/ban** — after #13 and #12. Can run in parallel with #35 once L2 is complete.
6. **#35 Recommendation gateway** — after Sadhana's #11 and #25, and after #27. Highest-complexity feature — split ownership between both developers on this one.
7. **#36 Admin dashboard metrics** — after #24 (Sadhana) and #27. Feeds into #39.
8. **#39 Dashboard filters** — last, L5 stretch, after #36.
