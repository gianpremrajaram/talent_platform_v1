# GitHub Issues V2 - Amendments Document

**How to use this doc:** All changes are marked with **[AMENDMENT]** tags. Copy this file into your scaffold `Docs/` folder, point Claude Code at it, and tell it: "Use github_issues_v2_amendments.md as the source of truth for issue creation. Apply all amendments marked [AMENDMENT] to the original issue list in github_issues.md, then create all issues via gh CLI."

**Parsing note for Claude Code:** When running `gh issue create`, the `--title`, `--label`, and `--milestone` flags should be extracted from the metadata lines. Everything below those lines is the `--body` content. Do not include `**Labels:**` or `**Milestone:**` lines in the issue body itself.

---

## [AMENDMENT] New Labels to Add

Original list is good. Add one more:

| Label | Dimension | Colour |
|-------|-----------|--------|
| `decision` | Type | `#BFD4F2` (light blue) |

This covers issues that are purely about making and documenting a decision (e.g. role/tier mapping, CV storage approach) vs research which implies exploration is still needed.

---

## [AMENDMENT] Milestone Descriptions - Minor Rewording

No structural changes. But L1 description should clarify it includes architectural scaffolding, not just infra:

| Milestone | Description |
|-----------|-------------|
| **L1 - Foundation Lock** | Auth, schema, RBAC, registration, **shared type contracts, service stubs, cross-cutting architecture (error handling, validation, audit logging, UI state components)**. Sequential bottleneck - nothing else starts until this is done. |

---

## [AMENDMENT] NEW ISSUE - Insert as Issue 0 (renumber all subsequent)

### Issue 0: [L1/decision] Map scaffold roles and tiers to Talent Platform user model

**Labels:** `decision`, `L1`
**Milestone:** L1 - Foundation Lock

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

**Blocks:** Issue #1 (type contracts - needs UserTier definition), Issue #3 (TierGate), Issue #4 (middleware), Issue #5 (RBAC refactor), Issue #15 (student registration), Issue #16 (recruiter registration)

---

## [AMENDMENT] NEW ISSUE - Insert in L1 (after current Issue 14, before Issue 15)

### [L1/feature] Login page UI review and refactor (SETUP-1)

**Labels:** `feature`, `L1`
**Milestone:** L1 - Foundation Lock

**As a** user, **I want** the login page to work correctly for students, recruiters, and admins, **so that** I can access the platform based on my role.

**What this means**
The planning doc explicitly identifies SETUP-1 (login page) as the most important L1 task. The existing `SignInForm.tsx` and `sign-in/page.tsx` work for admin-only login, but the register button is gated behind an admin check. Post-login routing in `post-sign-in/page.tsx` partially handles STUDENT redirect but has no RECRUITER-specific routing. Quality of existing login UI needs verification and potential refactoring per planning doc notes.

