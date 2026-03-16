# Scaffold Architecture Evaluation

**Purpose:** Comprehensive walkthrough of the existing codebase for Team 1 developers picking up Talent Platform V1 work. Cross-references risks and requirements from the source-of-truth document `Docs/coding_start_planning.pdf`.

**Last updated:** 4 March 2026

---

## Table of Contents

1. [Config & Build Layer](#1-config--build-layer)
2. [Prisma & Database](#2-prisma--database)
3. [Authentication & Session](#3-authentication--session)
4. [Access Control & RBAC](#4-access-control--rbac)
5. [API Routes (`src/app/api/`)](#5-api-routes)
6. [Lib Layer (`src/lib/`)](#6-lib-layer)
7. [Content Layer (`src/content/`)](#7-content-layer)
8. [Components (`src/components/`)](#8-components)
9. [Pages / App Routes (`src/app/`)](#9-pages--app-routes)
10. [Scaffolding Gaps — Files To Be Created](#10-scaffolding-gaps--files-to-be-created)
11. [Risk Cross-Reference Table](#11-risk-cross-reference-table)
12. [Where & How To Start — Work Stream Advisory](#12-where--how-to-start--work-stream-advisory)

---

## 1. Config & Build Layer

The project is a standard Next.js 16 monorepo using the App Router, with TypeScript strict mode, Tailwind CSS v4 (via PostCSS), and MUI v7. The `@/*` path alias in `tsconfig.json` maps to `./src/*` — all imports should use this. ESLint is configured with `eslint-config-next` core-web-vitals + typescript rules.

| File | What it does | Risk x-ref |
|------|-------------|------------|
| `package.json` | Scripts: `dev`, `build`, `start`, `lint`. No test runner configured. | — |
| `tsconfig.json` | Strict mode, `@/*` → `./src/*` path alias, bundler module resolution. | — |
| `eslint.config.mjs` | Next.js core-web-vitals + TypeScript rules. No custom rules. | — |
| `next.config.ts` | Empty config — no custom webpack, redirects, or env exposure. | SETUP-2: may need updates for new env vars or image domains if CV storage goes external. |
| `postcss.config.mjs` | Tailwind v4 plugin only. | — |
| `.gitignore` | Ignores `.env*`, `.next/`, `node_modules/`, generated Prisma client. | SETUP-2: `.env.example` should be committed (currently absent). |

---

## 2. Prisma & Database

The data model is defined in `prisma/schema.prisma` with PostgreSQL as the provider. Seed data is loaded from `prisma/members.yml` (YAML) via `prisma/seed.ts` using `ts-node`. The seed script creates membership tiers (bronze/silver/gold/platinum), three apps (MEMBERSHIP_DASHBOARD, IXN_WORKFLOW_MANAGER, TALENT_DISCOVERY), app access rules, and industry partner users with memberships. The `prisma.config.ts` file configures the classic engine and points to `DATABASE_URL`.

| File | What it does | Risk x-ref |
|------|-------------|------------|
| `prisma/schema.prisma` | 14 models: `User`, `Organisation`, `Role`, `UserRole`, `MembershipTier`, `Membership`, `App`, `AppAccessRule`, `MembershipDashboardMember`, `Account`, `Session`, `VerificationToken`, `AuditLog`. | SETUP-2: "Prisma file schema database in existing codebase is quite limited — components we work on may need updates/alignment." Schema lacks student profile fields (FR-S-6), consent columns (FR-S-13), job postings (FR-R-14), `admin_recommendations` table (FR-A-7a), and suspension/ban table (FR-A-2). |
| `prisma/seed.ts` | Seeds tiers, orgs, users, memberships, dashboard projections, apps, and access rules from YAML. Uses `bcryptjs` for password hashing with a cache. | SETUP-2: seed only creates INDUSTRY orgs and partner-type users. No student or admin seed users exist — team will need to add these for local dev testing of student/recruiter/admin flows. |
| `prisma/members.yml` | YAML fixture data for industry partner members. | — |
| `prisma/migrations/` | Three migrations: init, add_auth, init_alliances_schema. | SETUP-2: after any schema change, every dev must run `npx prisma migrate dev`. Without CI/CD, schema drift is the #1 parallelisation risk per coding start doc. |

---

## 3. Authentication & Session

Authentication uses NextAuth v4 with a credentials provider (email/password) and JWT session strategy. The `PrismaAdapter` is attached but JWT mode means sessions are NOT stored in the DB — they live in the JWT cookie. After sign-in, the user hits `/post-sign-in` which reads their roles and `defaultApp` to redirect to the correct sub-application.

| File | What it does | Risk x-ref |
|------|-------------|------------|
| `src/lib/auth.ts` | `authOptions` — credentials provider, JWT callbacks that inject `roleKeys`, `membershipTierKey`, `membershipTierRank` into the token and session. | SETUP-1: coding start doc notes "login page UI/logic is already there — quality needs to be verified, potential refactoring needed." The `(session.user as any).roleKeys` pattern is used everywhere — no typed session augmentation exists. |
| `src/lib/getServerAuthSession.ts` | Thin wrapper: `getServerSession(authOptions)`. | — |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth route handler. | — |
| `src/app/api/auth/admin-check/route.ts` | Verifies email/password is valid AND user has ADMIN role without creating a session. Used by the Register button on sign-in form. | — |
| `src/app/sign-in/page.tsx` | Renders `SignInForm` with redirect to `/post-sign-in`. | SETUP-1: this is the login page entry point. |
| `src/components/SignInForm.tsx` | Client component: email/password form, `signIn("credentials")`, admin-gated register flow. Has inline `<style jsx>` for tooltip. | SETUP-1: register flow is admin-only (non-admin gets redirected to `/access-denied`). For V1 this needs to support student + recruiter self-registration (FR-S-1/FR-R-1). |
| `src/app/post-sign-in/page.tsx` | Server page: reads roles + `defaultApp`, redirects ADMIN → `/membership-dashboard`, STUDENT → `/talent-discovery?view=student`, others by defaultApp key. | RBAC-1: routing logic is role-aware. New roles (STUDENT, RECRUITER) partially handled — STUDENT redirect exists, but no RECRUITER-specific routing. |
| NFR-13 (SSO) | **Not implemented.** Coding start doc says "SSO is already in scaffold" but this is inaccurate — only credentials auth exists. No Shibboleth/SAML provider. | NFR-13: "Existing SSO code quality needs review." Solution per doc: "develop UI, leave SSO out of it / keep placeholder." |
| FR-S-2 (2FA) | **Not implemented.** Doc notes "2FA is already built-in via SSO integration BUT we don't know if Daniel has implemented it." He has not — no 2FA exists. | FR-S-2: needs review. Low priority for V1 dev start — placeholder only. |

---

## 4. Access Control & RBAC

Access control is implemented in `src/lib/access-control.ts` via a single function `userCanAccessApp(userId, appKey)`. ADMIN bypasses all checks. MODULE_LEADER gets IXN access. Otherwise, the user's highest active membership tier rank is compared against `AppAccessRule` minimums. Default deny when no rules match. Component-level tier gating does NOT yet exist — the coding start doc prescribes a `<TierGate>` component that is not built.

| File | What it does | Risk x-ref |
|------|-------------|------------|
| `src/lib/access-control.ts` | `userCanAccessApp()` — role-first override (ADMIN, MODULE_LEADER for IXN), then membership-tier ALLOW rules. | RBAC-1: "Overarching Platinum/gold/silver/bronze access logic should already be there, but we need a dev to review in-depth and validate." This is the file to review. It works at the **app level** but not at the **sub-page/component level** — coding start doc says "implement sub-page level logic in between sub user pages." |
| `src/app/talent-discovery/page.tsx` | Inline tier checks: `SILVER_RANK = 2`, `GOLD_RANK = 3` hardcoded. Role checks for STUDENT, ADMIN, MEMBER done in the page. | RBAC-1: this is exactly the anti-pattern the coding start doc warns about — tier logic written directly in the page instead of a shared service. Needs refactoring into `lib/services/` or `TierGate`. |
| `src/app/membership-dashboard/page.tsx` | Calls `userCanAccessApp()` for non-admin, then branches admin/member view. | RBAC-1: uses the shared access-control function correctly. |

---

## 5. API Routes

All API routes live under `src/app/api/`. These are the existing CRUD operations for user management plus auth. All admin-only routes check `roleKeys.includes("ADMIN")` from the session. No student or recruiter-specific API routes exist yet.

| File | What it does | Risk x-ref |
|------|-------------|------------|
| `api/account/create-user/route.ts` | Admin-only. Creates user with temp password (`Math.random` based — not cryptographically secure). Returns `tempPassword` in response. | FR-S-1/FR-R-1: this is admin-only user creation. Student/recruiter self-registration will need a separate or modified endpoint. Temp password generation should use `crypto.randomBytes` for production. |
| `api/account/update-user/route.ts` | Largest API route (~277 lines). Admin can update any user including org, roles, membership tier, default app. Non-admin can update own name/email/defaultApp. Handles pending org/role creation in a transaction. | FR-A-1: admin approve/reject company registration could build on this — it already creates orgs and assigns roles within a transaction. |
| `api/account/delete-user/route.ts` | Admin can delete any user (except self). Non-admin can self-delete. Uses transaction to clean up `UserRole` and `Membership` before deleting `User`. | FR-S-3: account deletion endpoint exists. Does NOT clean up `MembershipDashboardMember`, `Account`, `Session`, or `AuditLog` records — potential FK constraint failure. |
| `api/account/get-user/route.ts` | Fetches user profile data. | — |
| `api/account/reset-password/route.ts` | Password reset. | — |
| `api/account/change-password/route.ts` | Password change. | — |
| `api/admin/roles/route-unused.ts` | **Unused.** Likely from earlier iteration. | — |
| `api/admin/organisations/route-unused.ts` | **Unused.** Likely from earlier iteration. | — |

---

## 6. Lib Layer (`src/lib/`)

The lib layer contains server-side business logic, database queries, and helper functions. This is where the coding start doc's "shared engine" pattern should be enforced — all business logic centralised here, pages stay "dumb" consumers. Currently, lib files are focused on the membership dashboard; no talent discovery or consent services exist.

| File | What it does | Risk x-ref |
|------|-------------|------------|
| `src/lib/prisma.ts` | Singleton Prisma client with global caching for dev hot-reload. Exports both named `prisma` and default export. | — |
| `src/lib/auth.ts` | NextAuth config (see Section 3). | — |
| `src/lib/getServerAuthSession.ts` | Wrapper for `getServerSession(authOptions)`. | — |
| `src/lib/access-control.ts` | `userCanAccessApp()` (see Section 4). | RBAC-1 |
| `src/lib/admin-helpers.ts` | `slugify()`, `uniqueOrganisationSlug()`, `parseUkDateOrNull()`. Used by update-user route. | — |
| `src/lib/membership-dashboard.ts` | `getAdminDashboardSummary()` — tier counts for admin. `getMemberDashboardData()` — single member's dashboard data. Defines `AdminDashboardSummary` and `MemberDashboardData` types. | — |
| `src/lib/membership-dashboard-admin.ts` | `getAdminMemberList()`, `getAdminSelectedMember()`, `canAccessBenefit()`, `getAdminBenefitRedemptionStats()`. Defines `AdminMemberListItem`, `AdminSelectedMember` types. | DASH-1: admin dashboard stats logic already exists here for the membership context. Talent Platform admin dashboard (consented vs total students, approved recruiters) will need new functions. |
| `src/lib/membership-dashboard-actions.ts` | Server action: `saveRedeemedBenefitsAction()`. Admin-only, validates benefit codes, upserts `MembershipDashboardMember`. | — |
| `src/lib/handbook.ts` | `getHandbookChapters()`, `renderHandbookChapterBySlug()`. Reads markdown from `src/content/handbook/`, renders with remark. | — |

---

## 7. Content Layer (`src/content/`)

Static content is defined as TypeScript modules. These are the "data" files that drive page rendering — benefits catalogue, services registry, page copy, release notes, etc. The handbook subdirectory contains markdown files rendered server-side via remark. This layer is well-structured and the pattern should be replicated for any new static content (e.g., job categories, skill taxonomies).

| File | What it does | Risk x-ref |
|------|-------------|------------|
| `src/content/benefits.ts` | Defines `BENEFITS` array (B01–B17) with tier minimums, categories, descriptions, processes, and terms. Exports `MembershipTierKey`, `BenefitId`, `MEMBERSHIP_TIER_RANK` types/constants. | — |
| `src/content/services.ts` | Defines `services` array — all platform services with audience targeting, nav config, app keys. Includes Talent Discovery entries for student view, partner job board, and CV library with correct `appKey` and `actionUrl`. | FR-R-14, FR-S-6: the service definitions for job board and CV library exist as navigation entries but the underlying pages are shells. |
| `src/content/pageCopy.ts` | Page titles, descriptions, and unauthenticated intros for membership dashboard, IXN, and talent discovery. | — |
| `src/content/siteMeta.ts` | Version (from `package.json`), status label ("closed alpha"), tagline, mission, and announcement config. | — |
| `src/content/releases.ts` | Release notes data. | — |
| `src/content/pathways.ts` | Pathway definitions. | — |
| `src/content/stories.ts` | Success stories data. | — |
| `src/content/handbook/*.md` | 4 markdown chapters (table of contents, benefits overview, benefit processes, benefit terms). | — |

---

## 8. Components (`src/components/`)

Components are a mix of client and server components. The layout shell (Header, Footer, ClientLayout, MuiThemeProvider) is fully built. Membership dashboard components are substantial. **Talent discovery components are empty shells** with placeholder text — these are the primary build targets for Team 1.

| File | What it does | Risk x-ref |
|------|-------------|------------|
| `src/components/ClientLayout.tsx` | Client wrapper: `SessionProvider` + `MuiThemeProvider` + Header + Footer. | — |
| `src/components/MuiThemeProvider.tsx` | MUI `ThemeProvider` with empty `createTheme()` — no custom palette/typography. Wraps children in `.page-wrapper` div. | — |
| `src/components/Header.tsx` | Full nav bar with audience dropdowns (students, researchers, partners), account menu with admin-only "Add user" link, sign out. Keyboard accessible (Escape to close). | — |
| `src/components/Footer.tsx` | Copyright, GitHub link, release notes link, version display. | — |
| `src/components/SignInForm.tsx` | (See Section 3). | SETUP-1 |
| `src/components/ui/Modal.tsx` | Reusable modal component. | — |
| **Membership Dashboard** | | |
| `membership-dashboard/AdminDashboard.tsx` | Server component for admin dashboard layout. | — |
| `membership-dashboard/AdminDashboardClient.tsx` | Client interactivity for admin dashboard. | — |
| `membership-dashboard/MemberDashboard.tsx` | Member-facing dashboard. | — |
| `membership-dashboard/BenefitsFilterToolbar.tsx` | Benefits filtering UI. | — |
| `membership-dashboard/SecondaryNav.tsx` | Tab navigation within dashboard. | — |
| `membership-dashboard/HandbookPanel.tsx` | Renders handbook chapters. | — |
| **Talent Discovery (SHELLS)** | | |
| `talent-discovery/StudentView.tsx` | **Empty shell.** Placeholder text only. No student profile, job listings, or consent UI. | FR-S-6, FR-S-13: this is where student profile fields and consent toggle will live. |
| `talent-discovery/PartnerJobBoardView.tsx` | **Empty shell.** Placeholder text only. No job posting or listing UI. | FR-R-14: recruiter job posting UI goes here. |
| `talent-discovery/PartnerFullView.tsx` | **Empty shell.** Placeholder text only. No CV library or search UI. | FR-R-3, FR-A-7a: recruiter search and recommendation gateway surfaces here. |
| **Account** | | |
| `account/CreateUserForm.tsx` | Admin user creation form. | FR-S-1/FR-R-1 |
| `account/UserProfileForm.tsx` | User profile editing form (admin can edit any user). | — |

---

## 9. Pages / App Routes (`src/app/`)

App Router pages. Each top-level route corresponds to a sub-application or utility page. The membership dashboard is the most complete; talent discovery pages delegate to shell components; IXN is a placeholder.

| File | What it does | Risk x-ref |
|------|-------------|------------|
| `src/app/page.tsx` | Homepage / landing page. | — |
| `src/app/sign-in/page.tsx` | Sign-in page (see Section 3). | SETUP-1 |
| `src/app/post-sign-in/page.tsx` | Role-based redirect router (see Section 3). | RBAC-1 |
| `src/app/access-denied/page.tsx` | Generic access denied page with reason param. | — |
| `src/app/feedback/page.tsx` | Feedback form. | — |
| `src/app/membership-dashboard/page.tsx` | **Fully built.** Admin/member branching, access control, data fetching, revenue computation. 153 lines. | — |
| `src/app/membership-dashboard/benefits/[benefitId]/page.tsx` | Individual benefit detail page. | — |
| `src/app/talent-discovery/page.tsx` | **Routing logic built, UI shells empty.** Handles view param (`student`, `job-board`, `cv-library`), role checks, tier gates. 182 lines of routing/gating, but renders shell components. | RBAC-1: tier logic hardcoded in page (see Section 4 risk). |
| `src/app/ixn-workflow-manager/page.tsx` | IXN page — likely placeholder. | — |
| `src/app/account/page.tsx` | User profile page. | — |
| `src/app/account/add-user/page.tsx` | Admin-only add user page. | — |
| `src/app/services/[slug]/page.tsx` | Dynamic service detail pages. | — |
| `src/app/pathways/[slug]/page.tsx` | Dynamic pathway pages. | — |
| `src/app/release-notes/` | Release notes listing + individual + all. | — |

---

## 10. Scaffolding Gaps — Files To Be Created

These files/directories are prescribed by the coding start planning document but do **not yet exist** in the scaffold.

| File / Directory | Purpose | Required by | Priority |
|-----------------|---------|-------------|----------|
| `src/types/index.ts` | Shared type contracts (`UserTier`, `ConsentStatus`, `StudentProfile`, etc.). Must be locked before parallel work starts. | All streams | **Blocking — create first** |
| `src/lib/services/consent.ts` | Consent service: `getConsentStatus()`, toggle consent, per-company whitelist/blacklist. Stub first, wire to DB later. | FR-S-13, FR-S-12, FR-R-3, FR-A-7a |  High |
| `src/lib/services/recommendations.ts` | Admin recommendation service: `getAdminRecommendations(firmId)`, create/revoke recommendations. Requires `admin_recommendations` table. | FR-A-7a, FR-A-7b | High |
| `src/lib/services/student-profile.ts` | Student profile CRUD: skills, experience, certifications, external links. | FR-S-6, FR-S-11 | High |
| `src/lib/services/job-board.ts` | Job posting CRUD, listing queries, search. | FR-R-14 | High |
| `src/lib/services/recruiter-search.ts` | Consent-gated student search for Gold/Platinum recruiters. | FR-R-3 | Medium (L4) |
| `src/components/TierGate.tsx` | Component-level tier gate: `<TierGate tier="gold">{children}</TierGate>`. Wraps restricted UI sections. | RBAC-1 | High |
| `src/middleware.ts` | Route-level middleware for auth + tier blocking before page render. | RBAC-1 | High |
| `.env.example` | Committed env var template. Must be updated whenever a new env var is added. | SETUP-2 | High |
| Prisma: `admin_recommendations` table | Junction table: `student_id`, `firm_id`, `admin_id`, `created_at`, `revoked_at`. | FR-A-7a | Medium (L4) |
| Prisma: consent columns on User/Student | `consent_status` enum or per-company consent junction table. | FR-S-13 | High (L2) |
| Prisma: student profile fields | Skills, experience, certifications, projects, external links. | FR-S-6, FR-S-11 | High (L2) |
| Prisma: job postings table | Title, location, salary band, role type, description, company FK. | FR-R-14 | High (L2) |
| Prisma: suspension/ban table | Separate from User table to avoid cross-app suspension. | FR-A-2 | Medium (L3) |

---

## 11. Risk Cross-Reference Table

Risks flagged in `coding_start_planning.pdf` cross-referenced against what exists in the codebase.

| Risk | Severity | Coding Start Ref | Current State in Scaffold | Blocks |
|------|----------|-------------------|--------------------------|--------|
| **Schema drift without CI/CD** — parallel devs building against different DB shapes | **High** | SETUP-2, Sequential Bottleneck section | No CI/CD, no `.env.example`, no migration runbook documented. Prisma migrate exists but no team process enforced. | All L2+ work |
| **SSO not implemented** — doc assumes it exists | **Medium** | NFR-13 | Only credentials auth. No Shibboleth/SAML. Doc recommends placeholder approach. | Can defer — use credentials for dev, SSO for production handover. |
| **2FA not implemented** — doc assumes possible via SSO | **Low** | FR-S-2 | Not present. Depends on SSO which also doesn't exist. | Defer to handover. |
| **Domain verification for registration** — UCL email / company domain validation | **Medium** | FR-S-1, FR-R-1 | No domain validation exists. Registration is admin-only. | Doc solution: "dummy list of domains" for dev, real verification later. |
| **Student/recruiter self-registration** — current registration is admin-only | **High** | FR-S-1, FR-R-1 | `create-user` API is admin-gated. `SignInForm` register button checks admin status. No self-service path. | L1 — must be built or stubbed before student/recruiter flows work. |
| **Tier logic hardcoded in pages** — talent discovery page has inline rank checks | **Medium** | RBAC-1, "The Key Rule" section | `talent-discovery/page.tsx` lines 69-70: `SILVER_RANK = 2`, `GOLD_RANK = 3` hardcoded. Role checks inline. | Refactor into `TierGate` / service layer before parallel builders add more pages. |
| **No shared type contracts** — `types/index.ts` doesn't exist | **High** | Step 1 of coding start doc | Types are scattered: `benefits.ts` has `MembershipTierKey`, `membership-dashboard.ts` has `MemberDashboardData`, etc. No unified type file. | Blocks safe parallelisation. |
| **No service layer stubs** — `lib/services/` doesn't exist | **High** | Step 2 of coding start doc | Business logic is in `lib/membership-dashboard*.ts` (not in a `services/` subdirectory) and in page files. No consent, recommendation, or student profile services. | Blocks parallel builder start. |
| **CV/file storage approach undefined** | **Medium** | FR-S-4, FR-S-5 | No file upload infrastructure. Doc flags PostgreSQL blob not ideal; S3 or GDrive links as V1 workaround. | L3 — needs architectural decision before CV upload work. |
| **`admin_recommendations` table missing** | **Medium** | FR-A-7a | Not in schema. Doc recommends A1 approach: `student_id`, `firm_id`, `admin_id`, `created_at`, `revoked_at`. | L4 — must exist before recommendation gateway. |
| **Delete user FK cascade incomplete** | **Low** | FR-S-3 | `delete-user` route cleans `UserRole` + `Membership` but NOT `MembershipDashboardMember`, `Account`, `Session`, `AuditLog`. Will throw FK constraint error. | Fix before account deletion feature is tested. |
| **Temp password not cryptographically secure** | **Low** | FR-S-1 | `create-user/route.ts` uses `Math.random()` for temp passwords. | Replace with `crypto.randomBytes` before production. |
| **No `.env.example`** — env var documentation gap | **Medium** | Kubernetes + PostgreSQL Stale Data section | `.env*` is gitignored. No committed template. New devs must guess required vars. | Create immediately — blocks smooth onboarding. |

---

## 12. Where & How To Start — Work Stream Advisory

Grouped by parallel work streams derived from the coding start doc's requirement groupings. Each stream lists relevant requirement IDs, the files to start from, and specific guidance.

### Stream 0: Foundation Lock (SETUP-1, SETUP-2, RBAC-1, NFR-13, FR-S-2) — MUST COMPLETE FIRST

**Owner:** Tech lead / single person. This is the sequential bottleneck — nothing else starts until this is done.

| Task | Req ID | Start From | What To Do |
|------|--------|-----------|------------|
| Create `src/types/index.ts` | All | New file | Define `UserTier`, `ConsentStatus`, `StudentProfile`, `RecruiterProfile`, `JobPosting`, `AdminRecommendation` types. Lock before anyone starts pages. |
| Create service stubs in `src/lib/services/` | All | New directory | `consent.ts`, `student-profile.ts`, `job-board.ts`, `recommendations.ts`, `recruiter-search.ts`. Each exports typed async functions returning dummy data. |
| Create `src/components/TierGate.tsx` | RBAC-1 | New file | Wrapper component. Stub with `useAuth()` returning `'gold'` during dev. Every parallel builder uses this for restricted sections. |
| Create `src/middleware.ts` | RBAC-1 | New file | Route-level auth + tier blocking. Protects `/talent-discovery/*`, `/ixn-workflow-manager/*`, `/membership-dashboard/*`. |
| Create `.env.example` | SETUP-2 | New file | Document `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`. Update with every new env var. |
| Review + validate existing RBAC | RBAC-1 | `src/lib/access-control.ts`, `src/app/talent-discovery/page.tsx` | Verify `userCanAccessApp()` works for all tier combinations. Refactor inline tier checks in talent discovery page into service layer / `TierGate`. |
| Extend Prisma schema for V1 | SETUP-2 | `prisma/schema.prisma` | Add student profile fields, consent columns/table, job postings table. Run `npx prisma migrate dev`, then **all team members pull and migrate.** |
| Add student/admin seed users | SETUP-2 | `prisma/seed.ts` | Add STUDENT role users and at least one ADMIN user to seed for local testing. Currently only INDUSTRY partner users exist. |
| SSO placeholder | NFR-13 | `src/lib/auth.ts` | Per coding start doc: "develop UI, leave SSO out of it / keep placeholder." Add a comment and a disabled provider stub. Do not block on this. |

---

### Stream 1: Student Registration & Profile (FR-S-1, FR-S-6, FR-S-11, FR-S-2)

**Builds on:** Foundation Lock (Stream 0)

| Task | Req ID | Start From | What To Do |
|------|--------|-----------|------------|
| Student self-registration UI | FR-S-1 | `src/components/SignInForm.tsx`, `src/app/api/account/create-user/route.ts` | Either modify existing register flow to support non-admin registration with role assignment, or create a separate `/register` page + API route. Use dummy domain list for UCL email verification (real verification deferred). |
| Student profile form | FR-S-6 | `src/components/talent-discovery/StudentView.tsx` (currently empty shell) | Build profile fields UI (skills, experience, certifications, projects). Call `lib/services/student-profile.ts` stubs. Data shape from `types/index.ts`. |
| External profile links | FR-S-11 | Extends FR-S-6 | Add LinkedIn/GitHub URL fields to student profile. Store as simple string columns. |
| 2FA placeholder | FR-S-2 | `src/lib/auth.ts` | Per doc: "needs review, we should be able to handle it quick." For V1: add a stub/comment only. |

---

### Stream 2: Consent & Privacy (FR-S-13, FR-S-12, FR-S-3)

**Builds on:** Foundation Lock (Stream 0), partially on Stream 1 (student users must exist)

| Task | Req ID | Start From | What To Do |
|------|--------|-----------|------------|
| Consent toggle skeleton | FR-S-13 | `src/lib/services/consent.ts` (stub), new Prisma table/column | Binary provide/withdraw consent. Per doc: "add flag which companies given consent to view, query fetch only that particular company flag enabled/disabled." Start with a simple boolean, extend to per-company later. |
| Per-company whitelist/blacklist | FR-S-12 | Extends FR-S-13 | Junction table: `student_id`, `company_id`, `visibility` (whitelist/blacklist). Default visibility = true (accessible to all). Service layer enforces: all queries for students must join through this table. |
| Account deletion | FR-S-3 | `src/app/api/account/delete-user/route.ts` | Fix existing FK cascade (add cleanup for `MembershipDashboardMember`, `Account`, `Session`, `AuditLog`). Then expose self-delete UI for students. |

---

### Stream 3: Recruiter Registration & Job Board (FR-R-1, FR-R-14, FR-A-1)

**Builds on:** Foundation Lock (Stream 0)

| Task | Req ID | Start From | What To Do |
|------|--------|-----------|------------|
| Recruiter registration | FR-R-1 | `src/components/SignInForm.tsx`, `src/app/api/account/create-user/route.ts` | Recruiter self-registration with company domain. Per doc: dummy domain list for dev. Company registration goes to admin for approval (FR-A-1). |
| Admin approve/reject company | FR-A-1 | `src/app/api/account/update-user/route.ts` (already handles org creation + role assignment in transaction) | Build admin UI to list pending company registrations, approve (assign tier + role), or reject. The update-user route's org/role creation logic can be reused. |
| Recruiter post job | FR-R-14 | `src/components/talent-discovery/PartnerJobBoardView.tsx` (empty shell), `src/lib/services/job-board.ts` (stub) | New Prisma table for job postings. CRUD API routes. Form UI in partner job board view. Per doc: "block storage needs to be constructed — blob handling needs research." For V1: text fields only, defer file attachments. |

---

### Stream 4: CV Library & Recruiter Search (FR-S-4, FR-S-5, FR-S-7, FR-S-8, FR-R-3)

**Builds on:** Stream 1 (student profiles), Stream 2 (consent), Foundation Lock

| Task | Req ID | Start From | What To Do |
|------|--------|-----------|------------|
| CV upload | FR-S-4 | `src/components/talent-discovery/StudentView.tsx`, new `src/lib/services/cv.ts` | **Storage decision required first.** Per doc: "To discuss 2-3 approaches: store in PostgreSQL or external with Daniel. Potential simplified solution: create public GDrive links for testing as V1 workaround." |
| CV update/delete/replace | FR-S-5 | Extends FR-S-4 | Same storage backend. CRUD operations. |
| CV keyword tagging | FR-S-7 | Extends FR-S-4 | Per doc: "normalise tags single big string." Can push to stretch — "not directly NEEDed for other components, but beneficial for admin recommendation filter mechanism." |
| Multiple CV uploads | FR-S-8 | Extends FR-S-4 | Allow multiple CVs per student (e.g., ML-focused vs systems-focused). |
| Recruiter search students | FR-R-3 | `src/components/talent-discovery/PartnerFullView.tsx` (empty shell), `src/lib/services/recruiter-search.ts` (stub) | **Consent-gated, Gold/Platinum only.** Per doc: "location is straightforward + type of degree. Skills could tie to CV tagging but adds complexity." Service layer must enforce consent check before returning any student data. |

---

### Stream 5: Admin Panel & Recommendation Gateway (FR-A-2, FR-A-7a, FR-A-7b, FR-A-8, DASH-1)

**Builds on:** Stream 2 (consent), Stream 3 (approved recruiters), Foundation Lock

| Task | Req ID | Start From | What To Do |
|------|--------|-----------|------------|
| Admin suspend/ban | FR-A-2 | New Prisma table, new API route | Per doc: "separate access table — vs normalising only admin has access to. If a student is marked as suspended in parent table, it will suspend students from other related applications." Create `app_suspensions` table with `user_id`, `app_key`, `suspended_at`, `reason`. |
| Admin recommendation gateway (A1) | FR-A-7a | New `admin_recommendations` Prisma table, `src/lib/services/recommendations.ts` | **Highest-complexity V1 feature.** 3-layer dependency: consent check -> Gold/Platinum tier gate -> per-recruiter data isolation. Admin filters consented students by enums, tags to firm(s). Each firm sees only their "Recommended Students" tab. New table: `student_id`, `firm_id`, `admin_id`, `created_at`, `revoked_at`. |
| Revoke/amend recommendations | FR-A-7b | Extends FR-A-7a | Admin removes tag, access disappears from recruiter tab. Set `revoked_at` timestamp. |
| Admin surfaces firms to students (B) | FR-A-8 | `src/components/talent-discovery/StudentView.tsx` | Per doc: "looking to cut this — adds unnecessary complexity with not much value considering 1-to-many recruiter:student ratio." **Likely deferred.** If built: simple `admin_recommended` boolean or ordering weight on companies. |
| Admin dashboard — Talent Platform metrics | DASH-1 | `src/lib/membership-dashboard.ts` (existing pattern), new functions | Consented vs total student count, approved recruiter count, matchable pair count. Pie/donut visualisation. Per doc: "North star metric: What users passed initial verification, and can use platform without friction?" |

---

### Stream 6: Notifications & Contact (FR-R-8, FR-S-17) — L5, Lowest Priority

**Builds on:** Stream 4 (recruiter search must work)

| Task | Req ID | Start From | What To Do |
|------|--------|-----------|------------|
| Recruiter contacts student | FR-R-8 | `src/components/talent-discovery/PartnerFullView.tsx` | Per doc: "We will handle this simply, potentially with status message confirming comms is handled outside of platform / tooltips in UI." Implementation: `mailto:` link, not in-platform messaging. |
| Student notification on contact | FR-S-17 | New component | Per doc: "Default to email trigger. Potentially in app — build notification drop-down tab / bell icon exclusively for this type of notification." |
