# Developer Stack Guide

**Purpose:** Explain how every technology in this project relates to every other, where each one sits in the request lifecycle, and which GitHub issues each is relevant to. This is the "how does the machine work" doc — not what to build (that's the issue list) or what decisions were made (that's the implementation playbook).

**Audience:** MSc CS students picking up this web stack for the first time. Assumes solid CS fundamentals (you know what an API is, what a relational database does, how HTTP works). Does not assume prior experience with TypeScript, React, Next.js, or any specific web framework.

**Last updated:** 6 March 2026

---

## 1. How the Stack Fits Together

The entire application is a single Next.js project. Every technology in the stack operates at a specific layer of the request lifecycle. Here is the full picture, from the user's browser to the database and back:

```
                        BROWSER (client-side)
                 ┌──────────────────────────────┐
                 │  React components (client)    │
                 │  MUI components (buttons,     │
                 │    forms, tables, dialogs)    │
                 │  Tailwind CSS (styling)       │
                 │  NextAuth session (JWT cookie) │
                 └──────────────┬───────────────┘
                                │ HTTP request
                                ▼
                      NEXT.JS SERVER (Node.js)
          ┌─────────────────────────────────────────┐
          │                                         │
          │  1. Middleware (src/middleware.ts)        │
          │     Auth check + tier gate before        │
          │     anything renders                     │
          │              │                           │
          │              ▼                           │
          │  2. App Router (src/app/**/page.tsx)     │
          │     File-based routing. Each file =      │
          │     a URL path. Server Components        │
          │     render here (default).               │
          │              │                           │
          │              ▼                           │
          │  3. API Routes (src/app/api/**/route.ts) │
          │     REST endpoints. Handle form           │
          │     submissions, CRUD operations.         │
          │              │                           │
          │              ▼                           │
          │  4. Service Layer (src/lib/services/)    │
          │     All business logic lives here.       │
          │     Pages and API routes call these      │
          │     functions — never the DB directly.   │
          │              │                           │
          │              ▼                           │
          │  5. Prisma ORM (src/lib/prisma.ts)       │
          │     Translates TypeScript function       │
          │     calls into SQL queries.              │
          │              │                           │
          └──────────────┼──────────────────────────┘
                         │ SQL over TCP
                         ▼
                ┌─────────────────┐
                │   PostgreSQL    │
                │   (database)    │
                └─────────────────┘
```

**Key insight:** Next.js blurs the line between "frontend" and "backend." Some code runs in the browser, some runs on the server, and some runs in both places depending on context. The sections below clarify which is which.

---

## 2. Technology-by-Technology Breakdown

### TypeScript (language layer)

TypeScript is JavaScript with static types added on top. You write `.ts` and `.tsx` files; the build step compiles them to plain JavaScript before anything runs. The types exist only at compile time — they are erased completely in the output. Think of it as Java's type system bolted onto JavaScript's runtime.

**Why it matters here:** Prisma auto-generates TypeScript types from the database schema. This means if you add a column to a Prisma model, every file that touches that model gets a compile-time error if it's using the wrong shape. This is the "single type contract" the project relies on to keep five parallel developers in sync.

**Where it runs:** Everywhere. Every file in the project is TypeScript.

### React (UI layer)

React is a library for building user interfaces using components — self-contained pieces of UI that accept inputs (called "props") and return what should appear on screen. Components are written in JSX (JavaScript XML) — a syntax extension that lets you write HTML-like markup inside JavaScript/TypeScript files. A `.tsx` file is TypeScript + JSX.

React does not handle routing, data fetching, or server-side rendering on its own. That is what Next.js adds.

**Key concept — components:** Everything visible on the page is a React component. A page is a component. A button is a component. A form is a component. Components compose — a page component renders form components which render button components.

**Where it runs:** Both browser and server (explained in Section 3).

### Next.js (framework layer)

Next.js wraps React and adds everything a production web app needs: file-based routing, server-side rendering (SSR — generating HTML on the server before sending it to the browser), API route handlers, middleware, and a build/deploy pipeline.

This project uses **Next.js 16 with the App Router.** The App Router means:
- Every folder inside `src/app/` is a URL route. `src/app/talent-discovery/page.tsx` serves the `/talent-discovery` URL.
- Every `page.tsx` file is the page component for that route.
- Every `route.ts` file inside `src/app/api/` is a REST (Representational State Transfer) API endpoint.
- `layout.tsx` files wrap pages with shared UI (header, footer, providers).

