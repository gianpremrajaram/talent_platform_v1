# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UCL Computer Science Alliances Platform — a multi-app web platform for industry partners, academics, and students. Built with Next.js 16 (App Router), Prisma (PostgreSQL), NextAuth v4 (credentials/JWT), MUI v7, and Tailwind CSS v4.

## Commands

- `npm run dev` — start dev server (localhost:3000)
- `npm run build` — production build
- `npm run lint` — ESLint (next core-web-vitals + typescript)
- `npx prisma migrate dev` — apply migrations
- `npx prisma db seed` — seed from `prisma/members.yml` (runs via `ts-node prisma/seed.ts`)
- `npx prisma generate` — regenerate Prisma client after schema changes

## Architecture

### Auth Flow
NextAuth v4 with credentials provider and JWT strategy (`src/lib/auth.ts`). After sign-in, users are routed through `/post-sign-in` which reads their roles and `defaultApp` to redirect to the correct app. Custom session fields: `roleKeys`, `membershipTierKey`, `membershipTierRank` — accessed via `(session.user as any).roleKeys` pattern throughout.

### Access Control
`src/lib/access-control.ts` — `userCanAccessApp(userId, appKey)`. ADMIN role bypasses all checks. MODULE_LEADER gets IXN access. Otherwise, membership tier rank is compared against `AppAccessRule` minimums. Default deny when no rules match.

### App Structure
Three internal apps, each a top-level route:
- `/membership-dashboard` — member/admin views with benefits, handbook (markdown in `src/content/handbook/`)
- `/ixn-workflow-manager` — IXN workflow tool
- `/talent-discovery` — partner/student talent views (view param selects: `student`, `job-board`, or full partner view)

### Data Model
Prisma schema at `prisma/schema.prisma`. Key entities: `User` → `UserRole` → `Role`, `User` → `Membership` → `MembershipTier`, `App` → `AppAccessRule`. `MembershipDashboardMember` is a denormalized projection linking user/membership with app-specific data (`redeemedBenefitCodes`). Seed data comes from `prisma/members.yml` (YAML).

### Layout
`src/app/layout.tsx` wraps everything in `ClientLayout` which provides `SessionProvider`, MUI theme, Header, and Footer. The `@/*` path alias maps to `./src/*`.

### Content
Static content lives in `src/content/` as TypeScript modules (`benefits.ts`, `releases.ts`, `pathways.ts`, `services.ts`, `stories.ts`, `pageCopy.ts`, `siteMeta.ts`). Handbook content is markdown files rendered via remark.

### API Routes
All under `src/app/api/`:
- `auth/[...nextauth]/route.ts` — NextAuth handler
- `auth/admin-check/route.ts` — admin verification endpoint
- `account/*` — CRUD for users (create, update, delete, get, reset-password, change-password)

### Environment
Requires `DATABASE_URL` in `.env` (PostgreSQL). All `.env*` files are gitignored.

## Team 1 — Talent Platform V1

Building CV concierge library on top of `/talent-discovery`. Planning docs and reports in `Docs/` subfolder.

**Source of truth for task breakdown:** `Docs/coding_start_planning.pdf`

### Build Layer Sequence (from coding start doc)

Sequential bottleneck: auth, DB schema, and RBAC gates must be locked before any feature work starts — parallel builders will break against schema drift without CI/CD. After L1 is stable, three streams (CV/profile, job board, admin panel shells) can run in parallel.

| Layer | What | Groups |
|-------|------|--------|
| L1 | Login UI, Prisma schema + migrations, registration, SSO placeholder, 2FA review, tiered RBAC gates | F (Foundation) |
| L2 | Consent toggle skeleton, whitelist/blacklist per-company, student profile fields, external profile links, admin approve/reject company, recruiter post job | CON, CVP, ADM, JOB |
| L3 | CV upload/update/delete (storage TBD — PostgreSQL vs external/S3), CV keyword tagging, multiple CVs, account deletion, admin suspend/ban (separate table, not parent User) | CVP, CON, ADM |
| L4 | Recruiter search (consent-gated, Gold/Platinum only), admin recommendation gateway A1 (new `admin_recommendations` table), admin dashboard (consented vs total, approved recruiters, matchable pairs — pie/donut viz) | SRCH, REC-A, DASH |
| L5 | Recruiter contacts student (mailto/external), student notification on contact request, stretch dashboard filters | NOTIF, DASH |

### Key Architectural Decisions

**Recommendation Gateway — chose A1 (in-app flag + recruiter tab).** Admin filters consented students by enums (location, degree, experience), tags them as recommended to firm X. Each firm sees only their own "Recommended Students" tab — no cross-firm visibility. Revocable by removing the tag. DB cost: one `admin_recommendations` table (`student_id`, `firm_id`, `admin_id`, `created_at`, `revoked_at`). A2 (CSV export) rejected as no audit trail / not revocable in-platform. A3 (student-initiated referral) rejected as over-engineered for V1 (adds async 3-step flow + notification queue).

**Option B (admin surfaces firms to students)** deferred — significantly simpler than A, ship as bolt-on after A1. Just an `admin_recommended` boolean or ordering weight on companies, amended ORDER BY in job board query.

**Suspend/ban** uses a separate access table rather than writing to the parent User table — avoids cross-app suspension if the platform expands to multiple sub-applications post-handover.

**CV storage** needs research: PostgreSQL blob storage is not ideal for production. Approaches under consideration: external storage (S3/GDrive links as V1 workaround), discuss with Daniel/client.

### Key Patterns

- Shared engine in `src/lib/services/` — page builders import, never bypass with direct Prisma calls
- Type contracts in `src/types/index.ts` — locked before parallel work starts
- `TierGate` component wraps all restricted UI sections (`<TierGate tier="gold">`)
- All business logic centralised in `src/lib/`, pages stay "dumb" consumers
- New tables needed: `admin_recommendations` (not yet in schema)
- Consent gating: recruiters only see consented students via service layer check
- Service functions start as stubs returning dummy data — pages call real signatures from day one, real logic wired later with zero page refactoring
- If you find yourself writing `if (user.tier === 'gold')` in a page component, stop — add a service function or extend `TierGate` instead

### Git Workflow

- Work on `dev` branch (or feature branches off `dev`), never push directly to `main`
- `main` has branch protection — Daniel (client) reviews PRs to `main`
- Raise PRs from `dev` → `main` only at integration milestones, not on every commit
- After any pull that touches `schema.prisma`, every dev must run `npx prisma migrate dev`
- Keep `.env.example` committed and current — any new env var added in the same commit
