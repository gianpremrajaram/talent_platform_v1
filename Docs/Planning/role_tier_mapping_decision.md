# Issue #2 — Role/Tier Mapping Decision

**Date:** 12 March 2026
**Author:** Gian
**Status:** DECIDED — all 10 questions resolved
**Unblocks:** #3, #5, #6, #7, #13 (remaining models), #16, #17, #18

---

## Bottom Line

The talent platform uses **three Role keys** (STUDENT, RECRUITER, ADMIN) and the **existing MembershipTier system** (BRONZE/SILVER/GOLD/PLATINUM) for recruiter access differentiation. Students access via role-only with no Membership row. Recruiters get a Membership on registration gated by a CompanyStatus lifecycle on their Organisation. ADMIN is reused as-is with no new scoped role. All four missing schema models ship in one migration.

---

## The Mapping Table

This is the canonical reference. All downstream code (TierGate, middleware, service layer, type contracts) derives from this table.

| User type | Role key | Has Membership? | MembershipTier | Tier rank in JWT | Access path |
|-----------|----------|-----------------|----------------|------------------|-------------|
| Student | `STUDENT` | No | N/A | `null` | Role-first bypass in `userCanAccessApp`, TierGate, and middleware. Same pattern as ADMIN bypass. |
| Recruiter (pending) | `RECRUITER` | Yes (created at registration) | `BRONZE` (rank 1, technical default) | `1` | Blocked by CompanyStatus = PENDING on Organisation. Tier rank is present in JWT but irrelevant until approved. |
| Recruiter (Silver) | `RECRUITER` | Yes | `SILVER` (rank 2) | `2` | Tier-gated. Browse jobs, view consented student summaries. |
| Recruiter (Gold) | `RECRUITER` | Yes | `GOLD` (rank 3) | `3` | Tier-gated. Everything Silver + search consented students, view full profiles. |
| Recruiter (Platinum) | `RECRUITER` | Yes | `PLATINUM` (rank 4) | `4` | Tier-gated. Everything Gold + view recommended students, priority features. |
| Admin | `ADMIN` | N/A (bypasses all) | N/A | N/A | Role-first bypass. Full access to all talent platform admin functions. |

---

## Decision Log

Each decision is numbered Q1-Q10 matching the evaluation discussion. Rationale and downstream impact recorded for future reference.

### Q1 — Student access: role-only, no Membership

**Decision:** Students have NO Membership row. Access is purely via `roleKeys.includes('STUDENT')`.

