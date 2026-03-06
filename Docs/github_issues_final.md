# Talent Platform V1 - GitHub Issues (V2 Final)

All amendments from `github_issues_v2_amendments.md` applied. This is the end-to-end issue list ready for `gh issue create`.

**Format note:** For each issue, `Title`, `Labels`, and `Milestone` are passed as `gh issue create` flags (`--title`, `--label`, `--milestone`). Everything under `--- BODY ---` is the `--body` content.

---

## Labels (created via `gh label create`)

| Label | Dimension | Colour |
|-------|-----------|--------|
| `arch` | Type | `#1D76DB` |
| `feature` | Type | `#0E8A16` |
| `infra` | Type | `#D93F0B` |
| `bug` | Type | `#E11D48` |
| `research` | Type | `#7C3AED` |
| `decision` | Type | `#BFD4F2` |
| `L1` | Layer | `#FBCA04` |
| `L2` | Layer | `#FEF2C0` |
| `L3` | Layer | `#F9D0C4` |
| `L4` | Layer | `#E6B8AF` |
| `L5` | Layer | `#D4C5F9` |

## Milestones (created via `gh api`)

| Milestone | Description |
|-----------|-------------|
| L1 - Foundation Lock | Auth, schema, RBAC, registration, shared type contracts, service stubs, cross-cutting architecture (error handling, validation, audit logging). Sequential bottleneck - nothing else starts until this is done. |
| L2 - Consent, Profiles, Job Board | Consent toggle, student profile, external links, admin company approval, recruiter job posting, UI state components, CV storage decision. |
| L3 - CV Library & Account Management | CV CRUD, keyword tagging, multiple CVs, account deletion, admin suspend/ban. |
| L4 - Search, Recommendations, Dashboard | Recruiter search, admin recommendation gateway, admin dashboard metrics. |
| L5 - Notifications & Stretch | Recruiter-student contact, notifications, stretch dashboard filters, deferred items. |

---

## L1 - Foundation Lock (20 issues)

---

### Issue #2

**Title:** [L1/decision] Map scaffold roles and tiers to Talent Platform user model
**Labels:** `decision`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**What and why**
The existing scaffold exposes `roleKeys` (e.g. ADMIN, MODULE_LEADER, MEMBER) and `membershipTierRank` (bronze=1, silver=2, gold=3, platinum=4) via the JWT session. The planning doc assumes a different user model: student, recruiter-silver, recruiter-gold, recruiter-platinum, admin. These don't map 1:1. Without an explicit mapping decision, every dev will interpret the tier model differently. This gates TierGate logic, middleware route protection, registration flows, and every tier-dependent feature.

**Scope**
- Document which existing `Role` values map to each planning doc user type
- Decide: does "student" become a new Role, or reuse an existing one?
- Decide: is `MEMBER` the base recruiter role, with tier differentiating silver/gold/platinum?
- Decide: does the scaffold's `MembershipTier` model work as-is, or does it need extending?
- Output: a single mapping table committed to CLAUDE.md or a decisions doc

**Acceptance criteria**
- [ ] Mapping table exists documenting: scaffold role/tier value -> planning doc user type
- [ ] STUDENT role confirmed as new or mapped to existing
- [ ] Recruiter tier differentiation confirmed (existing MembershipTier reuse or extension)
- [ ] TierGate, middleware, and registration issues can reference this mapping
- [ ] Decision reviewed by at least Sadhana (tech lead)

**Blocks:** #3 (type contracts), #5 (TierGate), #6 (middleware), #7 (RBAC refactor), #16 (login page), #17 (student registration), #18 (recruiter registration)

---

### Issue #3

**Title:** [L1/arch] Create shared type contracts (src/types/index.ts)
**Labels:** `arch`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**What and why**
Without a single type file, parallel builders invent their own data shapes and break against each other. The coding start doc calls this "the stable data contract" and it's the first thing to lock before anyone builds pages.