**Why it matters here:** Next.js is the central orchestrator. It decides what code runs on the server vs the browser, handles routing, and provides the middleware layer where auth checks happen before any page loads.

**Where it runs:** Both. The framework manages the split.

### Prisma (data access layer — ORM)

Prisma is an ORM (Object-Relational Mapper) — it lets you interact with the PostgreSQL database using TypeScript function calls instead of writing raw SQL. You define your data model in a single schema file (`prisma/schema.prisma`), and Prisma generates:
1. A TypeScript client with typed functions for every table (`prisma.user.findMany()`, `prisma.jobPosting.create()`, etc.)
2. TypeScript types for every model (so your editor autocompletes column names)
3. SQL migrations that alter the actual database tables

**The Prisma workflow:**
```
Edit schema.prisma  →  npx prisma migrate dev  →  npx prisma generate
   (define model)       (create SQL migration       (regenerate TS client
                         + apply to local DB)         with new types)
```

After running `migrate dev`, your local PostgreSQL database has the new tables/columns, and the TypeScript client knows about them. Every developer must run this after pulling any commit that touches the schema.

**Where it runs:** Server only. Prisma talks directly to PostgreSQL over TCP (Transmission Control Protocol). It cannot run in the browser.

### PostgreSQL (database)

PostgreSQL is the relational database. It runs as a separate process on your machine (local dev) or on the UCL IXN server (production). The application never talks to it directly — all access goes through Prisma.

**Where it runs:** Its own process, separate from the Next.js server. Connected via the `DATABASE_URL` environment variable.

### NextAuth v4 (authentication layer)

NextAuth handles user login, session management, and role/tier injection. In this project it uses:
- **Credentials provider** — email + password login (not OAuth/social login)
- **JWT (JSON Web Token) strategy** — sessions are stored as encrypted cookies in the browser, not in the database. The JWT contains `roleKeys`, `membershipTierKey`, and `membershipTierRank` so that auth checks don't need a database query on every request.

**The auth flow:**
```
User submits email/password
    → NextAuth verifies against DB (bcrypt hash check)
    → JWT created with role + tier data baked in
    → JWT stored as HTTP-only cookie in browser
    → Every subsequent request carries this cookie
    → Middleware reads JWT → checks auth + tier
    → Page reads JWT via getServerSession() or useSession()
```

**Where it runs:** Server-side for verification and JWT creation. The JWT cookie travels with every browser request automatically.

### MUI / Material UI v7 (component library)

MUI (Material UI) is a React component library — it provides pre-built, styled UI components: buttons, text fields, dialogs, tables, tabs, cards, icons, and more. Instead of writing a button from scratch with custom CSS (Cascading Style Sheets), you import `<Button>` from MUI and it comes with consistent styling, accessibility, and interaction states.

This project uses the **Mantis dashboard template**, which is built on MUI. The existing membership dashboard pages use MUI components extensively.

**Where it runs:** Browser. MUI components render to HTML + CSS in the browser.

### Tailwind CSS v4 (utility-class styling)

Tailwind is a CSS framework that provides small, single-purpose utility classes. Instead of writing a CSS file with `.my-card { padding: 16px; margin-top: 8px; }`, you write `className="p-4 mt-2"` directly on the HTML (HyperText Markup Language) element. Tailwind and MUI coexist in this project — MUI handles component-level styling (buttons, forms), Tailwind handles layout and spacing.

**Where it runs:** Compiles at build time into a CSS file. The classes are just CSS — no JavaScript runtime cost.

### Zod *(to be added — GitHub #9)*

Zod is a runtime validation library. TypeScript types are erased at runtime — they cannot catch invalid data coming from a form submission or API request. Zod schemas validate data at runtime and return structured error messages. The plan is to co-locate Zod schemas with the type contracts in `src/types/` so that every form submission validates against a schema before hitting the database.

**Where it will run:** Server-side (API route validation) and optionally client-side (form validation before submission).

### Chart library *(to be added — GitHub #36)*

A charting library (likely MUI Charts or a lightweight alternative) will be added for the admin dashboard metrics — pie/donut charts showing consented vs total students, approved recruiters, etc. Decision on which library is deferred until the dashboard issue is picked up.

**Where it will run:** Browser. Charts render as SVG (Scalable Vector Graphics) or Canvas elements in the browser.

---

## 3. Client vs Server — What Runs Where

This is the most important mental model for working with Next.js App Router. If you only read one section of this doc, read this one.

### Server Components (default)

