# Systems Architecture

High-level view of how the UCL CS Alliances platform is structured: three user audiences (clients), a single Next.js application that serves all three role-scoped portals, and the shared data layer underneath.

All portals are served from **one Next.js 16 deployment** (App Router). Role and membership-tier access is enforced uniformly at the edge (middleware + NextAuth JWT) and at the feature boundary (`userCanAccessApp`, `userCanAccessFeature`, `TierGate`). Portal code reads and writes through a shared service layer (`src/lib/services/*`) which is the only caller of Prisma.

## Diagram

```mermaid
flowchart TB
    %% ============ CLIENTS ============
    subgraph Clients["Clients (Web Browser)"]
        direction LR
        AdminUser["Admin User<br/>programme staff"]
        StudentUser["Student User"]
        RecruiterUser["Recruiter User<br/>industry partner"]
    end

    %% ============ NEXT.JS APP ============
    subgraph NextApp["Next.js Application Server (single deployment)"]
        direction TB

        AuthGate["Auth &amp; Access Control<br/>NextAuth (JWT) · Middleware · TierGate<br/>role + membership-tier gating"]

        subgraph Portals["Role-Scoped Portals"]
            direction LR

            subgraph AdminPortal["Admin Portal"]
                direction TB
                AdminF1["User &amp; Partner Administration<br/>· user CRUD<br/>· partner approvals<br/>· app-scoped suspensions"]
                AdminF2["Curated Recommendations<br/>· admin &rarr; firm student matching<br/>· revoke / manage recs"]
                AdminF3["Membership &amp; Platform Metrics<br/>· tier &amp; benefit oversight<br/>· student / partner dashboards"]
            end

            subgraph StudentPortal["Student Portal"]
                direction TB
                StudentF1["Profile &amp; CV Library<br/>· bio, education, work, skills<br/>· multi-CV upload"]
                StudentF2["Job Board<br/>· browse approved postings<br/>· apply with CV + cover letter"]
                StudentF3["Company Visibility Consent<br/>· per-firm opt-in<br/>· revoke access"]
            end

            subgraph RecruiterPortal["Recruiter Portal"]
                direction TB
                RecruiterF1["Job Postings<br/>· create &amp; manage jobs<br/>· admin-approval gated"]
                RecruiterF2["Applicant Review<br/>· applications per job<br/>· CV + cover letter"]
                RecruiterF3["Talent Discovery<br/>· consent-scoped search (Silver+)<br/>· curated recs (Platinum)"]
            end
        end

        Services["Service Layer · src/lib/services/*<br/>business logic for students, recruiters,<br/>jobs, recommendations, applications"]
    end

    %% ============ DATA LAYER ============
    subgraph Data["Data Layer"]
        direction TB
        Prisma["Prisma ORM"]
        subgraph DB["PostgreSQL"]
            direction LR
            IdentityDomain["Identity &amp; Org<br/>User · Role · UserRole ·<br/>Organisation · Session · Account"]
            MembershipDomain["Membership &amp; Apps<br/>Membership · MembershipTier ·<br/>App · AppAccessRule"]
            TalentDomain["Talent Platform<br/>StudentProfile · StudentCV ·<br/>JobPosting · JobApplication ·<br/>StudentCompanyConsent ·<br/>AdminRecommendation · AppSuspension"]
            AuditDomain["Audit<br/>AuditLog"]
        end
    end

    %% ============ FLOWS ============
    AdminUser --> AuthGate
    StudentUser --> AuthGate
    RecruiterUser --> AuthGate

    AuthGate --> AdminPortal
    AuthGate --> StudentPortal
    AuthGate --> RecruiterPortal

    AdminPortal --> Services
    StudentPortal --> Services
    RecruiterPortal --> Services

    Services --> Prisma
    Prisma --> DB
```

## How to read

- **Clients** — three human audiences hitting the same origin from a browser.
- **Auth &amp; Access Control** — every request passes through middleware-enforced auth and tier gating before reaching a portal. ADMIN bypasses tier rules; STUDENT / RECRUITER are evaluated against role + active membership tier.
- **Role-scoped portals** — UI surfaces grouped by audience. Each node lists the ~3 headline capabilities. Admins can reach every portal; recruiters and students are scoped to their own.
- **Service layer** — portals and API routes call into `src/lib/services/*` (e.g. `student-services.ts`, `recruiter-search.ts`, `job-board.ts`, `recommendations.ts`, `applications.ts`). Portals never call Prisma directly.
- **Data layer** — a single PostgreSQL database accessed through Prisma, grouped into four logical domains that match the `prisma/schema.prisma` sections.