**Scope**
Create `src/types/index.ts` defining types for every entity that crosses a component boundary:
- `UserTier` (union of tier keys + `'student'` + `'admin'` - values derived from Issue #2 mapping)
- `ConsentStatus` (`'pending' | 'consented' | 'withdrawn'`)
- `UserRole` (union of role keys)
- `StudentProfile` (id, name, skills, experience, certifications, projects, externalLinks, consentStatus, tier)
- `RecruiterProfile` (id, name, firmId, firmName, tier, approvalStatus)
- `JobPosting` (id, firmId, title, location, salaryBand, roleType, description, postedAt, expiresAt)
- `AdminRecommendation` (id, studentId, firmId, adminId, createdAt, revokedAt)
- `StudentCV` (id, studentId, label, fileUrl, uploadedAt)
- `CompanyConsent` (studentId, companyId, consented, updatedAt)
- `ApiResponse<T>` (success, data?, error?) - shared API response shape (see Issue #8)

**Acceptance criteria**
- [ ] `src/types/index.ts` exists and exports all types listed above
- [ ] Types align with the Prisma schema extensions (Issue #13)
- [ ] No circular imports
- [ ] All downstream service stubs (Issue #4) import from this file

**Depends on:** #2 (role/tier mapping decision - needed to define UserTier correctly)
**Blocks:** Every L2+ feature issue

---

### Issue #4

**Title:** [L1/arch] Create service layer stubs (src/lib/services/)
**Labels:** `arch`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**What and why**
Pages call typed async functions from day one. When real logic lands later, pages get real data with zero refactoring. Currently no `services/` directory exists - business logic is scattered in `lib/membership-dashboard*.ts` and inline in pages.

**Scope**
Create `src/lib/services/` with stub files returning hardcoded dummy data:
1. `consent.ts` - `getConsentStatus(studentId)`, `setConsent(studentId, status)`, `getCompanyConsents(studentId)`, `setCompanyConsent(studentId, companyId, consented)`
2. `student-profile.ts` - `getStudentProfile(userId)`, `updateStudentProfile(userId, data)`, `searchStudents(filters)`
3. `job-board.ts` - `getJobPostings(filters)`, `getJobPosting(id)`, `createJobPosting(data)`, `updateJobPosting(id, data)`, `deleteJobPosting(id)`
4. `recommendations.ts` - `getRecommendationsForFirm(firmId)`, `createRecommendation(studentId, firmId, adminId)`, `revokeRecommendation(id)`
5. `recruiter-search.ts` - `searchConsentedStudents(filters, recruiterId)`
6. `cv.ts` - `uploadCV(studentId, file)`, `getCVs(studentId)`, `deleteCV(cvId)`, `replaceCV(cvId, file)`

**Acceptance criteria**
- [ ] All 6 service files exist under `src/lib/services/`
- [ ] Each function has a typed signature importing from `src/types/index.ts`
- [ ] Stubs return hardcoded dummy data matching the type contracts
- [ ] No direct Prisma calls in stubs (those get wired in L2-L4)

**Depends on:** #3 (type contracts)
**Blocks:** All L2+ feature issues

---

### Issue #5

**Title:** [L1/arch] Build TierGate component
**Labels:** `arch`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**What and why**
Component-level tier gating so parallel builders can wrap restricted UI sections with `<TierGate tier="gold">` instead of writing inline `if (user.tier === 'gold')` checks in page files. The coding start doc's "Key Rule" says: if you find yourself writing tier checks in a page, stop and use TierGate instead. Currently doesn't exist.

**Scope**
Create `src/components/TierGate.tsx` as a client component reading from session via `useSession()`:
- `<TierGate tier="gold">` renders children only if `userTierRank >= GOLD_RANK`
- `<TierGate role="ADMIN">` renders children only if `roleKeys.includes("ADMIN")`
- Both props combinable: `<TierGate tier="gold" role="MEMBER">` requires BOTH
- When gated out: renders `null` (hidden), not an error page
- Dev bypass mode: always renders children, controlled by env var or constant
- Tier rank values derived from Issue #2 mapping

**Acceptance criteria**
- [ ] `TierGate` component exists and is importable
- [ ] Supports `tier`, `role`, and combined props
- [ ] Reads tier/role from JWT session (no extra DB calls)
- [ ] Dev bypass mode toggle exists

**Depends on:** #2 (role/tier mapping)
**Blocks:** All L2+ UI issues with restricted sections

---

### Issue #6

**Title:** [L1/arch] Create middleware route protection (src/middleware.ts)
**Labels:** `arch`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**What and why**
Route-level auth + tier blocking before page render - the first layer of defence. TierGate (#5) is the second layer at component level. Currently no middleware exists; all checks happen inside page components.

**Scope**
Create `src/middleware.ts` with `config.matcher` for protected routes:

| Route | Required | Logic |
|-------|----------|-------|
| `/talent-discovery*` | Authenticated | All views require sign-in |
| `/talent-discovery?view=cv-library` | Gold+ or ADMIN | Tier rank >= 3 |
| `/talent-discovery?view=job-board` | Silver+ or ADMIN | Tier rank >= 2 |
| `/talent-discovery?view=student` | STUDENT or ADMIN | Role check |
| `/membership-dashboard*` | Authenticated | Existing `userCanAccessApp` handles rest |
| `/account/add-user` | ADMIN | Defence-in-depth |
| `/api/account/*` (except register) | Authenticated | Catch before route handler |

Decode JWT, check auth, check tier rank from token. Redirect to `/sign-in` or `/access-denied`.

**Acceptance criteria**
- [ ] `src/middleware.ts` exists with `config.matcher`
- [ ] Unauthenticated users redirected to `/sign-in`
- [ ] Tier-gated routes redirect to `/access-denied` when tier insufficient
- [ ] Pages still call `userCanAccessApp()` for DB-backed checks (defence in depth)

**Depends on:** #2 (role/tier mapping)
**Blocks:** All L2+ route-level access control

---

### Issue #7

**Title:** [L1/arch] Review and refactor existing RBAC logic
**Labels:** `arch`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**What and why**
The existing `userCanAccessApp()` in `src/lib/access-control.ts` works at the app level but not at the sub-page/component level. The talent-discovery page has inline rank checks (`SILVER_RANK = 2`, `GOLD_RANK = 3` hardcoded on lines 69-70) - exactly the anti-pattern the coding start doc warns against. This needs refactoring before parallel builders add more pages.

**Scope**
- Verify `userCanAccessApp()` works for all tier combinations
- Refactor inline tier checks in `src/app/talent-discovery/page.tsx` into service layer / TierGate
- Add `userCanAccessFeature(userId, featureName)` that checks tier against a feature-permission map
- Define the feature-permission config map centrally

**Acceptance criteria**
- [ ] No hardcoded tier rank constants in page files
- [ ] `userCanAccessFeature()` exists in `access-control.ts`
- [ ] Feature-permission map is a config object, not scattered logic
- [ ] All existing RBAC paths verified with test scenarios (admin, gold, silver, bronze, student)

**Depends on:** #2 (role/tier mapping), #5 (TierGate component)
**Blocks:** L2+ pages that need feature-level gating

---

### Issue #8

**Title:** [L1/arch] Define error handling contract
**Labels:** `arch`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**What and why**
Five developers building different pages will each handle errors differently unless a pattern is defined. Without this, debugging integration issues across features will be painful. No error contract currently exists in the scaffold.

**Scope**
- Define a shared error type
- Define a standard API response shape: `{ success: boolean, data?: T, error?: { code: string, message: string } }`
- Create a client-side error boundary component
- Document the pattern so all streams follow it

**Acceptance criteria**
- [ ] `ApiResponse<T>` type defined in `src/types/index.ts`
- [ ] Error boundary component created
- [ ] At least one existing API route refactored to use the new response shape as a reference implementation
- [ ] Pattern documented in `CLAUDE.md` or a `CONTRIBUTING.md`

**Depends on:** #3 (type contracts)
**Blocks:** All API route development in L2+

---

### Issue #9

**Title:** [L1/arch] Define data validation layer (Zod schemas)
**Labels:** `arch`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**What and why**
Student profile fields, job posting fields, and company registration all accept user input. Without a shared validation approach, each developer invents their own rules. Zod schemas co-located with type contracts are the natural fit with Prisma + TypeScript.

**Scope**
- Install Zod
- Create validation schemas for each entity in `src/types/` (or `src/lib/validation/`)
- Each form submission validates against the schema before hitting the DB
- Schemas align with Prisma model constraints

**Acceptance criteria**
- [ ] Zod installed as a dependency
- [ ] Validation schemas exist for: `StudentProfile`, `JobPosting`, `UserRegistration`, `CompanyConsent`
- [ ] At least one existing API route uses schema validation as reference implementation
- [ ] Validation errors return structured messages via the error handling contract (#8)

**Depends on:** #3 (type contracts), #8 (error contract)
**Blocks:** All form-based features in L2+

---

### Issue #10

**Title:** [L1/arch] Centralized audit logging pattern
**Labels:** `arch`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**What and why**
Report 3's schema includes `cv_access_logs` for GDPR audit trail, and the `AuditLog` model already exists in the Prisma schema. But no pattern defines when/how logs get written. Every service that exposes student data to a recruiter should call a centralized `auditLog()` function. Without this, some features will log and others won't, defeating GDPR compliance.

**Scope**
- Create `src/lib/services/audit.ts` with `auditLog(action, actorId, targetStudentId?, metadata?)` function
- Define action enum: `CV_VIEWED`, `STUDENT_SEARCHED`, `RECOMMENDATION_CREATED`, `CONSENT_CHANGED`, etc.
- Wire into the existing `AuditLog` Prisma model
- Document which service functions must call audit logging

**Acceptance criteria**
- [ ] `auditLog()` function exists and writes to `AuditLog` table
- [ ] Action enum covers all GDPR-relevant operations
- [ ] Documentation lists which service functions require audit calls
- [ ] Function is non-blocking (doesn't slow down the main request)

**Depends on:** #3 (type contracts for action enum). Note: AuditLog model already exists in scaffold Prisma schema - no schema change needed for this service.
**Blocks:** L4 recruiter search, L4 recommendation gateway

---

### Issue #11

**Title:** [L1/arch] Centralized student data access layer
**Labels:** `arch`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**What and why**
Multiple features query student profiles with different visibility rules: (a) recruiter search returns only consented students filtered by tier, (b) admin recommendation view returns all consented students with no tier restriction, (c) admin dashboard counts all students regardless of consent for the total count metric. If each feature writes its own Prisma query, consent logic will be inconsistent.

**Scope**
Create a single `getStudents(filters, callerRole, callerCompanyId?)` function in `src/lib/services/student-profile.ts` that applies correct visibility rules based on who's asking:
- Recruiter caller: consent-gated + tier-gated
- Admin caller: consent-gated, no tier restriction
- Dashboard caller: all students, no consent filter (for total count metric)

**Acceptance criteria**
- [ ] `getStudents()` function exists with role-based visibility logic
- [ ] Recruiter queries only return consented students
- [ ] Admin queries return all consented students regardless of tier
- [ ] Dashboard queries return total counts without consent filter
- [ ] No downstream feature calls Prisma directly for student data

**Depends on:** #4 (service stubs)
**Blocks:** L4 recruiter search, L4 recommendation gateway, L4 dashboard metrics

---

### Issue #12

**Title:** [L1/arch] Company lifecycle state machine
**Labels:** `arch`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**What and why**
A company goes through: registered -> pending admin approval -> approved (with tier) -> potentially suspended/banned. These states are treated as separate features (FR-A-1 approval, FR-A-2 suspend/ban) but share state. A recruiter from a suspended company shouldn't see anything; a recruiter from a pending company shouldn't access talent features.

**Scope**
- Define company status enum: `PENDING`, `APPROVED`, `SUSPENDED`, `BANNED`
- Create `getCompanyStatus(companyId)` function returning the enum
- Wire into auth flow - `userCanAccessApp()` must check company status
- Ensure the `AppSuspension` table (L3, #33) feeds into this state machine

**Acceptance criteria**
- [ ] Company status enum defined in `src/types/index.ts`
- [ ] `getCompanyStatus()` function exists in a service file
- [ ] `userCanAccessApp()` extended to check company status
- [ ] Pending/suspended/banned company users blocked from talent features

**Depends on:** #3 (type contracts), #7 (RBAC refactor)
**Blocks:** L2 admin company approval (#27), L3 admin suspend/ban (#33)

---

### Issue #13

**Title:** [L1/infra] Extend Prisma schema for V1
**Labels:** `infra`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**What and why**
The existing schema lacks tables/fields needed for the Talent Platform. Per the implementation playbook's refined schema decisions, the following must be added in a single coordinated migration before parallel work starts. This is the #2 parallelisation risk - schema drift without CI/CD.

**Scope**
Add to `prisma/schema.prisma`:
- `StudentProfile` table (separate from User - follows `MembershipDashboardMember` pattern): `student_id` FK, `skills` (string[]), `experience_years` (int), `degree_type` (enum: BSc/MSc/MEng/PhD/other), `location` (string), `certifications` (string[]), `projects` (JSON), `linkedin_url`, `github_url`
- `StudentCompanyConsent` junction table: `student_id`, `company_id`, `consented` (bool), `updated_at` - handles both FR-S-13 (consent toggle) and FR-S-12 (per-company whitelist/blacklist) in one migration
- `JobPosting` table: `id`, `firm_id` FK, `posted_by_id` FK, `title`, `location`, `salary_band`, `role_type` (enum), `description` (text), `is_active` (bool), `posted_at`, `expires_at`
- `StudentCV` table: `id`, `student_id` FK, `label`, `file_url` (string), `uploaded_at`
- `AdminRecommendation` table: `student_id` FK, `firm_id` FK, `admin_id` FK, `created_at`, `revoked_at` - index on `(firm_id, revoked_at)`
- `AppSuspension` table: `id`, `user_id` FK, `app_key`, `reason`, `suspended_at`, `lifted_at`

Also define the file storage abstraction interface in `src/lib/services/cv.ts` regardless of storage backend decision. Interface: `uploadFile(file, metadata): Promise<FileRef>`, `getFile(fileRef): Promise<Buffer>`, `deleteFile(fileRef): Promise<void>`. This abstraction means swapping storage backend later (URL field -> S3) only changes the service implementation, not any consuming code.

Run `npx prisma migrate dev`. All team members must pull and migrate after this lands.

**Acceptance criteria**
- [ ] All 6 new models added to `prisma/schema.prisma`
- [ ] Migration runs cleanly on a fresh database
- [ ] Enum values for `degree_type` and `role_type` agreed and locked
- [ ] Schema announcement posted to team channel per migration protocol
- [ ] `npx prisma generate` produces updated client types
- [ ] File storage abstraction interface defined in `cv.ts`

**Depends on:** Nothing - can start immediately
**Blocks:** Every L2+ feature that touches the DB

---

### Issue #14

**Title:** [L1/infra] Add student, admin, and recruiter seed users
**Labels:** `infra`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**What and why**
The seed script (`prisma/seed.ts`) only creates INDUSTRY partner users from `prisma/members.yml`. No STUDENT, ADMIN, or pending RECRUITER users exist for local dev testing. Without these, developers can't test student/recruiter/admin flows locally.

**Scope**
- Add STUDENT role users (at least 3, with varying consent states)
- Add at least 1 ADMIN user
- Add at least 1 approved RECRUITER user with firm association
- Add at least 1 pending RECRUITER user (for testing approval flow)
- Populate seed `StudentProfile` records for the student users
- Update `prisma/members.yml` or create separate seed fixture

**Acceptance criteria**
- [ ] `npx prisma db seed` creates student, admin, and recruiter users
- [ ] Student users have populated `StudentProfile` records
- [ ] At least one student has consent records
- [ ] Seed is idempotent (can run multiple times without duplicates)

**Depends on:** #13 (Prisma schema extension)
**Blocks:** L2 consent, L2 student profile, L2 recruiter flows

---

### Issue #15

**Title:** [L1/infra] Create .env.example
**Labels:** `infra`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**What and why**
All `.env*` files are gitignored. No committed template exists. New developers must guess required environment variables. The coding start doc flags this as a gap - any new env var must be added to `.env.example` in the same commit.

**Scope**
Create `.env.example` documenting:
- `DATABASE_URL` (PostgreSQL connection string)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- Placeholder for future vars (S3 keys if CV storage goes external, SSO endpoints)

**Acceptance criteria**
- [ ] `.env.example` committed to repo
- [ ] All currently required env vars documented with example values
- [ ] `CLAUDE.md` updated to reference `.env.example`

**Depends on:** Nothing
**Blocks:** Developer onboarding

---

### Issue #16

**Title:** [L1/feature] Login page UI review and refactor (SETUP-1)
**Labels:** `feature`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**As a** user, **I want** the login page to work correctly for students, recruiters, and admins, **so that** I can access the platform based on my role.

**What this means**
The planning doc explicitly identifies SETUP-1 (login page) as the most important L1 task. The existing `SignInForm.tsx` and `sign-in/page.tsx` work for admin-only login, but the register button is gated behind an admin check. Post-login routing in `post-sign-in/page.tsx` partially handles STUDENT redirect but has no RECRUITER-specific routing. Quality of existing login UI needs verification and potential refactoring per planning doc notes.

**Scope**
- Review existing `SignInForm.tsx` for code quality and role handling
- Verify post-login redirect logic in `post-sign-in/page.tsx` for all roles (student, recruiter tiers, admin)
- Add recruiter-specific post-login routing (currently missing)
- Add "Register" link/button that routes to new `/register` page (built in #17 and #18) without admin gate
- Ensure login error states are clear and accessible
- Remove or gate the existing admin-only register flow in SignInForm

**Acceptance criteria**
- [ ] Login works for student, recruiter (all tiers), and admin accounts
- [ ] Post-login redirect routes each role to the correct view
- [ ] Register link visible to unauthenticated users (no admin gate)
- [ ] Login error messages are clear
- [ ] Existing admin functionality preserved

**Depends on:** #2 (role/tier mapping)
**Blocks:** All user-facing features that require authentication

---

### Issue #17

**Title:** [L1/feature] Student self-registration with UCL domain check
**Labels:** `feature`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**As a** UCL student, **I want to** register for the Talent Platform using my UCL email, **so that** I can create a profile and make myself visible to approved recruiters.

**What this means**
Currently, registration is admin-only (`SignInForm` checks admin status, `create-user` API is admin-gated). Students need a self-service registration path. Per the coding start doc: use a dummy domain list for dev (`@ucl.ac.uk`), real UCL verification deferred.

**Scope**
- New `/register` page (shared with recruiter registration, #18) with role selector
- New `/api/account/register` route (separate from admin `create-user`)
- UCL email domain validation (dummy list: `@ucl.ac.uk` for dev)
- Account created with `STUDENT` role, consent status = pending
- Redirect to `/talent-discovery?view=student` after registration

**Acceptance criteria**
- [ ] Students can register without admin involvement
- [ ] Non-UCL emails rejected with clear error message
- [ ] `STUDENT` role auto-assigned on registration
- [ ] Post-registration redirect works correctly
- [ ] Password stored with bcrypt (not plaintext)

**Depends on:** #13 (schema), #15 (.env.example)
**Blocks:** L2 student profile, L2 consent

---

### Issue #18

**Title:** [L1/feature] Recruiter self-registration with pending approval flow
**Labels:** `feature`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**As a** recruiter, **I want to** register my company account on the Talent Platform, **so that** I can access the job board and (once approved) search for talent.

**What this means**
Recruiters can self-register but their account starts in a pending state. They cannot access talent features until an admin approves their company and assigns a membership tier. The existing `create-user` route is admin-only; a new self-service path is needed.

**Scope**
- Shared `/register` page with student registration (#17) - role selector ("I'm a student" / "I'm a recruiter")
- Recruiter enters: company email, name, company name, password
- Account created with `PENDING_RECRUITER` status (no active role)
- Company domain recorded for admin review
- Recruiter sees a "pending approval" message on login until admin approves

**Acceptance criteria**
- [ ] Recruiters can self-register
- [ ] Account created in pending state (no access to talent features)
- [ ] Company name/domain captured
- [ ] Pending recruiter login shows "awaiting approval" message
- [ ] Admin can see pending registrations (wired in L2, #27)

**Depends on:** #13 (schema), #12 (company lifecycle)
**Blocks:** L2 admin company approval (#27)

---

### Issue #19

**Title:** [L1/feature] SSO placeholder stub and scaffold review
**Labels:** `feature`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**As a** platform maintainer, **I want** the SSO integration point documented and stubbed, **so that** UCL Shibboleth/SAML can be wired in post-handover without restructuring auth.

**What this means**
The coding start doc says "SSO is already in scaffold" but this is inaccurate - only credentials auth exists. No Shibboleth/SAML provider is configured. Per the doc's recommendation: "develop UI, leave SSO out of it / keep placeholder."

**Scope**
- Review existing auth code in `src/lib/auth.ts` for SSO readiness
- Add a disabled/commented NextAuth provider stub for Shibboleth/SAML
- Document what UCL IT needs to provide (metadata URL, entity ID, certificate)
- Ensure the auth flow doesn't hardcode assumptions that would break when SSO is added

**Acceptance criteria**
- [ ] SSO provider stub exists in `auth.ts` (disabled/commented)
- [ ] Documentation lists UCL IT prerequisites for SSO activation
- [ ] Auth flow reviewed - no hard blockers for future SSO integration identified
- [ ] `CLAUDE.md` updated with SSO status

**Depends on:** Nothing
**Blocks:** Nothing (informational for handover)

---

### Issue #20

**Title:** [L1/feature] 2FA review and placeholder
**Labels:** `feature`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**As a** platform maintainer, **I want** 2FA readiness assessed, **so that** it can be activated when SSO is integrated post-handover.

**What this means**
The coding start doc notes "2FA is already built-in via SSO integration BUT we don't know if Daniel has implemented it." He has not - no 2FA exists. 2FA depends on SSO which also doesn't exist. For V1: stub/comment only.

**Scope**
- Review whether NextAuth v4 supports TOTP/2FA natively or via plugin
- Document the recommended 2FA approach for post-SSO integration
- Add placeholder configuration or comment in `auth.ts`

**Acceptance criteria**
- [ ] 2FA feasibility documented
- [ ] Placeholder/comment in `auth.ts`
- [ ] Recommended approach noted for handover documentation

**Depends on:** #19 (SSO review)
**Blocks:** Nothing (informational for handover)

---

### Issue #21

**Title:** [L1/bug] Fix temp password generation - use crypto.randomBytes
**Labels:** `bug`, `L1`
**Milestone:** L1 - Foundation Lock

--- BODY ---

**What and why**
`src/app/api/account/create-user/route.ts` uses `Math.random()` for temporary password generation. `Math.random()` is not cryptographically secure - passwords are predictable. Must use `crypto.randomBytes()` before any registration flow goes live.

**Scope**
Replace `Math.random()` with `crypto.randomBytes()` in the `create-user` route.

**Acceptance criteria**
- [ ] Temp passwords generated with `crypto.randomBytes()`
- [ ] Existing functionality unchanged (user still receives temp password)

**Depends on:** Nothing
**Blocks:** #17 (student registration), #18 (recruiter registration)

---

## L2 - Consent, Profiles, Job Board (7 issues)

---

### Issue #22

**Title:** [L2/arch] Loading, empty, and error state UI components
**Labels:** `arch`, `L2`
**Milestone:** L2 - Consent, Profiles, Job Board

--- BODY ---

**What and why**
Service stubs return dummy data during dev, but UI components also need defined states: what does a recruiter dashboard look like with zero recommended students? What does the consent toggle show during a network request? Without shared components, each dev invents their own spinner and empty state, resulting in inconsistent UX.

**Scope**
Create shared UI components in `src/components/ui/`:
- `<LoadingState />` - spinner/skeleton for data loading
- `<EmptyState message="..." />` - friendly empty state with customizable message
- `<ErrorState error={...} />` - error display using the error contract (#8)

**Acceptance criteria**
- [ ] Three components exist in `src/components/ui/`
- [ ] Consistent styling with existing MUI theme
- [ ] Each component accepts customization props (message, icon, retry action)
- [ ] At least one existing page refactored to use them as reference

**Depends on:** #8 (error handling contract)
**Blocks:** Nothing strictly. Recommended to land before L2 UI work begins to ensure consistency, but L2 features can start without this if needed.

---

### Issue #23

**Title:** [L2/decision] CV storage architecture decision
**Labels:** `decision`, `L2`
**Milestone:** L2 - Consent, Profiles, Job Board

--- BODY ---

**What and why**
FR-S-4 (CV upload) requires file storage. The coding start doc flags this as needing discussion with Daniel: "To discuss 2-3 approaches: store in PostgreSQL or external with Daniel." The storage decision must be made before L3 CV work begins. The options are well-defined - this is a decision to make, not open-ended research.

**Scope**
Decide between:
- **Option A: External URL field** - student provides a GDrive/hosted link. Zero infrastructure. Fastest V1 delivery.
- **Option B: S3-compatible storage** - upload to S3/Supabase/R2. Industry standard. Requires cloud account.
- **Option C: PostgreSQL bytea** - store bytes in DB. Not recommended by Prisma docs.

Implementation playbook recommends: Option A for V1 (URL field), migrate to Option B before production. The `StudentCV` schema stores `file_url` (string) regardless - swapping backend later changes only the service layer (file storage abstraction defined in #13).

**Acceptance criteria**
- [ ] Decision documented and agreed with Daniel/client
- [ ] If Option B chosen: required env vars added to `.env.example`
- [ ] `src/lib/services/cv.ts` interface works regardless of backend choice

**Depends on:** Nothing (decision can happen in parallel)
**Blocks:** L3 CV upload (#29)

---

### Issue #24

**Title:** [L2/feature] Consent toggle - binary provide/withdraw
**Labels:** `feature`, `L2`
**Milestone:** L2 - Consent, Profiles, Job Board

--- BODY ---

**As a** student, **I want to** control whether recruiters can see my profile, **so that** I maintain privacy and only share my information when I choose to.

**What this means**
Students need a binary toggle: "make me visible to recruiters" / "hide me from recruiters." This is the simplest consent mechanism. Per the implementation playbook, this uses the `StudentCompanyConsent` junction table - a global consent creates rows for all approved companies.

**Scope**
- UI toggle in `StudentView.tsx` (currently empty shell)
- Wire `lib/services/consent.ts` stub to real Prisma queries
- `setConsent(studentId, status)` creates/updates consent records
- `getConsentStatus(studentId)` returns current status
- Default: not consented (no rows = hidden)

**Acceptance criteria**
- [ ] Consent toggle visible in student view
- [ ] Toggle persists to DB via `StudentCompanyConsent` table
- [ ] Toggling off removes visibility from all recruiters
- [ ] Toggling on makes student visible to all approved companies (default whitelist)
- [ ] Consent changes logged via audit function (#10)

**Depends on:** #4 (service stubs), #14 (seed users)

---

### Issue #25

**Title:** [L2/feature] Per-company whitelist/blacklist consent
**Labels:** `feature`, `L2`
**Milestone:** L2 - Consent, Profiles, Job Board

--- BODY ---

**As a** student, **I want to** choose which specific companies can see my profile, **so that** I can share my information with companies I'm interested in while blocking others.

**What this means**
Extends the binary consent toggle (#24) with per-company granularity. A student who has consented globally can blacklist specific companies, or a student can whitelist only specific companies. Uses the same `StudentCompanyConsent` junction table.

**Scope**
- UI in `StudentView.tsx`: list of approved companies with per-company toggle
- `setCompanyConsent(studentId, companyId, consented)` - sets per-company override
- `getCompanyConsents(studentId)` - returns list of company-specific consent states
- `isVisibleToCompany(studentId, companyId)` - used by recruiter-facing queries
- All recruiter queries JOIN through this table - never bypass

**Acceptance criteria**
- [ ] Student can see list of approved companies
- [ ] Per-company toggle works independently of global consent
- [ ] Recruiter search (L4) respects per-company consent
- [ ] Admin recommendations (L4) respect per-company consent
- [ ] Changes logged via audit function

**Depends on:** #24 (binary consent)

---

### Issue #26

**Title:** [L2/feature] Student profile form - skills, experience, certifications, projects, external links
**Labels:** `feature`, `L2`
**Milestone:** L2 - Consent, Profiles, Job Board

--- BODY ---

**As a** student, **I want to** build a profile showcasing my skills and experience, **so that** recruiters and admins can find and recommend me for relevant opportunities.

**What this means**
The `StudentView.tsx` component is currently an empty shell with placeholder text. This issue fills it with a profile form that writes to the `StudentProfile` table. Includes external profile links (LinkedIn, GitHub) as optional URL fields.

**Scope**
- Profile form in `StudentView.tsx` with fields:
  - Skills (multi-select or tag input, stored as string[])
  - Experience years (number)
  - Degree type (dropdown: BSc, MSc, MEng, PhD, other)
  - Location (text input)
  - Certifications (tag input, stored as string[])
  - Projects (structured input - title, description, URL)
  - LinkedIn URL and GitHub URL (optional, validated as URL format, displayed as external links opening in new tab)
- Wire `lib/services/student-profile.ts` to real Prisma CRUD
- Validate input with Zod schema (#9)

**Acceptance criteria**
- [ ] Profile form renders in student view
- [ ] All fields save to `StudentProfile` table
- [ ] Form validates input before submission
- [ ] Profile data loads on page revisit (edit mode)
- [ ] Degree type and location fields match the enum values agreed in #13
- [ ] LinkedIn and GitHub URL fields present on profile form (optional)
- [ ] URLs validated as valid format
- [ ] Links render as clickable external links (new tab)

**Depends on:** #9 (validation), #17 (student registration)

---

### Issue #27

**Title:** [L2/feature] Admin approve/reject company registration
**Labels:** `feature`, `L2`
**Milestone:** L2 - Consent, Profiles, Job Board

--- BODY ---

**As an** admin, **I want to** review and approve or reject recruiter company registrations, **so that** only verified companies can access the talent platform.

**What this means**
When a recruiter self-registers (#18), their account is pending. The admin needs a UI to see pending registrations, approve (assign tier + MEMBER role + organisation), or reject. The existing `update-user/route.ts` already handles org creation and role assignment in a transaction - this can be reused. The admin must select which membership tier to assign during approval (silver, gold, or platinum). This determines what platform features the recruiter can access. The tier selection should be a dropdown in the approval UI. Bronze tier means no platform access, so approving as bronze is equivalent to rejecting.

**Scope**
- Admin panel section: "Pending Company Registrations" list
- Each entry shows: company name, domain, registrant email, registration date
- Approve action: assign membership tier (silver/gold/platinum dropdown), create/link Organisation, assign MEMBER role
- Reject action: mark as rejected (user can't access talent features)
- Notification to recruiter on approval/rejection (can be simple - next login shows status)

**Acceptance criteria**
- [ ] Admin can see list of pending company registrations
- [ ] Approve assigns tier + role + organisation
- [ ] Admin selects tier during approval (silver/gold/platinum dropdown)
- [ ] Reject prevents access
- [ ] Approved recruiter can access talent features on next login
- [ ] Reuses existing `update-user` transaction logic where possible

**Depends on:** #18 (recruiter registration), #12 (company lifecycle)

---

### Issue #28

**Title:** [L2/feature] Recruiter post job - text-only job postings
**Labels:** `feature`, `L2`
**Milestone:** L2 - Consent, Profiles, Job Board

--- BODY ---

**As a** recruiter, **I want to** post job listings for students to browse, **so that** I can attract UCL talent to my company's opportunities.

**What this means**
The `PartnerJobBoardView.tsx` component is currently an empty shell. Recruiters need a form to create job postings and students need a listing view. For V1: text-only postings, no file attachments (storage deferred per coding start doc).

**Scope**
- Job posting form in `PartnerJobBoardView.tsx`: title, location, salary band (free text), role type (enum: internship/graduate/placement/part_time/full_time), description (text), expiry date
- Wire `lib/services/job-board.ts` to real Prisma CRUD
- Job listing view for students (in `StudentView.tsx` or via `?view=job-board`)
- Only the posting recruiter's firm can edit/delete their postings
- `is_active` toggle for recruiters to hide/show postings

**Acceptance criteria**
- [ ] Recruiter can create, edit, delete job postings
- [ ] Students can browse active job listings
- [ ] Job postings display: title, company, location, salary band, role type, description
- [ ] Only the posting firm's users can edit/delete
- [ ] Expired postings auto-hidden or flagged
- [ ] Input validated with Zod schema

**Depends on:** #9 (validation), #27 (approved companies exist)

---

## L3 - CV Library & Account Management (5 issues)

---

### Issue #29

**Title:** [L3/feature] CV upload, update, delete, and replace
**Labels:** `feature`, `L3`
**Milestone:** L3 - CV Library & Account Management

--- BODY ---

**As a** student, **I want to** upload and manage my CV on the platform, **so that** approved recruiters and admins can access it when evaluating me for opportunities.

**What this means**
Core CV CRUD operations. The storage backend depends on the CV storage decision (#23). Regardless of storage backend choice, the code calls the file storage abstraction interface defined in `src/lib/services/cv.ts` (#13). If Option A (URL field), the "upload" is just saving a user-provided URL. If Option B (S3), it's a real file upload. The UI and service layer work identically in both cases. The `StudentCV` table schema works for both.

**Scope**
- CV management section in `StudentView.tsx`
- Upload: create `StudentCV` record with `file_url` and `label`
- Update: change label or URL
- Delete: remove `StudentCV` record (and file from storage if Option B)
- Replace: update `file_url` on existing record
- Wire `lib/services/cv.ts` to real implementation via storage abstraction

**Acceptance criteria**
- [ ] Student can upload a CV (link or file depending on storage decision)
- [ ] Student can view their uploaded CVs
- [ ] Student can delete a CV
- [ ] Student can replace/update a CV
- [ ] CV access logged via audit function (#10)

**Depends on:** #23 (storage decision), #26 (student profile)

---

### Issue #30

**Title:** [L3/feature] Multiple CV uploads per student
**Labels:** `feature`, `L3`
**Milestone:** L3 - CV Library & Account Management

--- BODY ---

**As a** student, **I want to** upload multiple CVs with different labels, **so that** I can tailor my applications (e.g., ML-focused vs systems-focused CV).

**What this means**
Extends CV upload (#29) to support multiple CVs per student. Each CV has a `label` field for identification. The `StudentCV` table already supports this (1:many relationship via `student_id` FK).

**Scope**
- UI: list of uploaded CVs with labels
- Add new CV button (no limit on count for V1, or set reasonable max like 5)
- Each CV independently uploadable/deletable/replaceable
- Primary CV designation (optional - could be "most recent" by default)

**Acceptance criteria**
- [ ] Student can have multiple CVs simultaneously
- [ ] Each CV has a unique label
- [ ] All CVs manageable independently
- [ ] CV list displays with labels and upload dates

**Depends on:** #29 (basic CV CRUD)

---

### Issue #31

**Title:** [L3/feature] CV keyword tagging
**Labels:** `feature`, `L3`
**Milestone:** L3 - CV Library & Account Management

--- BODY ---

**As a** student, **I want to** tag my CVs with keywords, **so that** admins can filter and recommend me more effectively.

**What this means**
Per the coding start doc: "normalise tags single big string." Can push to stretch - "not directly NEEDed for other components, but beneficial for admin recommendation filter mechanism." Tags enable the admin to filter students by skill area when making recommendations.

**Scope**
- Tag input on CV upload/edit form
- Tags stored as string array or comma-separated string on `StudentCV`
- Tags queryable by admin recommendation service (L4)

**Acceptance criteria**
- [ ] Student can add keyword tags to each CV
- [ ] Tags stored and retrievable
- [ ] Tags searchable/filterable (used by L4 recommendation gateway)

**Depends on:** #29 (basic CV CRUD)

---

### Issue #32

**Title:** [L3/feature] Account deletion - fix FK cascade and self-delete UI
**Labels:** `feature`, `L3`
**Milestone:** L3 - CV Library & Account Management

--- BODY ---

**As a** student, **I want to** delete my account and all associated data, **so that** I can exercise my right to be forgotten per GDPR.

**What this means**
The existing `delete-user/route.ts` cleans up `UserRole` and `Membership` but does NOT clean up `MembershipDashboardMember`, `Account`, `Session`, `AuditLog`, `StudentProfile`, `StudentCompanyConsent`, `StudentCV`, or `AdminRecommendation` records. This will throw FK constraint errors. The endpoint also needs a student-facing self-delete UI.

**Scope**
- Fix FK cascade in `delete-user/route.ts`: add cleanup for all related tables in the transaction
- Add self-delete button in student profile/account page
- Confirmation dialog (irreversible action)
- On deletion: remove all student data, consent records, CVs, recommendations

**Acceptance criteria**
- [ ] Account deletion succeeds without FK constraint errors
- [ ] All related records cleaned up: `StudentProfile`, `StudentCompanyConsent`, `StudentCV`, `AdminRecommendation`, `MembershipDashboardMember`, `Account`, `Session`
- [ ] AuditLog records retained even after deletion (GDPR audit trail - do not delete). The deleted user's AuditLog entries should be anonymised (replace user ID with a hash or "deleted-user" placeholder) but not removed, per GDPR right to erasure which permits retention of anonymised audit records.
- [ ] Student-facing self-delete UI with confirmation dialog
- [ ] Admin can still delete any user (existing functionality preserved)

**Depends on:** #13 (schema - new tables must be included in cleanup)

---

### Issue #33

**Title:** [L3/feature] Admin suspend/ban - per-app AppSuspension table
**Labels:** `feature`, `L3`
**Milestone:** L3 - CV Library & Account Management

--- BODY ---

**As an** admin, **I want to** suspend or ban a student or company from the Talent Platform without affecting their access to other apps, **so that** I can enforce platform rules without cross-app side effects.

**What this means**
Per the coding start doc: "separate access table - vs normalising only admin has access to. If a student is marked as suspended in parent table, it will suspend students from other related applications." A separate `AppSuspension` table scopes suspension to a specific app context.

**Scope**
- `AppSuspension` table already added in #13
- Admin UI: suspend/ban button on user management panel
- Suspend: sets `suspended_at`, user loses access to specified app
- Lift: sets `lifted_at`, access restored
- Ban: permanent suspension (no `lifted_at`)
- `userCanAccessApp()` extended to check `AppSuspension` table

**Acceptance criteria**
- [ ] Admin can suspend a user from a specific app
- [ ] Suspended user cannot access the app (redirected to access-denied)
- [ ] Admin can lift a suspension
- [ ] Suspension is per-app (other apps unaffected)
- [ ] Suspension history retained for audit (rows not deleted)

**Depends on:** #13 (schema), #12 (company lifecycle state machine)

---

## L4 - Search, Recommendations, Dashboard (3 issues)

---

### Issue #34

**Title:** [L4/feature] Recruiter search students - consent-gated, Gold/Platinum only
**Labels:** `feature`, `L4`
**Milestone:** L4 - Search, Recommendations, Dashboard

--- BODY ---

**As a** Gold or Platinum tier recruiter, **I want to** search for students by skills, degree, and location, **so that** I can find relevant UCL talent for my company's opportunities.

**What this means**
The `PartnerFullView.tsx` component is currently an empty shell. This is the core talent discovery feature - recruiters search for students, but only see those who have consented to their company's visibility. Silver and below cannot search. Per coding start doc: "location is straightforward + type of degree. Skills could tie to CV tagging but adds complexity."

**Scope**
- Search UI in `PartnerFullView.tsx`: filters for location, degree type, skills
- Wire `lib/services/recruiter-search.ts` to real implementation
- `searchConsentedStudents(filters, recruiterId)` enforces:
  1. Student has consented to the recruiter's company
  2. Recruiter's company is Gold or Platinum tier
  3. Filters applied (location, degree, skills)
- Results show: student name, degree, skills, location (no contact info until L5)
- All searches logged via audit function

**Acceptance criteria**
- [ ] Gold/Platinum recruiters can search students
- [ ] Silver/Bronze recruiters blocked (TierGate + middleware)
- [ ] Only consented students appear in results
- [ ] Per-company consent respected (blacklisted companies see no results)
- [ ] Search filters work: location, degree type, skills
- [ ] Search actions logged to audit trail

**Depends on:** #11 (student data access layer), #25 (per-company consent)

---

### Issue #35

**Title:** [L4/feature] Admin recommendation gateway (A1) - create, revoke, per-firm isolation
**Labels:** `feature`, `L4`
**Milestone:** L4 - Search, Recommendations, Dashboard

--- BODY ---

**As an** admin, **I want to** recommend specific consented students to specific companies, **so that** recruiters see a curated shortlist of relevant candidates without cross-firm visibility.

**What this means**
Highest-complexity V1 feature. Three-layer dependency: consent check -> Gold/Platinum tier gate -> per-recruiter data isolation. Admin filters consented students by enums, tags them as recommended to firm(s). Each firm sees only their own "Recommended Students" tab - no cross-firm visibility. Revocable by removing the tag.

**Scope**
- Admin recommendation panel: filter consented students by location, degree, experience
- Select students -> pick target firm(s) -> submit (creates `AdminRecommendation` rows)
- Recruiter "Recommended Students" tab in `PartnerFullView.tsx`
- `getRecommendationsForFirm(firmId)`: `WHERE firm_id = ? AND revoked_at IS NULL`, JOINed through consent table to verify consent hasn't been withdrawn since tagging
- Revoke: admin sets `revoked_at = now()`, row retained for audit
- Per-firm isolation: recruiter query scoped to their firm only

**Acceptance criteria**
- [ ] Admin can filter and select consented students
- [ ] Admin can recommend students to specific firms
- [ ] Each firm sees only students recommended to them
- [ ] No cross-firm visibility (firm A cannot see firm B's recommendations)
- [ ] Admin can revoke a recommendation
- [ ] Revoked recommendations disappear from recruiter view
- [ ] Consent withdrawal after recommendation hides student from recruiter
- [ ] All recommendation actions logged to audit trail

**Depends on:** #11 (student data access layer), #25 (per-company consent), #27 (approved firms exist)

---

### Issue #36

**Title:** [L4/feature] Admin dashboard - Talent Platform metrics
**Labels:** `feature`, `L4`
**Milestone:** L4 - Search, Recommendations, Dashboard

--- BODY ---

**As an** admin, **I want to** see key metrics about the Talent Platform at a glance, **so that** I can monitor platform health and student-recruiter engagement.

**What this means**
Per coding start doc: "North star metric: What users passed initial verification, and can use platform without friction?" Admin dashboard shows consented vs total students, approved recruiter count, matchable pairs, visualized as pie/donut charts.

**Scope**
- New tab in existing membership dashboard admin view (reuses `SecondaryNav.tsx` tab infrastructure)
- Metrics:
  - Total registered students: `COUNT(User) WHERE role = STUDENT`
  - Consented students: `COUNT(DISTINCT student_id) FROM StudentCompanyConsent WHERE consented = true`
  - Approved recruiters/firms: `COUNT(Organisation) WHERE has active MEMBER users`
  - Matchable pairs: consented students x approved firms (or precise count of `(student, firm)` consent pairs)
- Pie/donut chart visualization (MUI charts or lightweight chart library)

**Acceptance criteria**
- [ ] Talent Platform tab visible in admin dashboard
- [ ] All 4 metrics displayed with current values
- [ ] At least one metric visualized as pie/donut chart
- [ ] Data refreshes on page load (server-side fetch)

**Depends on:** #24 (consent data), #27 (approved companies)

---

## L5 - Notifications & Stretch (4 issues)

---

### Issue #37

**Title:** [L5/feature] Recruiter contacts student - mailto with audit log
**Labels:** `feature`, `L5`
**Milestone:** L5 - Notifications & Stretch

--- BODY ---

**As a** recruiter, **I want to** contact a student I've found through search or recommendations, **so that** I can begin a conversation about opportunities.

**What this means**
Per coding start doc: "We will handle this simply, potentially with status message confirming comms is handled outside of platform." Implementation: `mailto:` link, not in-platform messaging. Hybrid approach: mailto link + log the click as an `AuditLog` entry for audit trail.

**Scope**
- "Contact" button on student profile card in recruiter view
- Opens `mailto:student@ucl.ac.uk` with pre-filled subject line
- Log the contact action to `AuditLog` table
- Status message confirming "communication handled outside platform"

**Acceptance criteria**
- [ ] Contact button visible on student cards (for Gold/Platinum recruiters)
- [ ] Mailto link opens with pre-filled subject
- [ ] Contact action logged to audit trail
- [ ] Confirmation message displayed to recruiter

**Depends on:** #34 (recruiter search functional)

---

### Issue #38

**Title:** [L5/feature] Student notification on contact request
**Labels:** `feature`, `L5`
**Milestone:** L5 - Notifications & Stretch

--- BODY ---

**As a** student, **I want to** be notified when a recruiter contacts me, **so that** I can respond promptly to opportunities.

**What this means**
Per coding start doc: "Default to email trigger. Potentially in app - build notification drop-down tab / bell icon exclusively for this type of notification." For V1: choose between email trigger or simple in-app notification.

**Scope**
- Option A (recommended for V1): Email notification via backend (requires email service setup)
- Option B: In-app notification bell with count badge
- Notification content: "Company X has contacted you regarding [subject]"
- Student can see notification history

**Acceptance criteria**
- [ ] Student receives notification when a recruiter clicks "Contact"
- [ ] Notification includes company name and context
- [ ] Notification history viewable by student

**Depends on:** #37 (recruiter contact)

---

### Issue #39

**Title:** [L5/feature] Stretch dashboard filters
**Labels:** `feature`, `L5`
**Milestone:** L5 - Notifications & Stretch

--- BODY ---

**As an** admin, **I want to** filter dashboard metrics by date range, tier, and other dimensions, **so that** I can analyze platform trends over time.

**What this means**
Extends the admin dashboard (#36) with filtering capabilities. This is explicitly marked as stretch in the coding start doc.

**Scope**
- Date range picker for metrics
- Filter by membership tier
- Filter by degree type, location
- Metrics update dynamically based on filters

**Acceptance criteria**
- [ ] At least one filter dimension functional (date range)
- [ ] Filtered metrics display correctly
- [ ] Filters combinable

**Depends on:** #36 (admin dashboard)

---

### Issue #40

**Title:** [L5/research] Option B - Admin surfaces firms to students
**Labels:** `research`, `L5`
**Milestone:** L5 - Notifications & Stretch

--- BODY ---

**What and why**
Per coding start doc: "looking to cut this - adds unnecessary complexity with not much value considering 1-to-many recruiter:student ratio." Deferred for V1 but tracked so it doesn't get forgotten.

**Scope**
If built: admin sets an `admin_recommended` boolean or ordering weight on companies. Job board query amended with `ORDER BY admin_recommended DESC`. Students see admin-recommended companies first.

This is a bolt-on after the recommendation gateway (A1) ships. Significantly simpler than A1.

**Acceptance criteria**
- [ ] Decision made: build or defer permanently
- [ ] If built: admin can flag companies as recommended
- [ ] If built: student job board shows flagged companies first

**Depends on:** #35 (recommendation gateway A1)

---

## Summary

| Layer | Issues | Count |
|-------|--------|-------|
| L1 - Foundation Lock | #2-#21 | 20 |
| L2 - Consent, Profiles, Job Board | #22-#28 | 7 |
| L3 - CV Library & Account Management | #29-#33 | 5 |
| L4 - Search, Recommendations, Dashboard | #34-#36 | 3 |
| L5 - Notifications & Stretch | #37-#40 | 4 |
| **Total** | | **39** |

**By type:**

| Type | Count |
|------|-------|
| `arch` | 11 |
| `feature` | 20 |
| `infra` | 3 |
| `bug` | 1 |
| `decision` | 2 |
| `research` | 2 |