Every component in the `src/app/` directory is a **Server Component** by default. Server Components:
- Render on the server, send HTML to the browser
- Can directly call Prisma, read files, access environment variables
- Cannot use React hooks (`useState`, `useEffect`, `useSession`)
- Cannot attach event handlers (`onClick`, `onChange`)
- Never ship their JavaScript to the browser — zero client-side cost

**Example use case:** A page that fetches data from the database and renders a list. The database query runs on the server; the browser receives only the HTML.

### Client Components (`'use client'`)

Any component file with `'use client'` at the top is a **Client Component**. Client Components:
- Render in the browser (and may also pre-render on the server for the initial HTML)
- Can use React hooks, event handlers, browser APIs
- Cannot directly import Prisma or access server-only resources
- Their JavaScript is shipped to the browser

**Example use case:** A consent toggle that the user clicks. The click handler runs in the browser, makes an API call to the server, and updates the UI.

### The boundary rule

A Server Component can render a Client Component inside it (by importing and using it). A Client Component **cannot** import a Server Component. This creates a clear boundary:

```
Server Component (page.tsx)           ← fetches data from DB
  └── Client Component (Toggle.tsx)   ← handles user interaction
        └── MUI <Switch> component    ← renders the toggle UI
```

### Where each technology is usable

| Technology | Server Components | Client Components | API Routes | Middleware |
|-----------|:-:|:-:|:-:|:-:|
| Prisma | Yes | No | Yes | No |
| NextAuth `getServerSession()` | Yes | No | Yes | No |
| NextAuth `useSession()` | No | Yes | No | No |
| MUI components | Limited | Yes | No | No |
| Tailwind classes | Yes | Yes | No | No |
| React hooks (useState, etc.) | No | Yes | No | No |
| JWT decoding | Yes | No | Yes | Yes |

---

## 4. Developer Workflow Map

### "I need to add a new page"

1. Create `src/app/my-route/page.tsx` — this automatically serves `/my-route`
2. The page component is a Server Component by default — fetch data via service layer
3. Import types from `src/types/index.ts`
4. Call service functions from `src/lib/services/` to get data
5. Render using MUI components + Tailwind classes
6. If the page needs interactivity (forms, toggles, clicks), extract those parts into a `'use client'` component and import it from the page

**Issues where you'll do this:** #16, #17, #22, #24, #26, #27, #28, #29, #34, #36

### "I need to add a new database table"

1. Edit `prisma/schema.prisma` — add the new model
2. Run `npx prisma migrate dev --name descriptive_name` — creates SQL migration + applies to local DB
3. Run `npx prisma generate` — regenerates the TypeScript client (often automatic after migrate)
4. Add corresponding types to `src/types/index.ts`
5. Add or update the service stub in `src/lib/services/`
6. Update `prisma/seed.ts` if the new table needs test data
7. **Post in team channel:** "Schema change — pull and run `npx prisma migrate dev`"

**Issues where you'll do this:** #13 (main schema extension), #14 (seed users)

### "I need to add an API endpoint"