**Downstream impact:** Every access check that currently does `rank >= minRank` now also needs a role-first bypass for STUDENT, following the same pattern ADMIN already uses in `userCanAccessApp`. Files affected: (1) `src/lib/access-control.ts` - add STUDENT to role-first bypass list, (2) `src/components/TierGate.tsx` (#5) - accept a `requiredRole` prop alongside `requiredTier`, (3) `src/middleware.ts` (#6) - dual-path logic checking role before tier, (4) `src/app/post-sign-in/page.tsx` - STUDENT redirect path (partially exists), (5) `src/lib/auth.ts` - JWT callback must handle null `membershipTierKey`/`membershipTierRank` gracefully.

**Why not Option A (Membership with rank 0):** Creating a conceptually meaningless Membership forces a dummy Organisation for students and pollutes the Membership table with rows that have no business meaning. The branching cost in ~5 files is a one-time tax; a fake data model is a permanent liability.

### Q2 — Recruiter roles: single RECRUITER + existing tier system

**Decision:** One `RECRUITER` Role key. Tier differentiation comes entirely from MembershipTier on the recruiter's Membership row.

**Downstream impact:** TierGate checks tier rank for feature gating within the recruiter experience. Role check answers "is this person a recruiter at all"; tier rank answers "what can they access". Recruiter search (#34) gates on `tierRank >= 3` (GOLD). Recommendation viewing gates on `tierRank >= 3`. The existing AppAccessRule system works unchanged - add a rule for TALENT_DISCOVERY with `minMembershipTier = SILVER`.

**Why not three roles:** Three separate RECRUITER_X roles would break the scaffold's rank-integer comparison model, make AppAccessRule unusable for tier gating, and force every tier check into string matching. No benefit, significant cost.

### Q3 — BRONZE tier: ignored for talent platform

**Decision:** BRONZE (rank 1) stays in the DB for the membership dashboard app. No AppAccessRule for TALENT_DISCOVERY references BRONZE. A recruiter with BRONZE is denied by default-deny in `userCanAccessApp`.

**Downstream impact:** BRONZE serves as the technical default tier assigned to recruiters at registration (see Q6). The CompanyStatus check blocks access before the tier check is ever reached, so BRONZE being "insufficient" is a defence-in-depth layer, not the primary gate. No schema changes needed.

**Interaction with Q6:** Pending recruiters get BRONZE Membership immediately. Even if CompanyStatus gating were bypassed, the tier check would also block (no ALLOW rule for BRONZE on TALENT_DISCOVERY). Two independent gates, both deny.

### Q4 — Consent: keep existing model, add new StudentCompanyConsent

**Decision:** The existing `Consent` model (generic, type-string-based, used for privacy/T&C) stays untouched. A new `StudentCompanyConsent` model is added as a junction table for per-company visibility consent.

**Downstream impact:** Sadhana's #24 (binary consent toggle) and #25 (per-company consent) work exclusively with the new model. Chengyu/Lienqi's existing seed data using the `Consent` model is unaffected. The two models serve completely different purposes: legal consent vs visibility consent. Recruiter search (#34) and recommendation gateway (#35) JOIN through `StudentCompanyConsent`, never through `Consent`.

**New model shape (added in #13 migration):**

```
StudentCompanyConsent
  id          String   @id @default(cuid())
  studentId   String
  companyId   Int      (FK to Organisation)
  consented   Boolean  @default(false)
  updatedAt   DateTime @updatedAt
  @@unique([studentId, companyId])
```

### Q5 — Schema completion: all 4 models in one migration

**Decision:** Add `StudentCompanyConsent`, `JobPosting`, `AdminRecommendation`, and `AppSuspension` in a single migration. One team-wide pull+migrate cycle.

**Downstream impact:** Every stream owner can start coding against real tables immediately after this lands. Follows the dependency map's instruction that #13 should be done "once, in one go". Risk of designing tables for features not yet started is accepted - minor column adjustments later are cheaper than multiple migration announcements and the schema drift risk they create.

**Migration protocol:** Post in team channel before pushing: "Schema change incoming - pull and run `npx prisma migrate dev` before continuing."

### Q6 — Pending recruiter: Membership immediately, gate via CompanyStatus

**Decision:** Recruiters get a User + RECRUITER role + Organisation (PENDING status) + Membership (BRONZE tier) at registration. Access is blocked by CompanyStatus on Organisation, not by tier.

**Downstream impact:** This tightens the dependency chain - #12 (company lifecycle state machine) must be built before #18 (recruiter registration) works end-to-end. The JWT always carries `membershipTierRank` (no null handling needed in session consumers), which is cleaner than the alternative. The trade-off is accepted because #12 is already in Gian's build order before #18.

**Registration flow:**
1. Recruiter submits registration form - create User with RECRUITER role
2. Create Organisation with `type: INDUSTRY` and `status: PENDING`
3. Create Membership linking user to org with BRONZE tier
4. Recruiter logs in - JWT has `roleKeys: ['RECRUITER']`, `membershipTierRank: 1`
5. `userCanAccessApp('TALENT_DISCOVERY')` - checks CompanyStatus - PENDING - returns false
6. Post-sign-in redirects to an "awaiting approval" holding page

**Approval flow (#27):**
1. Admin views pending companies - lists Organisations with status = PENDING
2. Admin selects tier (Silver/Gold/Platinum), clicks approve
3. Organisation status set to APPROVED, Membership tier updated to selected tier
4. Recruiter's next login - JWT reflects new tier rank - access granted

**Schema change required:** Add a `status` field to Organisation (enum: `CompanyStatus` with values PENDING, APPROVED, SUSPENDED, BANNED), default APPROVED so existing seeded orgs are unaffected.

### Q7 — Multi-org: one recruiter, one org

**Decision:** Enforced at registration. One recruiter belongs to one Organisation.

**Downstream impact:** The JWT's "highest tier rank" model works as-is since there's only one Membership. Recruiter search (#34) filters by single `firmId`. Recommendation gateway (#35) per-firm isolation is straightforward - `WHERE firm_id = recruiter.organisationId`. No session-level org selector needed. If a recruiter changes companies post-V1, that's an account migration concern for a future iteration.

**Enforcement point:** Registration form or `create-user` API route checks if a User with role RECRUITER already exists for the given email domain. If so, link to existing Organisation rather than creating a new one.

### Q8 — Seed data: verify and fix

**Decision:** Verify that Role rows for STUDENT and RECRUITER exist in `prisma/seed.ts`. If missing, add them in the same commit as this decision document.

**Downstream impact:** Prevents a subtle runtime bug where `roleKeys.includes('STUDENT')` returns false because the Role row doesn't exist in the database. The error manifests as "access denied" not "role missing", making it extremely time-consuming to debug. 5 minutes of verification now saves hours of debugging across the whole team.

**Required Role rows (verify all exist):**

| key | label |
|-----|-------|
| `ADMIN` | Administrator |
| `STUDENT` | Student |
| `RECRUITER` | Recruiter |
| `MEMBER` | Member |
| `MODULE_LEADER` | Module Leader |

### Q9 — Admin scope: reuse existing ADMIN role

**Decision:** The existing ADMIN role covers all talent platform admin functions (approve companies, suspend users, make recommendations, view metrics).

**Downstream impact:** Zero new roles needed. All admin API routes (#27, #33, #35, #36) check `roleKeys.includes('ADMIN')` using the existing pattern. Cross-app power bleed (a membership dashboard admin also gets talent platform admin powers) is accepted for V1 scope since there's one admin team. Revisit post-handover if Daniel needs scoped admin roles.

### Q10 — StudentProfile: keep direct-to-User FK pattern

**Decision:** All existing student models (StudentWorkExperience, StudentProjects, StudentSkill, StudentUniversity, StudentAcheivementTag, StudentPersonalInformation, StudentSocialLink) keep their direct `userId` FK to User. StudentProfile stays as a thin bio-only model.

**Downstream impact:** No migration risk to Sadhana's already-merged code. The student data access layer (#11) queries 6+ tables independently, which is slightly more complex but avoids a mid-sprint FK migration touching every student model. "Does this user have a student profile" is checked by querying the StudentProfile table (existence of a row = profile started). Profile completeness can be computed in the service layer by checking which related tables have data.

---

## Schema Changes Required by These Decisions

All of the following ship in one migration (completing #13):

**Modify existing model:**
- `Organisation` - add `status` field: enum `CompanyStatus` (PENDING, APPROVED, SUSPENDED, BANNED), default APPROVED (so existing seeded orgs are unaffected)

**New enum:**
- `CompanyStatus` - `PENDING | APPROVED | SUSPENDED | BANNED`

**New models:**

1. **`StudentCompanyConsent`** - junction table for per-company visibility. Fields: `id`, `studentId` (FK User), `companyId` (FK Organisation), `consented` (Boolean, default false), `updatedAt`. Unique constraint on `[studentId, companyId]`.

2. **`JobPosting`** - recruiter job posts. Fields: `id`, `organisationId` (FK Organisation), `createdByUserId` (FK User), `title`, `description`, `location`, `salaryBand` (optional), `roleType`, `postedAt` (DateTime, default now), `expiresAt` (optional DateTime), `isActive` (Boolean, default true).

3. **`AdminRecommendation`** - admin tags students to firms. Fields: `id`, `studentId` (FK User), `firmId` (FK Organisation), `adminId` (FK User), `createdAt` (DateTime, default now), `revokedAt` (nullable DateTime). Index on `[firmId, revokedAt]`.

4. **`AppSuspension`** - per-app suspension scoped to talent platform. Fields: `id`, `userId` (FK User), `appKey` (String), `reason` (String), `suspendedAt` (DateTime, default now), `liftedAt` (nullable DateTime). Index on `[userId, appKey]`.

**Seed data additions (verify/add):**
- Role rows: STUDENT, RECRUITER (if missing)
- At least one Organisation with `status: APPROVED` for recruiter testing
- At least one Organisation with `status: PENDING` for approval flow testing

---

## Files Affected by These Decisions

This section maps decisions to the specific files each downstream ticket owner needs to modify.

| File | Affected by | What changes |
|------|------------|--------------|
| `prisma/schema.prisma` | Q4, Q5, Q6 | Add 4 new models, CompanyStatus enum, status field on Organisation |
| `prisma/seed.ts` | Q8 | Verify/add STUDENT and RECRUITER Role rows, add pending org |
| `src/lib/access-control.ts` | Q1, Q6 | Add STUDENT to role-first bypass; add CompanyStatus check for RECRUITER |
| `src/lib/auth.ts` | Q1 | JWT callback handles null tier for STUDENT users |
| `src/components/TierGate.tsx` | Q1, Q2 | Accept `requiredRole` prop; STUDENT bypass; tier rank comparison for recruiters |
| `src/middleware.ts` | Q1 | Dual-path: role check for STUDENT, then tier check for RECRUITER |
| `src/app/post-sign-in/page.tsx` | Q1, Q6 | STUDENT redirect; pending recruiter redirect to holding page |
| `src/types/index.ts` | Q1, Q2, Q4 | UserRole union, UserTier type, ConsentStatus, CompanyStatus |
| `src/lib/services/consent.ts` | Q4 | Operates on StudentCompanyConsent, not Consent |
| `src/app/talent-discovery/page.tsx` | Q1, Q2 | Remove hardcoded SILVER_RANK/GOLD_RANK, use TierGate |

---

## How to Reference This Document

All downstream tickets should reference this document as: `Docs/role_tier_mapping_decision.md` (Issue #2).

When writing code that checks roles or tiers, consult the mapping table at the top. Do not invent new role/tier interpretations - if the mapping table doesn't cover your case, raise it with the team before proceeding.

---

*Closes GitHub Issue #2. Cross-references: implementation_playbook.md (AD-1, AD-8, AD-9, AD-10), scaffold_architecture_eval.md (Sections 3-4), dependency_map.md (Phase 1-2).*
