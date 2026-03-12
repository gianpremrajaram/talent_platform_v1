# Talent Platform V1 — Implementation Playbook

**Purpose:** Coordination plan for building out the Talent Platform V1 features on top of the existing scaffold. This doc does NOT repeat what's already in the [architecture eval](scaffold_architecture_eval.md) — it covers the **how** and **when** for each architectural gap that still needs a design decision or coordination protocol.

**Companion docs:**
- `Docs/scaffold_architecture_eval.md` — what exists, what's missing, risk cross-reference
- `Docs/coding_start_planning.pdf` — source of truth for requirement IDs and build layers
- `CLAUDE.md` — quick-reference architecture and commands

**Last updated:** 4 March 2026

---

## Dependency Map

```
Stream 0: Foundation Lock
    │
    ├──► Stream 1: Student Registration & Profile
    │       │
    │       └──► Stream 2: Consent & Privacy ──────────┐
    │                                                   │
    ├──► Stream 3: Recruiter Registration & Job Board   │
    │       │                                           │
    │       └───────────────────────────────────────────┤
    │                                                   │
    │                                           Stream 4: CV Library &
    │                                           Recruiter Search
    │                                                   │
    │       ┌───────────────────────────────────────────┘
    │       │
    │       ▼
    │   Stream 5: Admin Panel &
    │   Recommendation Gateway
    │       │
    │       ▼
    │   Stream 6: Notifications & Contact
    │
    ▼
   ALL STREAMS require Stream 0 to be complete before starting.
```

**Critical handoff points:**

| From | To | Artefact that must be delivered | Blocks |
|------|----|-------------------------------|--------|
| Stream 0 | ALL | `types/index.ts` locked, service stubs in `lib/services/`, `TierGate` component, `.env.example`, schema migration with student/consent/job fields | Everything |
| Stream 1 | Stream 2 | Student `User` records exist in DB with profile fields populated | Consent toggle has nothing to attach to without students |
| Stream 1 | Stream 4 | Student profile fields queryable in DB | CV upload + recruiter search need profile data to return |
| Stream 2 | Stream 4 | `getConsentStatus()` returns real data, consent junction table populated | Recruiter search must filter by consent |
| Stream 2 | Stream 5 | Consent service wired | Admin recommendation gateway gates on consent |
| Stream 3 | Stream 5 | Approved recruiters exist in DB with firm associations | Admin can't recommend students to firms that don't exist |
| Stream 4 | Stream 6 | Recruiter search functional | Contact/notification only makes sense after search works |

---

## Git & Migration Coordination

Already covered in `CLAUDE.md`. One additional protocol for this project:

**Schema change announcement rule:** Before any dev pushes a commit that touches `prisma/schema.prisma`, they must post in the team channel: "Schema change incoming — pull and run `npx prisma migrate dev` before continuing." This replaces CI/CD for detecting drift. If two devs need schema changes simultaneously, they coordinate to batch into a single migration.

---

## AD-1: Shared Type Contracts

**What this solves:** Without a single `types/index.ts`, parallel builders invent their own data shapes. The coding start doc calls this "the stable data contract" and it's the first thing to lock.

**Covered in eval?** Flagged as a gap (Section 10) but no design for what types are needed.

### What to define

The file `src/types/index.ts` needs types for every entity that crosses a component boundary:

- **User-facing types:** `UserTier` (union of tier keys + `'student'` + `'admin'`), `ConsentStatus` (`'pending' | 'consented' | 'withdrawn'`), `UserRole` (union of role keys)
- **Student domain:** `StudentProfile` (id, name, skills, experience, certifications, projects, externalLinks, consentStatus, tier)
- **Recruiter domain:** `RecruiterProfile` (id, name, firmId, firmName, tier, approvalStatus)
- **Job board:** `JobPosting` (id, firmId, title, location, salaryBand, roleType, description, postedAt, expiresAt)
- **Recommendations:** `AdminRecommendation` (id, studentId, firmId, adminId, createdAt, revokedAt)
- **CV:** `StudentCV` (id, studentId, label, fileUrl, uploadedAt)
- **Consent:** `CompanyConsent` (studentId, companyId, consented, updatedAt)