1. Create `src/app/api/my-endpoint/route.ts`
2. Export a named function matching the HTTP method: `export async function POST(request: Request) { ... }`
3. Validate input with Zod schema (once #9 is implemented)
4. Call service layer functions — never Prisma directly in the route file
5. Return a response using the `ApiResponse<T>` shape (once #8 is implemented)
6. Check auth via `getServerSession(authOptions)` if the endpoint is protected

**Issues where you'll do this:** #17, #18, #27, #28, #29, #32, #33

### "I need to add access control to a feature"

Two layers, both required:

1. **Route level (middleware):** Add the route pattern to `src/middleware.ts` with the required tier/role check. This blocks unauthenticated or insufficient-tier users before the page even starts rendering.
2. **Component level (TierGate):** Wrap restricted UI sections with `<TierGate tier="gold">` or `<TierGate role="ADMIN">`. This hides content from users who somehow reach the page but shouldn't see specific sections.

Both layers read from the JWT session — no extra database calls.

**Issues where you'll do this:** #2 (mapping decision), #5 (TierGate), #6 (middleware), #7 (RBAC refactor)

### "I need to validate form input"

*(Once Zod is added per #9)*

1. Define a Zod schema in `src/types/` or `src/lib/validation/` that mirrors the TypeScript type
2. In the API route: parse the request body with `schema.parse(body)` — throws structured error if invalid
3. Optionally in the client component: validate before submission for instant feedback
4. Return validation errors using the `ApiResponse<T>` error shape (#8)

**Issues where you'll do this:** #9 (set up validation), #26 (student profile form), #28 (job posting form)

---

## 5. Technology to GitHub Issue Map

### Prisma / PostgreSQL (database layer)

| Issue | What you'll do with Prisma/PostgreSQL |
|-------|--------------------------------------|
| #13 | **Primary.** Add 6 new models to schema, run migration. The biggest schema change in the project. |
| #14 | Extend seed script with student, admin, recruiter test users. |
| #15 | Document `DATABASE_URL` in `.env.example`. |
| #17 | Student registration writes new User + assigns STUDENT role. |
| #18 | Recruiter registration writes User in pending state. |
| #24 | Wire consent service to real `StudentCompanyConsent` queries. |
| #25 | Wire per-company consent to same junction table. |
| #26 | Wire student profile CRUD to `StudentProfile` table. |
| #27 | Wire admin approve/reject to Organisation + role assignment. |
| #28 | Wire job posting CRUD to `JobPosting` table. |
| #29 | Wire CV CRUD to `StudentCV` table. |
| #32 | Fix FK cascade in delete-user transaction. |
| #33 | Wire `AppSuspension` table into access control. |
| #34 | Wire recruiter search with consent-gated Prisma queries. |
| #35 | Wire recommendation gateway to `AdminRecommendation` table. |
| #36 | Aggregate queries for dashboard metrics (COUNT, GROUP BY). |

### NextAuth / Auth / Middleware (authentication + authorisation)

| Issue | What you'll do with auth |
|-------|------------------------|
| #2 | **Decision.** Map scaffold roles/tiers to Talent Platform user model. |
| #5 | Build TierGate component reading from JWT session. |
| #6 | Create middleware route protection rules. |
| #7 | Refactor existing RBAC logic, add `userCanAccessFeature()`. |
| #12 | Wire company lifecycle status into `userCanAccessApp()`. |
| #16 | Review login page, fix post-login redirect for all roles. |
| #17 | Student registration — auto-assign STUDENT role. |
| #18 | Recruiter registration — pending approval state. |
| #19 | SSO placeholder stub in `auth.ts`. |
| #20 | 2FA review and placeholder. |
| #33 | Check `AppSuspension` in access control. |

### React / MUI / Tailwind (UI layer)

| Issue | What you'll build in the UI |
|-------|---------------------------|
| #5 | TierGate wrapper component. |
| #16 | Login page review + register link. |
| #17 | Student registration form. |
| #18 | Recruiter registration form. |
| #22 | Loading, empty, error state shared components. |
| #24 | Consent toggle in StudentView. |
| #25 | Per-company consent list with toggles. |
| #26 | Student profile form (skills, experience, degree, links). |
| #27 | Admin panel — pending company registrations list. |
| #28 | Job posting form + student listing view. |
| #29 | CV upload/manage UI in StudentView. |
| #30 | Multiple CV list with labels. |
| #31 | CV keyword tag input. |
| #33 | Admin suspend/ban button + UI. |
| #34 | Recruiter search UI with filters. |
| #35 | Admin recommendation panel + recruiter "Recommended" tab. |
| #36 | Admin dashboard with chart visualisation. |
| #37 | Recruiter "Contact" button (mailto). |
| #38 | Student notification bell/history. |

### TypeScript types / Service layer (architecture)

| Issue | What you'll define |
|-------|--------------------|
| #3 | Shared type contracts in `src/types/index.ts`. |
| #4 | Service layer stubs in `src/lib/services/`. |
| #8 | Error handling contract (`ApiResponse<T>` type). |
| #10 | Audit logging service with action enum. |
| #11 | Centralised student data access layer with role-based visibility. |

### Zod *(to be added)*

| Issue | What you'll validate |
|-------|---------------------|
| #9 | **Primary.** Install Zod, create schemas for StudentProfile, JobPosting, UserRegistration, CompanyConsent. |
| #26 | Student profile form validation. |
| #28 | Job posting form validation. |

---

## 6. Kubernetes, Deployment, and the Production Boundary

### What Kubernetes is in this project

Kubernetes (often abbreviated K8s) is a container orchestration platform. The UCL IXN server runs the application inside a Kubernetes cluster. In practical terms this means:

- The application runs inside a **pod** — a container (similar to a lightweight VM (Virtual Machine)) that has the Next.js server, the Node.js runtime, and the built application code.
- Environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, etc.) are injected into the pod at startup from a **ConfigMap** or **Secret** — Kubernetes resources that store configuration separately from the application code.
- When new code is deployed (Daniel merges a PR to `main`), the pod is restarted with the new code and the same ConfigMap values.

### What this means for local development

**Kubernetes does not affect your local development workflow at all.** When you run `npm run dev`, you are running a plain Node.js process on your machine. There are no containers, no pods, no ConfigMaps. Your local `.env` file provides the environment variables that Kubernetes would provide in production.

The full pipeline:

```
LOCAL DEVELOPMENT                          PRODUCTION (UCL IXN Server)
─────────────────                          ───────────────────────────
npm run dev                                Kubernetes pod
  ├── Next.js dev server (localhost:3000)    ├── Next.js production server
  ├── Reads .env file for env vars           ├── Reads ConfigMap/Secret for env vars
  ├── Connects to local PostgreSQL           ├── Connects to production PostgreSQL
  └── Hot reload on file save                └── Static build, no hot reload

Your machine                               UCL IXN VM
  └── PostgreSQL (local)                     └── PostgreSQL (production)
```

### The `.env.example` contract

This is the bridge between local dev and Kubernetes deployment. The `.env.example` file (GitHub #15) documents every environment variable the application expects. When you add a new env var:

1. Add it to `.env.example` in the same commit as the code that uses it
2. Add it to your local `.env` file
3. **Daniel must also add it to the Kubernetes ConfigMap/Secret** — if he doesn't, the production pod starts without that variable and the feature silently breaks or throws at runtime

This is why `.env.example` is committed to the repo but `.env` is not — `.env` contains real credentials, `.env.example` contains placeholder values that document what's expected.

### Schema migrations in deployment

Locally, `npx prisma migrate dev` creates and applies migrations interactively. In production, migrations are applied differently:

1. The migration SQL files live in `prisma/migrations/` (committed to the repo)
2. When the production pod starts, `npx prisma migrate deploy` runs the pending migrations against the production database
3. This is a one-way operation — production migrations cannot be rolled back automatically

**Risk:** If a migration removes a column that existing data depends on, the production database loses that data. This is why schema changes (#13) are coordinated carefully and tested locally first.

### Docker in the pipeline

Docker is the container technology that Kubernetes runs. The project likely has (or will need) a `Dockerfile` that defines how to build the application into a container image:

```
Install dependencies (npm install)
    → Build the Next.js app (npm run build)
    → Copy build output into container
    → Set CMD to start the server (npm start)
```

You do not need to use Docker for local development. It only matters when deploying to the UCL server.

### Issues that touch deployment concerns

| Issue | Deployment relevance |
|-------|---------------------|
| #13 | Schema migration — must be applied to production DB on deploy. |
| #15 | `.env.example` — the contract between code and Kubernetes ConfigMap. |
| #19 | SSO stub — placeholder for UCL Shibboleth which requires server-side configuration. |
| #23 | CV storage decision — if S3 is chosen, new env vars needed in ConfigMap. |

---

## 7. Rules of the Road

These are practical patterns specific to how the technologies in this stack interact. Not general coding advice — specific to this project.

1. **After any pull that touches `schema.prisma`:** run `npx prisma migrate dev` then `npx prisma generate`. If you skip this, your local TypeScript client is out of sync with the schema and you'll get confusing type errors or runtime crashes.

2. **Never import Prisma in a client component.** If your file has `'use client'` at the top, it runs in the browser. Prisma requires a TCP connection to PostgreSQL — browsers can't do that. If you need data in a client component, fetch it via an API route or pass it down as props from a Server Component.

3. **Never write business logic in page files.** Pages import from `src/lib/services/` and render the results. If you find yourself writing a Prisma query or a complex `if` chain in a `page.tsx` file, move it to a service function.

4. **Never write tier/role checks in component files.** Use `<TierGate>` for UI gating and middleware for route gating. If you're writing `if (user.tier === 'gold')` in a component, stop and use TierGate instead.

5. **Import types from one place.** All shared types come from `src/types/index.ts`. Don't define your own `StudentProfile` type in a component file — import the canonical one.

6. **All API responses use the same shape.** Once #8 is implemented: `{ success: boolean, data?: T, error?: { code: string, message: string } }`. Don't invent your own response format.

7. **Validate at the boundary.** User input arrives via API routes. Validate it there with Zod (once #9 is implemented). Internal service-to-service calls within the server can trust typed inputs — don't double-validate internally.

8. **MUI for components, Tailwind for layout.** Use MUI's `<Button>`, `<TextField>`, `<Dialog>`, etc. for interactive UI elements. Use Tailwind utility classes (`className="flex gap-4 p-6"`) for layout, spacing, and responsive design. Don't fight between them — they serve different purposes.