**Scope**
- Review existing `SignInForm.tsx` for code quality and role handling
- Verify post-login redirect logic in `post-sign-in/page.tsx` for all roles (student, recruiter tiers, admin)
- Add recruiter-specific post-login routing (currently missing)
- Add "Register" link/button that routes to new `/register` page (built in Issues #15 and #16) without admin gate
- Ensure login error states are clear and accessible
- Remove or gate the existing admin-only register flow in SignInForm

**Acceptance criteria**
- [ ] Login works for student, recruiter (all tiers), and admin accounts
- [ ] Post-login redirect routes each role to the correct view
- [ ] Register link visible to unauthenticated users (no admin gate)
- [ ] Login error messages are clear
- [ ] Existing admin functionality preserved

**Depends on:** Issue #0 (role/tier mapping)
**Blocks:** All user-facing features that require authentication

---

## [AMENDMENT] Issue #1 (Type Contracts) - Add Dependency

Add to **Depends on:** line:

> **Depends on:** **Issue #0 (role/tier mapping decision - needed to define UserTier correctly)**

No other changes to Issue #1.

---

## [AMENDMENT] Issue #8 (Audit Logging) - Fix Dependency

Current text says: "Depends on: Issue #12 (Prisma schema - AuditLog model already exists)"

**Change to:** "Depends on: Issue #1 (type contracts for action enum). Note: AuditLog model already exists in scaffold Prisma schema - no schema change needed for this service."

The AuditLog table already exists; this issue creates the service wrapper, not the table. Linking it to Issue #12 (schema extension) is misleading.

---

## [AMENDMENT] Issue #11 (Loading/Empty/Error States) - Soften Blocking Language

Current text says: "Blocks: All L2+ UI work (soft dependency - not strictly blocking but should land first)"

This is contradictory. **Change to:**

> **Blocks:** Nothing strictly. Recommended to land before L2 UI work begins to ensure consistency, but L2 features can start without this if needed.

Also **change milestone** from L1 to L2. These components are useful but not part of the sequential bottleneck. Moving them to L2 reduces L1 scope (currently 20 issues which is overloaded).

---

## [AMENDMENT] Issue #12 (Prisma Schema Extension) - Add cv.ts Service to Scope

Add to **Scope** section, after the table listing:

> Also define the file storage abstraction interface in `src/lib/services/cv.ts` regardless of storage backend decision. Interface: `uploadFile(file, metadata): Promise<FileRef>`, `getFile(fileRef): Promise<Buffer>`, `deleteFile(fileRef): Promise<void>`. This abstraction means swapping storage backend later (URL field -> S3) only changes the service implementation, not any consuming code.

This addresses the architecture gaps doc's file storage abstraction concern (#3) which has no dedicated issue.

---

## [AMENDMENT] Issue #20 (CV Storage Research) - Move to L2 Milestone

**Change milestone** from "L1 - Foundation Lock" to "L2 - Consent, Profiles, Job Board".

**Change label** from `L1` to `L2`.

Rationale: this decision doesn't block any L1 work. It only blocks L3 CV upload (Issue #27). Moving it out of L1 reduces the foundation lock scope. The file storage abstraction interface (added to Issue #12 above) means devs can code against the interface without knowing the backend.

Also **change label** from `research` to `decision` (new label) since the options are already well-defined in the planning doc - this is a decision to make with Daniel, not open-ended research.

---

## [AMENDMENT] Issue #23 (Student Profile) - Merge Issue #24 Into This

Issue #24 (External profile links - LinkedIn, GitHub) is two URL fields. Too thin for its own issue. **Merge into Issue #23.**

**Add to Issue #23 Scope:**

> - LinkedIn URL and GitHub URL fields (optional, validated as URL format, displayed as external links opening in new tab)

**Add to Issue #23 Acceptance Criteria:**

> - [ ] LinkedIn and GitHub URL fields present on profile form (optional)
> - [ ] URLs validated as valid format
> - [ ] Links render as clickable external links (new tab)

**Delete Issue #24 entirely.** Renumber all subsequent issues.

---

## [AMENDMENT] Issue #24 (was #25): Admin Approve/Reject - Clarify Tier Assignment

The current scope says "Approve action: assign membership tier, create/link Organisation, assign MEMBER role" but doesn't specify WHO decides the tier or how.

**Add to "What this means" section:**

> The admin must select which membership tier to assign during approval (silver, gold, or platinum). This determines what platform features the recruiter can access. The tier selection should be a dropdown in the approval UI. Bronze tier means no platform access, so approving as bronze is equivalent to rejecting.

**Add acceptance criteria:**

> - [ ] Admin selects tier during approval (silver/gold/platinum dropdown)

---

## [AMENDMENT] Issue #26 (was #27): CV Upload - Clarify Storage Abstraction

**Add to "What this means" section:**

> Regardless of storage backend choice (Issue #20), the code should call the file storage abstraction interface defined in `src/lib/services/cv.ts` (Issue #12). If Option A (URL field), the "upload" is just saving a user-provided URL. If Option B (S3), it's a real file upload. The UI and service layer should work identically in both cases.

---

## [AMENDMENT] Issue #29 (was #30): Account Deletion - Clarify Audit Log Retention

The current acceptance criteria include: "AuditLog records retained (GDPR audit trail - do not delete)"

**Expand this criterion to:**

> - [ ] AuditLog records retained even after deletion (GDPR audit trail - do not delete). The deleted user's AuditLog entries should be anonymised (replace user ID with a hash or "deleted-user" placeholder) but not removed, per GDPR right to erasure which permits retention of anonymised audit records.

This is a nuance the original misses - you can't just keep identifiable audit logs after account deletion under GDPR. Anonymisation is the standard approach.

---

## [AMENDMENT] Dependency List Cleanup - Apply to All Issues

Several issues have long dependency chains like "Issue #1, #2, #7, #12, #13, #15". These include transitive dependencies which create noise. **Rule: only list immediate blockers, not their ancestors.**

Specific fixes:

| Issue | Current Depends On | Change To |
|-------|-------------------|-----------|
| #21 (Consent toggle) | #1, #2, #12, #13 | **#2 (service stubs), #13 (seed users)** - #1 and #12 are transitive via #2 and #13 |
| #23 (Student profile) | #1, #2, #7, #12, #13, #15 | **#7 (validation), #15 (student registration)** - rest are transitive |
| #25 (was #26, Job posting) | #1, #2, #7, #12, #25 | **#7 (validation), #24 (approved companies)** - rest are transitive |
| #31 (was #32, Recruiter search) | #9, #21, #22, #23, #3 | **#9 (student data access layer), #22 (per-company consent)** - #3 and #21 are transitive |

---

## [AMENDMENT] Summary Table - Updated Counts

After all amendments:

| Layer | Count | Change |
|-------|-------|--------|
| L1 - Foundation Lock | **20** | +2 new issues (role mapping, login page), -1 moved out (loading states to L2), -1 moved out (CV storage to L2) = net 0 |
| L2 - Consent, Profiles, Job Board | **7** | +2 moved in (loading states, CV storage decision), -1 merged (external links into profile) = net +1 |
| L3 - CV Library & Account Management | 5 | No change |
| L4 - Search, Recommendations, Dashboard | 3 | No change |
| L5 - Notifications & Stretch | 4 | No change |
| **Total** | **39** | +2 new, -1 merged = net +1 |

---

## [AMENDMENT] GitHub Ingestion Format Note

When Claude Code creates issues, each issue body should follow this exact structure (no metadata lines, no horizontal rules):

```
**What and why**
[text]

**Scope**
[text with bullets where needed]

**Acceptance criteria**
- [ ] Criterion 1
- [ ] Criterion 2

**Depends on:** #X (short title), #Y (short title)
**Blocks:** #A (short title), #B (short title)
```

For feature issues, prepend:

```
**As a** [user type], **I want to** [goal], **so that** [benefit].

**What this means**
[plain english explanation]

[then Scope, Acceptance criteria, Depends on, Blocks as above]
```

Labels and milestones are passed as `gh issue create` flags, NOT in the body.