### Coordination rule

Once `types/index.ts` is merged to `dev`, changing a type requires a PR reviewed by at least one other stream owner. This prevents one builder silently changing a shape that another builder depends on.

---

## AD-2: Service Layer Stubs

**What this solves:** Pages call typed functions from day one. When real logic lands later, pages get real data with zero refactoring. The coding start doc's "Step 2" prescribes this but the eval only flags it as missing.

**Covered in eval?** Flagged as a gap (Section 10) but no function signatures defined.

### Services to create under `src/lib/services/`

Each file exports async functions returning the types from `types/index.ts`. Initial stubs return hardcoded dummy data.

1. **`consent.ts`** — `getConsentStatus(studentId)`, `setConsent(studentId, status)`, `getCompanyConsents(studentId)`, `setCompanyConsent(studentId, companyId, consented)`
2. **`student-profile.ts`** — `getStudentProfile(userId)`, `updateStudentProfile(userId, data)`, `searchStudents(filters)` (consent-gated variant used by recruiter search)
3. **`job-board.ts`** — `getJobPostings(filters)`, `getJobPosting(id)`, `createJobPosting(data)`, `updateJobPosting(id, data)`, `deleteJobPosting(id)`
4. **`recommendations.ts`** — `getRecommendationsForFirm(firmId)`, `createRecommendation(studentId, firmId, adminId)`, `revokeRecommendation(id)`
5. **`recruiter-search.ts`** — `searchConsentedStudents(filters, recruiterId)` (wraps `student-profile.searchStudents` with consent + tier gate)
6. **`cv.ts`** — `uploadCV(studentId, file)`, `getCVs(studentId)`, `deleteCV(cvId)`, `replaceCV(cvId, file)`

### Coordination rule

Stubs are owned by the Foundation Lock (Stream 0) author. When a stream owner needs to change a function signature, they update the stub AND the type contract in `types/index.ts` in the same commit.

---

## AD-3: Consent Data Model

**What this solves:** Every recruiter-facing query must filter by student consent. The data model choice affects every downstream feature (search, recommendations, dashboard metrics).

**Covered in eval?** Flagged as a Prisma gap but no schema design.

### Decision: Simple boolean vs per-company junction table

**Recommended: Per-company junction table from day one.**

Rationale: The coding start doc (FR-S-12) explicitly calls for per-company whitelist/blacklist. Starting with a simple boolean and migrating later means a schema change mid-project — exactly the drift risk the doc warns about.

| Option | Schema | Pros | Cons |
|--------|--------|------|------|
| **A: Junction table (recommended)** | New `StudentCompanyConsent` table: `student_id`, `company_id`, `consented` (bool), `updated_at`. Default: no row = not consented. | Handles FR-S-13 AND FR-S-12 in one migration. Per-company granularity from the start. | Slightly more complex initial queries. |
| B: Boolean on User | `consent_status` enum on `User` table. | Simplest possible L2 delivery. | Must migrate to junction table for FR-S-12, causing schema drift mid-sprint. |
| C: Global consent + separate blacklist | Boolean `consented` on User + separate `StudentBlacklist` table for per-company overrides. | Two-phase delivery possible. | Two tables for one concept. Confusing query logic (check global, then check overrides). |

### Steps

1. Add `StudentCompanyConsent` model to `prisma/schema.prisma` in the Foundation Lock migration
2. Stub `lib/services/consent.ts` to return `'consented'` for all queries initially
3. Stream 2 wires real queries: `SELECT * FROM StudentCompanyConsent WHERE student_id = ? AND company_id = ? AND consented = true`
4. All recruiter-facing queries in `recruiter-search.ts` and `recommendations.ts` JOIN through this table — never bypass

---

## AD-4: Student Profile Schema

**What this solves:** FR-S-6 (profile fields), FR-S-11 (external links), FR-R-3 (recruiter search filters). The eval flags these as missing columns but doesn't define what they are.

**Covered in eval?** Listed as a Prisma gap but no field-level design.

### Decision: Extend User model vs separate StudentProfile table

