# Talent Platform V1 — Progress Update

**Date:** 19 March 2026
**Reporting period:** 12–19 March 2026 (Week 2)
**Baseline:** Changes measured against the state reported in the 12 March update

---

## Summary

Week 2 shifted focus from UI shells to architectural foundations and backend wiring. The role-and-tier mapping decision was documented and merged, completing the last prerequisite for shared type contracts and service layer work. The Prisma schema was extended with five new models covering consent, job postings, recommendations, suspensions, and CV storage. The admin panel was consolidated under the membership dashboard, refactored based on teacher feedback, and wired to live API endpoints replacing all mock data. A user journey map was produced documenting end-to-end flows for all user types. Production build issues were resolved and the seed toolchain was modernised.

---

## Architecture & Decision Documents

The role-and-tier mapping decision (#2) was completed and committed as a planning document. This defines how the existing scaffold roles and membership tiers map to the Talent Platform user model: students use role-only access with no membership row, recruiters share a single RECRUITER role with tier differentiation via membership (Bronze through Platinum), and the existing ADMIN role is reused without modification. This decision unblocks the shared type contracts, TierGate component, middleware route protection, and both registration flows.

A comprehensive user journey map was also produced, documenting login routing, student and recruiter registration flows, profile completion, consent management, job board access by tier, admin approval and suspension workflows, and the recommendation gateway. This serves as a reference for all streams during parallel L2 development.

**Mapped tickets:** #2 (role/tier mapping — closed), #48 (user journey and planning docs — closed)

---

## Database & Schema

The schema extension for issue #13 was completed and merged. Five new models were added in a single migration:

- **StudentCompanyConsent** — per-company visibility consent with a unique constraint on student-company pairs, enabling the consent-gated recruiter search planned for L4
- **JobPosting** — recruiter-created postings linked to an organisation and creating user, with active/expiry controls and composite indexes for listing queries
- **AdminRecommendation** — the recommendation gateway table mapping students to firms with admin attribution and soft-revoke via a nullable `revokedAt` field
- **AppSuspension** — per-app suspension scoped by app key, ensuring a suspension on the talent platform does not affect other sub-applications
- **StudentCV** — CV document references with labels, supporting multiple uploads per student via a URL-based storage abstraction

Additionally, a `status` enum (PENDING, APPROVED, SUSPENDED, BANNED) was added to the Organisation model to support the company lifecycle state machine, and a `isActive` boolean was added to the User model for soft deletion. A CV storage service abstraction was introduced alongside the schema.

**Mapped tickets:** #13 (schema extension — closed)

---

## Admin Panel

The admin panel underwent three significant changes this week: structural consolidation, feedback-driven UI revisions, and backend wiring.

**Consolidation.** All admin routes and components were migrated from a standalone `/admin` path into `/membership-dashboard`, aligning admin functionality under the existing membership dashboard sub-application. The sidebar navigation was updated to reflect the new routing structure and now displays live session data (user name, role) rather than placeholder values.

**Teacher feedback revisions.** Based on teacher feedback, the admin layout was restructured with a shared sidebar layout wrapper applied across all sub-pages. The dashboard content area was simplified by removing redundant nested layouts. Data tables were refined with improved font sizing, padding, and pagination styling. Toolbar elements (search bars, notification icons, explanatory cards) were removed to reduce clutter.

**Backend wiring.** Two new API endpoints were created — `GET /api/admin/partners` and `GET /api/admin/students` — both requiring ADMIN role authentication. The student and partner management pages now fetch live data from these endpoints instead of rendering hardcoded mock arrays. A new individual student management route was added at `/membership-dashboard/student-users/[id]/manage`, providing admin-facing password reset and account deletion functionality with confirmation dialogs and success/error feedback.

**Mapped tickets:** #27 (admin company approval — open, further progress), #33 (admin suspend/ban — open, table structure refined)

---

## Production & Tooling

A set of production build fixes were applied to resolve TypeScript strictness errors and formatting issues across several files, including the membership dashboard page, access denied page, header component, and user update API route. The `swr` data-fetching library was added as a dependency to support the admin panel's client-side data loading. The seed command toolchain was migrated from `ts-node` to `tsx` for faster TypeScript execution during development.

**Mapped tickets:** No specific ticket — infrastructure maintenance

---

## What Comes Next

With the role/tier mapping decided and the schema locked, the project is now positioned for parallel L2 feature work across all four streams. The immediate priorities are:

- **Shared type contracts and service stubs** (#3, #4) — the typed interfaces and stub functions that all feature streams will import from
- **TierGate component and middleware route protection** (#5, #6) — the two-layer access control system gating pages by role and tier
- **Error handling and validation contracts** (#8, #9) — the shared patterns for API responses and input validation
- **Consent toggle and per-company consent** (#24, #25) — wiring the new StudentCompanyConsent table to service layer functions
- **Recruiter self-registration** (#18) — the pending-approval registration flow dependent on the company lifecycle state machine (#12)

These items complete the L1 foundation lock and enable the CV library, job board, and recommendation gateway features in subsequent layers.

**Key open tickets for next phase:** #3, #4, #5, #6, #7, #8, #9, #12, #17, #18, #24, #25

---

## Ticket Status Overview

| Status | Count | Tickets |
|--------|-------|---------|
| Closed this period | 3 | #2, #13, #48 |
| Closed previously | 3 | #14, #15, #47 |
| In progress (code merged) | 4 | #16, #26, #27, #33 |
| In progress (UI shell only) | 2 | #29, #30 |
| Not yet started | 25 | #3–#12, #17–#25, #28, #31–#32, #34–#40 |

All ticket numbers reference [github.com/gianpremrajaram/scaffold/issues](https://github.com/gianpremrajaram/scaffold/issues).