**Recommended: Separate `StudentProfile` table.**

Rationale: The existing `User` model is shared across all user types (partners, admins, students). Adding student-specific fields (skills, experience, certifications) to `User` pollutes the model for non-student users. A separate table follows the same pattern as `MembershipDashboardMember` — a per-app projection linked to `User`.

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| **A: Separate `StudentProfile` table (recommended)** | New model: `student_id` (FK to User), `skills` (string[]), `experience_years` (int), `degree_type` (enum), `location` (string), `certifications` (string[]), `projects` (JSON), `linkedin_url`, `github_url` | Clean separation. Follows existing `MembershipDashboardMember` pattern. Easy to query without loading partner data. | One extra JOIN for student pages. |
| B: Add columns to User | Add nullable fields directly to `User` model. | No JOINs needed. | Pollutes User model. Every user row carries empty student fields. Harder to reason about which fields apply to which role. |

### Steps

1. Add `StudentProfile` model to schema in Foundation Lock migration
2. Add `STUDENT` role to seed data (currently missing — only partner roles seeded)
3. Add seed student users for local dev testing
4. Wire `lib/services/student-profile.ts` to read/write this table

### Coordination with Stream 4 (CV Library)

Student profile must include a `degree_type` enum and `location` field — these are the primary filters for recruiter search (FR-R-3) and admin recommendation filtering (FR-A-7a). Agree on enum values before parallel work starts:

- `degree_type`: `'BSc' | 'MSc' | 'MEng' | 'PhD' | 'other'`
- `location`: free text string (London-based filtering can be substring match for V1)

---

## AD-5: Job Posting Schema & Storage

**What this solves:** FR-R-14 (recruiter posts job). The eval flags this as missing. The coding start doc raises storage concerns for attachments.

**Covered in eval?** Listed as a gap. Storage concern flagged but no decision.

### Schema

New `JobPosting` model:
- `id` (cuid)
- `firm_id` (FK to Organisation)
- `posted_by_id` (FK to User — the recruiter)
- `title` (string)
- `location` (string)
- `salary_band` (string — free text for V1, e.g. "30-40k")
- `role_type` (enum: `'internship' | 'graduate' | 'placement' | 'part_time' | 'full_time'`)
- `description` (text)
- `is_active` (bool, default true)
- `posted_at` (DateTime, default now)
- `expires_at` (DateTime, nullable)

### Decision: Attachments

For V1, **text-only job postings — no file attachments.** The coding start doc flags blob storage as needing research and suggests deferring. Job descriptions are text fields.

If attachments are needed later, the same storage decision from AD-6 (CV storage) applies.

---

## AD-6: CV Storage Architecture

**What this solves:** FR-S-4 (upload), FR-S-5 (update/delete/replace), FR-S-8 (multiple CVs). This is explicitly flagged in the coding start doc as needing research.

**Covered in eval?** Flagged as a risk. No decision made.

### Options (genuinely close — present to Daniel for final call)

| Option | How it works | Pros | Cons |
|--------|-------------|------|------|
| **A: External URL field (GDrive/personal hosting)** | Student provides a URL to their CV. Stored as a string in DB. No file upload. | Zero infrastructure. Fastest V1 delivery. No storage costs. | No file validation. Links can break. No search/tagging on content. Privacy concern — student controls hosting. |
| **B: S3-compatible object storage** | Upload to S3 (or Supabase Storage, Cloudflare R2). Store object key in DB. Serve via signed URLs. | Industry standard. Scalable. File validation possible. Supports large files. | Requires AWS/cloud account setup. Adds infra dependency. Needs `next.config.ts` changes for image/file domains. New env vars (`S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`). |
| **C: PostgreSQL `bytea` column** | Store file bytes directly in a `cv_data bytea` column. | No external dependencies. Everything in one DB. | Bloats DB. Slow for large files. Not recommended for production by Prisma docs. Backup size grows. |

**Recommendation if pressed:** Option A for V1 (URL field), migrate to Option B before production. This unblocks CV features immediately without infrastructure decisions. The `StudentCV` table stores `file_url` (string) regardless of backend — swapping from URL to signed S3 URL later changes only the service layer, not the schema or UI.

### Steps regardless of option chosen

1. Add `StudentCV` model: `id`, `student_id` (FK), `label` (string, e.g. "ML-focused"), `file_url` (string), `uploaded_at` (DateTime)
2. Stub `lib/services/cv.ts`
3. Stream 4 builds upload UI in `StudentView.tsx`
4. If Option B chosen: add S3 client config, presigned URL generation in service layer, update `.env.example`

---

## AD-7: Registration Flow Architecture

**What this solves:** FR-S-1 (student registration), FR-R-1 (recruiter registration), FR-A-1 (admin approves companies). Currently, registration is admin-only. Self-registration for students and recruiters doesn't exist.

**Covered in eval?** Flagged as a risk (SignInForm is admin-gated). No flow design.

### Two registration paths needed

**Path 1: Student self-registration**
1. Student visits `/register` (new page)
2. Enters UCL email, name, password
3. **Domain check:** Email must end in `@ucl.ac.uk` (or match dummy list for dev). Per coding start doc: "handle via dummy list of domains, introduce real UCL verification at later stage."
4. Account created with `STUDENT` role, `consent_status` = pending
5. Redirected to `/talent-discovery?view=student`

**Path 2: Recruiter registration with admin approval**
1. Recruiter visits `/register` (same page, selects "I'm a recruiter")
2. Enters company email, name, company name, password
3. Account created with NO role initially (or a `PENDING_RECRUITER` role)
4. Admin sees pending registrations in admin panel (FR-A-1)
5. Admin approves → assigns `MEMBER` role + membership tier + organisation. Or rejects.
6. On next login, approved recruiter gets routed to their default app

### Decision: Separate register page vs extend SignInForm

**Recommended: New `/register` page and API route.**

The existing `SignInForm` has admin-check logic baked in. Modifying it to support self-registration adds complexity to an already working flow. A clean `/register` page with its own `/api/account/register` route is safer.

### Coordination

- Stream 1 builds student registration path
- Stream 3 builds recruiter registration path
- Both share the `/register` page but with a role selector (student vs recruiter)
- Both use the same API route with a `role` param that determines the flow
- The admin approval queue (FR-A-1) is Stream 3's responsibility but the API for changing a user's role already exists in `update-user/route.ts`

---

## AD-8: TierGate Component Design

**What this solves:** RBAC-1. Component-level tier gating so parallel builders can't accidentally expose restricted content.

**Covered in eval?** Flagged as a gap. No design.

### Decision: Client component vs server component

**Recommended: Client component reading from session.**

Rationale: The session already contains `membershipTierRank` and `roleKeys` via the JWT. A client component can read this via `useSession()` without additional DB calls. Server-side route gating is handled separately by `middleware.ts`.

### Behaviour

- `<TierGate tier="gold">` renders children only if `userTierRank >= GOLD_RANK` (3)
- `<TierGate role="ADMIN">` renders children only if `roleKeys.includes("ADMIN")`
- Both props can be combined: `<TierGate tier="gold" role="MEMBER">` requires BOTH
- When gated out: renders `null` (hidden) — not an error page. Error pages are handled at the route level by `middleware.ts`.
- During dev stub phase: always renders children (bypass mode), controlled by an env var or a constant

### Refactoring needed

The existing `talent-discovery/page.tsx` has inline tier checks (lines 69-70: `SILVER_RANK = 2`, `GOLD_RANK = 3`). After `TierGate` is built, these should be refactored to use it. This refactoring is part of Stream 0.

---

## AD-9: Middleware Route Protection

**What this solves:** RBAC-1. Route-level blocking before page render — the first layer of defence. `TierGate` (AD-8) is the second layer at the component level.

**Covered in eval?** Flagged as a gap. No design.

### Routes to protect

| Route pattern | Required | Logic |
|--------------|----------|-------|
| `/talent-discovery*` | Authenticated | All views require sign-in |
| `/talent-discovery?view=cv-library` | Gold+ member OR admin | Tier rank >= 3 |
| `/talent-discovery?view=job-board` | Silver+ member OR admin | Tier rank >= 2 |
| `/talent-discovery?view=student` | STUDENT or ADMIN role | Role check |
| `/membership-dashboard*` | Authenticated | Existing `userCanAccessApp` handles the rest server-side |
| `/ixn-workflow-manager*` | Authenticated | Existing `userCanAccessApp` handles |
| `/account/add-user` | ADMIN role | Already checked in the page but middleware adds defence-in-depth |
| `/api/account/*` (except register) | Authenticated | API routes already check session but middleware catches earlier |

### Decision: Next.js middleware vs per-page checks

**Recommended: Middleware for auth-required routes + per-page checks for fine-grained tier/role logic.**

Rationale: Next.js middleware runs at the edge and can only read cookies (JWT). It can check "is authenticated" and "has minimum tier rank" from the JWT payload. But complex checks like "does this firm's membership tier allow CV library access" require DB queries that middleware can't do efficiently. Use middleware for the broad gate, pages for the precise gate.

### Steps

1. Create `src/middleware.ts` in Foundation Lock
2. Export a `config.matcher` for protected route patterns
3. Decode JWT, check authentication, check tier rank from token
4. Redirect to `/sign-in` or `/access-denied` as appropriate
5. Pages still call `userCanAccessApp()` for DB-backed checks (defence in depth)

---

## AD-10: Suspension & Ban Architecture

**What this solves:** FR-A-2. Admin can suspend/ban students or companies without affecting other apps.

**Covered in eval?** Listed as a gap with the "separate table" decision noted. No schema design.

### Decision: Per-app suspension table vs global flag with app scope

**Recommended: Per-app suspension table.**

Per the coding start doc: "incorporating in the current user table is a risk because if a student is marked as suspended, it will suspend students from other related applications." A separate table scopes suspension to a specific app context.

| Option | Schema | Pros | Cons |
|--------|--------|------|------|
| **A: `AppSuspension` table (recommended)** | `id`, `user_id` (FK), `app_key` (string), `reason` (text), `suspended_at` (DateTime), `lifted_at` (DateTime, nullable) | Per-app granularity. Audit trail built in. Can suspend from Talent Discovery without affecting membership dashboard. | Extra JOIN on every access check. |
| B: `is_suspended` boolean on User | Add column to User. | Simplest. | Cross-app suspension. Doc explicitly warns against this. |

### Integration point

`userCanAccessApp()` in `src/lib/access-control.ts` must be extended to check the `AppSuspension` table. If an active suspension exists (no `lifted_at`), return `false` regardless of tier.

---

## AD-11: Admin Recommendation Gateway (A1)

**What this solves:** FR-A-7a, FR-A-7b. The highest-complexity V1 feature. This is the only section that spans three layers of dependency.

**Covered in eval?** Listed in work stream advisory. The coding start doc has the most detail. No implementation-level coordination plan.

### Three-layer dependency chain

```
Layer 1: Consent check
    Student must have consented to visibility for the target firm
    ↓
Layer 2: Tier gate
    Target firm must be Gold or Platinum
    ↓
Layer 3: Per-recruiter data isolation
    Each firm sees ONLY students recommended to them, never other firms' lists
```

### Schema

New `AdminRecommendation` model:
- `id` (autoincrement)
- `student_id` (FK to User)
- `firm_id` (FK to Organisation)
- `admin_id` (FK to User — the admin who made the recommendation)
- `created_at` (DateTime, default now)
- `revoked_at` (DateTime, nullable — set when admin revokes)

Index on `(firm_id, revoked_at)` for the recruiter-facing query: "show me my recommended students."

### Data flow

1. **Admin filters:** Admin navigates to recommendation panel. Calls `searchConsentedStudents(filters)` which returns only students who have consented AND match the filter criteria (location, degree, experience).
2. **Admin tags:** Admin selects students, picks target firm(s), submits. Creates `AdminRecommendation` rows.
3. **Recruiter views:** When a Gold/Platinum recruiter loads their dashboard, calls `getRecommendationsForFirm(firmId)`. Query: `WHERE firm_id = ? AND revoked_at IS NULL`, JOINed through consent table to double-check consent hasn't been withdrawn since tagging.
4. **Admin revokes:** Admin sets `revoked_at = now()`. Row remains for audit. Recruiter's next page load no longer shows that student.

### Coordination

- Depends on Stream 2 (consent service must be wired, not stubbed)
- Depends on Stream 3 (firms must exist as approved organisations)
- The admin panel UI lives in a new tab within `/membership-dashboard` or a new `/admin/recommendations` route — decision for the team
- The recruiter "Recommended Students" tab lives in `PartnerFullView.tsx` (currently empty shell)

---

## AD-12: Admin Dashboard Metrics (Talent Platform)

**What this solves:** DASH-1. Admin dashboard showing consented vs total students, approved recruiters, matchable pairs.

**Covered in eval?** Listed in work stream advisory. No query design.

### Metrics to compute

| Metric | Query | Depends on |
|--------|-------|-----------|
| Total registered students | `COUNT(User) WHERE role = STUDENT` | Stream 1 |
| Consented students | `COUNT(DISTINCT student_id) FROM StudentCompanyConsent WHERE consented = true` | Stream 2 |
| Approved recruiters (firms) | `COUNT(Organisation) WHERE type = INDUSTRY AND has at least one user with MEMBER role` | Stream 3 |
| Matchable pairs | Consented students x approved recruiters (or more precise: count of `(student, firm)` pairs where student consented to that firm) | Stream 2 + 3 |

### Decision: Extend existing admin dashboard vs new page

**Recommended: New tab within the existing membership dashboard admin view.**

The existing `AdminDashboard` component already has tabs (members, benefits, handbook). Add a "Talent Platform" tab that shows these metrics. This keeps admin tooling in one place and reuses the existing tab infrastructure (`SecondaryNav.tsx`).

**Alternative:** Separate `/admin/talent-metrics` page. Cleaner separation but fragments the admin experience.

---

## AD-13: Notification Architecture

**What this solves:** FR-R-8 (recruiter contacts student), FR-S-17 (student notified). This is L5 / lowest priority.

**Covered in eval?** Listed in Stream 6 work stream advisory. No design.

### Decision: External-only vs in-app notifications

For V1: **External-only (mailto links).**

Per the coding start doc: "We will handle this simply, potentially with status message confirming comms is handled outside of platform."

| Option | Implementation | Pros | Cons |
|--------|---------------|------|------|
| **A: Mailto link (recommended for V1)** | Recruiter clicks "Contact" on a student profile. Opens `mailto:student@ucl.ac.uk` with a pre-filled subject line. No backend. | Zero infrastructure. Ships in hours. | No audit trail. No notification to student within platform. UCL may want to intercept. |
| B: Email trigger via backend | Recruiter clicks "Contact". Backend sends email to student via SendGrid/SES/SMTP. Logs the contact in DB. | Audit trail. Platform-controlled. Can rate-limit. | Requires email service setup. New env vars. Needs email template. |
| C: In-app notification bell | Contact request stored in DB. Student sees bell icon with count. | Fully in-platform. Best UX. | Requires notification table, real-time updates (polling or WebSocket), notification dropdown component. Over-engineered for V1. |

If the team wants audit trail without full email infra, a hybrid is possible: mailto link + log the click as an `AuditLog` entry (the `AuditLog` model already exists in the schema).

---

## Open Questions for Daniel / Client

These are decisions that cannot be made by the team alone:

1. **CV storage backend** (AD-6): URL field vs S3? Does UCL provide any file hosting infrastructure?
2. **UCL email domain list**: Is there a verified domain list the team can access, or should we hardcode `@ucl.ac.uk` for students?
3. **Recruiter domain verification**: Dummy list for dev — what's the production plan? Does UCL IT handle this?
4. **`.env.example` content**: What env vars does the UCL VM / Kubernetes deployment expect beyond `DATABASE_URL` and `NEXTAUTH_SECRET`?
5. **Admin dashboard location**: New tab in existing membership dashboard, or separate talent platform admin page?
6. **Option B (admin surfaces firms to students)**: Confirm deferred for V1, or include?
