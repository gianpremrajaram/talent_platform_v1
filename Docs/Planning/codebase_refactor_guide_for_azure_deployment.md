# Azure VM Production Build Fix Report

**Status:** Actionable audit — all issues verified against current codebase on branch `feature/issue-13-schema-migration`.
**Target:** `npm run build` passing cleanly on Azure VM (Ubuntu/Debian) with `output: "standalone"`.
**Last updated:** 13 March 2026

---

## How to Use This Document

Each issue has a unique ID (e.g. T-01, E-01, B-01), a severity, the exact file and line number, and a fix with a code snippet. Work through **Critical** items first — these block the build entirely. **High** items cause runtime failures on Azure even if the build succeeds. **Medium** items are type safety debt that will bite during feature development. **Low** items are cosmetic or maintainability.

**Severity key:**
- **Critical** — blocks `npm run build`
- **High** — compiles but causes runtime failure on Azure
- **Medium** — type safety gap; no crash today, but fragile under refactoring
- **Low** — style / maintainability; fix when touching the file

---

## 1. TYPE ISSUES

### T-01 | NextAuth Session Type Declaration Is Incomplete

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `src/lib/mantis/types/next-auth.d.ts:4-12` |
| **Component** | NextAuth module augmentation |

**Current code:**

```typescript
// src/lib/mantis/types/next-auth.d.ts:4-12
declare module 'next-auth' {
  interface Session {
    id: any;
    provider: any;
    token: any;
  }
}
```

**Problem:** This declaration lives in the Mantis template folder and only declares `id`, `provider`, `token` — all typed as `any`. It does not extend `User` or `JWT` with the custom fields (`roleKeys`, `membershipTierKey`, `membershipTierRank`) that the entire app depends on. Every downstream `(session.user as any).roleKeys` cast exists because this declaration is missing those fields. Under strict production builds, TypeScript may flag these as errors depending on how the bundler resolves ambient types.

**Fix:** Create a project-level type augmentation file. This replaces the Mantis template file as the source of truth.

```typescript
// src/types/next-auth.d.ts  (NEW FILE)
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    roleKeys: string[];
    membershipTierKey: string | null;
    membershipTierRank: number | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      roleKeys: string[];
      membershipTierKey: string | null;
      membershipTierRank: number | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    roleKeys: string[];
    membershipTierKey: string | null;
    membershipTierRank: number | null;
  }
}
```

After creating this file, the old `src/lib/mantis/types/next-auth.d.ts` should be deleted or emptied — having two competing ambient declarations for the same module will cause conflicts.

**Ref:** [NextAuth TypeScript guide](https://www.saad.sh/posts/authjs-extend-user-type)

---

### T-02 | `as any` Casts on `session.user` in Auth Callbacks

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `src/lib/auth.ts:96, 101-103, 110-115` |
| **Component** | NextAuth JWT + Session callbacks |

**Current code:**

```typescript
// src/lib/auth.ts:96
token.id = (user as any).id;
// src/lib/auth.ts:101-103
token.roleKeys = (user as any).roleKeys ?? [];
token.membershipTierKey = (user as any).membershipTierKey ?? null;
token.membershipTierRank = (user as any).membershipTierRank ?? null;
// src/lib/auth.ts:110-115
(session.user as any).id = token.id;
(session.user as any).roleKeys = (token as any).roleKeys ?? [];
(session.user as any).membershipTierKey = (token as any).membershipTierKey ?? null;
(session.user as any).membershipTierRank = (token as any).membershipTierRank ?? null;
```

**Fix:** Once T-01 is applied, all `as any` casts in this file become unnecessary. The callbacks become:

```typescript
// src/lib/auth.ts — jwt callback
async jwt({ token, user }) {
  if (user) {
    token.id = user.id;
    token.name = user.name;
    token.email = user.email;
    token.roleKeys = user.roleKeys ?? [];
    token.membershipTierKey = user.membershipTierKey ?? null;
    token.membershipTierRank = user.membershipTierRank ?? null;
  }
  return token;
},

// src/lib/auth.ts — session callback
async session({ session, token }) {
  if (session.user && token) {
    session.user.id = token.id;
    session.user.roleKeys = token.roleKeys ?? [];
    session.user.membershipTierKey = token.membershipTierKey ?? null;
    session.user.membershipTierRank = token.membershipTierRank ?? null;
  }
  return session;
},
```

---

### T-03 | `as any` Casts on `session.user` in Page Server Components

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Files** | See table below |
| **Component** | Server-side session access in pages |

Once T-01 is applied, every instance below can drop the `as any` cast. These are all the affected locations:

| File | Line(s) | Current Pattern |
|------|---------|-----------------|
| `src/app/(shell)/post-sign-in/page.tsx` | 29, 38 | `(session.user as any).roleKeys`, `(session.user as any).id` |
| `src/app/(shell)/membership-dashboard/page.tsx` | 69, 70 | `(session.user as any).id`, `(session.user as any).roleKeys` |
| `src/app/(shell)/talent-discovery/page.tsx` | 58 | `session.user as any` (assigned to `user` variable) |
| `src/app/(shell)/ixn-workflow-manager/page.tsx` | 27 | `(session.user as any).id` |
| `src/app/(shell)/membership-dashboard/benefits/[benefitId]/page.tsx` | 71 | `(session.user as any).id` |
| `src/lib/membership-dashboard-actions.ts` | 20 | `(session?.user as any)?.roleKeys` |
| `src/components/Header.tsx` | 24 | `(user as any)?.roleKeys` |

**Fix pattern for each:** Replace `(session.user as any).fieldName` with `session.user.fieldName` (or `session?.user?.fieldName` where null checks are needed). The augmented types from T-01 make these properties known to TypeScript.

---

### T-04 | `as any` Casts on `session.user` in API Routes

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Files** | See table below |
| **Component** | API route session access |

| File | Line | Current Code |
|------|------|-------------|
| `src/app/api/account/get-user/route.ts` | 10 | `const me = session?.user as any \| undefined;` |
| `src/app/api/account/create-user/route.ts` | 20 | `const user = session?.user as any \| undefined;` |
| `src/app/api/account/update-user/route.ts` | 21 | `const me = session?.user as any \| undefined;` |
| `src/app/api/account/delete-user/route.ts` | 14 | `const me = session?.user as any \| undefined;` |
| `src/app/api/account/reset-password/route.ts` | 22 | `const me = session?.user as any \| undefined;` |
| `src/app/api/account/change-password/route.ts` | 16 | `const me = session?.user as any \| undefined;` |

**Fix pattern:** After T-01, replace each with:

```typescript
const me = session?.user;       // type is now Session["user"] | undefined
if (!me) return NextResponse.json({ error: "..." }, { status: 401 });
// me.id, me.roleKeys etc. are now typed
```

---

### T-05 | `as any` Casts in Standalone Talent Discovery Pages

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Files** | See table below |
| **Component** | Student profile pages |

| File | Line | Current Code |
|------|------|-------------|
| `src/app/talent-discovery-standalone/student-academic-information/page.tsx` | 31 | `const sessionUser = session?.user as any \| undefined;` |
| `src/app/talent-discovery-standalone/student-skills-experience/page.tsx` | 58 | `const sessionUser = session?.user as any \| undefined;` |
| `src/app/talent-discovery-standalone/student-personal-information/page.tsx` | 30 | `const sessionUser = session?.user as any \| undefined;` |
| `src/app/account/page.tsx` | 18 | `const sessionUser = session?.user as any \| undefined;` |
| `src/app/account/add-user/page.tsx` | 9 | `const user = session?.user as any \| undefined;` |
| `src/app/access-denied/page.tsx` | 86 | `const user = session?.user as any \| undefined;` |

**Fix:** Same pattern as T-04 — drop `as any` after T-01 is applied.

---

### T-06 | Untyped Function Parameters in student-skills-experience

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `src/app/talent-discovery-standalone/student-skills-experience/page.tsx:19, 45` |
| **Component** | Data mapping helpers |

**Current code:**

```typescript
// line 19
function mapExperience(exp: any) { ... }
// line 45
function mapProject(project: any) { ... }
```

**Fix:** Type these parameters against the Prisma-generated types:

```typescript
import type { StudentExperience, StudentProject } from '@prisma/client';

function mapExperience(exp: StudentExperience) { ... }
function mapProject(project: StudentProject) { ... }
```

---

### T-07 | Untyped `userUpdate` Object in update-user Route

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `src/app/api/account/update-user/route.ts:179` |
| **Component** | User update API |

**Current code:**

```typescript
// line 179
const userUpdate: any = { firstName, lastName, email };
```

**Fix:** Type against Prisma's generated input type:

```typescript
import type { Prisma } from '@prisma/client';

const userUpdate: Prisma.UserUpdateInput = { firstName, lastName, email };
```

---

### T-08 | Untyped `catch` Blocks in API Routes

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Files** | `src/app/api/account/create-user/route.ts:63`, `update-user/route.ts:270`, `delete-user/route.ts:57` |
| **Component** | Error handling |

**Current code:**

```typescript
} catch (e: any) {
```

**Fix:** Use `unknown` and narrow:

```typescript
} catch (e: unknown) {
  const message = e instanceof Error ? e.message : 'Unknown error';
  return NextResponse.json({ error: message }, { status: 500 });
}
```

---

### T-09 | Untyped `apps` Parameter in Seed File

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `prisma/seed.ts:141` |
| **Component** | Seed script |

**Current code:**

```typescript
// line 141
async function seedAppAccessRules(apps: any, tiers: Map<string, number>) {
```

**Fix:**

```typescript
import type { App } from '@prisma/client';

type SeedApps = { membershipDashboard: App; ixn: App; talent: App };

async function seedAppAccessRules(apps: SeedApps, tiers: Map<string, number>) {
```

---

### T-10 | Untyped `roleMap` in Seed File

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `prisma/seed.ts:192` |
| **Component** | Seed script |

**Current code:**

```typescript
const roleMap = new Map();
```

**Fix:**

```typescript
const roleMap = new Map<string, number>();
```

---

### T-11 | Potential Null Dereference on `organisationId` in Seed

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `prisma/seed.ts:271-272` |
| **Component** | Recruiter seeding |

**Current code:**

```typescript
// line 271
organisationId: org?.id || 1,
membershipTierId: (await prisma.membershipTier.findFirst())?.id || 1,
```

**Problem:** If no INDUSTRY organisation exists yet (e.g. fresh database, or seed order changes), `org?.id` is `undefined` and `|| 1` substitutes a hardcoded integer. Prisma FK fields on this schema use `String` (cuid) IDs, not integers — so `1` will cause a foreign key constraint violation at runtime.

**Fix:**

```typescript
if (!org) throw new Error('No INDUSTRY organisation found — run member seeding first.');
const defaultTier = await prisma.membershipTier.findFirst();
if (!defaultTier) throw new Error('No membership tier found — run tier seeding first.');

// then use org.id and defaultTier.id directly
```

---

## 2. ENV / AZURE ISSUES

### E-01 | `NEXTAUTH_URL` Must Be Set to Azure VM Public URL

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `.env.example:7` |
| **Component** | NextAuth runtime config |

**Problem:** `NEXTAUTH_URL` defaults to `http://localhost:3000`. On an Azure VM, NextAuth uses this to construct callback URLs, CSRF token origins, and redirect URIs. If it remains `localhost`, sign-in will fail with CSRF mismatch errors — the browser sends requests to the public IP/domain, but NextAuth expects `localhost`.

**Fix:** In the Azure VM `.env`:

```
NEXTAUTH_URL="https://your-azure-domain.com"
```

This is a runtime variable — it does not need to be present at build time, but must be set before `next start`.

---

### E-02 | `NEXTAUTH_SECRET` Must Be a Strong Production Value

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `.env.example:6` |
| **Component** | JWT signing |

**Problem:** The placeholder `"your-super-secret-string-here"` must never reach production. NextAuth uses this to sign JWTs — a weak or default secret means session tokens can be forged.

**Fix:** Generate a cryptographically random secret on the Azure VM:

```bash
openssl rand -base64 32
```

Set the result in `.env`:

```
NEXTAUTH_SECRET="<output-from-openssl>"
```

---

### E-03 | No Build-Time Env Validation

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | No file — missing entirely |
| **Component** | Build pipeline |

**Problem:** There is no validation that required environment variables exist at build or startup time. If `DATABASE_URL` is missing, the app starts but crashes on the first Prisma call with an opaque connection error. If `NEXTAUTH_SECRET` is missing, NextAuth throws at runtime.

**Fix:** Add a validation module that runs at import time. Example using a lightweight check:

```typescript
// src/lib/env.ts  (NEW FILE)
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  DATABASE_URL: requireEnv('DATABASE_URL'),
  NEXTAUTH_SECRET: requireEnv('NEXTAUTH_SECRET'),
  NEXTAUTH_URL: requireEnv('NEXTAUTH_URL'),
} as const;
```

Import this in `src/lib/prisma.ts` and `src/lib/auth.ts` so the app fails fast with a clear message.

---

### E-04 | `DATABASE_URL` Logs to Console in Seed Script

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `prisma/seed.ts:290` |
| **Component** | Seed script |

**Current code:**

```typescript
console.log('DATABASE_URL =', process.env.DATABASE_URL);
```

**Problem:** This prints the full connection string (including credentials) to stdout. On Azure, stdout may be captured by logging services (Application Insights, Log Analytics). This is a credential leak risk.

**Fix:** Remove or redact:

```typescript
console.log('DATABASE_URL =', process.env.DATABASE_URL ? '[SET]' : '[MISSING]');
```

---

## 3. BUILD RELIABILITY

### B-01 | Missing `output: "standalone"` in next.config.ts

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `next.config.ts:3-5` |
| **Component** | Next.js build output |

**Current code:**

```typescript
const nextConfig: NextConfig = {
  /* config options here */
};
```

**Problem:** Without `output: "standalone"`, `npm run build` produces a build that requires the full `node_modules/` directory at runtime. On an Azure VM, this means either copying the entire `node_modules/` (bloated, slow deploys) or running `npm install --production` on the VM (fragile, requires build tools on prod).

**Fix:**

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
};
```

**Tradeoff:** Standalone output bundles the Node.js server into `.next/standalone/` (~50-80MB vs ~500MB+ with full node_modules). However:
- Static assets (`public/` and `.next/static/`) are NOT included — they must be copied manually or served via nginx/Azure CDN. Your deploy script needs: `cp -r public .next/standalone/public && cp -r .next/static .next/standalone/.next/static`
- The standalone server runs as `node .next/standalone/server.js` instead of `next start`
- Hot module replacement is not available (production only)
- If you add native Node modules later (e.g. `sharp` for image optimisation), they must be compatible with the Azure VM's OS/arch

---

### B-02 | Missing `postinstall` Script for Prisma Client Generation

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `package.json:6-11` |
| **Component** | Build pipeline |

**Current code:**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

**Problem:** `@prisma/client` ships as a stub — the actual typed client is generated by `prisma generate` based on your `schema.prisma`. Locally this works because `prisma migrate dev` auto-runs generate. On Azure, `npm install` does NOT run `prisma generate`, so the build imports a stub with no models. `npm run build` fails with errors like `Property 'user' does not exist on type 'PrismaClient'`.

**Fix:**

```json
"scripts": {
  "dev": "next dev",
  "build": "prisma generate && next build",
  "start": "next start",
  "lint": "eslint",
  "postinstall": "prisma generate"
}
```

The `postinstall` hook covers `npm install` on the VM. The `prisma generate` prefix on `build` is a belt-and-suspenders guard for CI environments that skip postinstall (e.g. `npm ci --ignore-scripts`).

**Ref:** [Prisma + Next.js best practices](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices)

---

### B-03 | `tsconfig.json` Path Aliases May Not Resolve in Standalone Build

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `tsconfig.json:22-33` |
| **Component** | TypeScript path resolution |

**Current config:**

```json
"paths": {
  "@/*": ["*"],
  "components/*": ["lib/mantis/components/*"],
  "utils/*": ["lib/mantis/utils/*"],
  "types/*": ["lib/mantis/types/*"],
  "hooks/*": ["lib/mantis/hooks/*"],
  "contexts/*": ["lib/mantis/contexts/*"],
  "data/*": ["lib/mantis/data/*"],
  "pages/*": ["lib/mantis/pages/*"],
  "routes/*": ["lib/mantis/routes/*"],
  "config": ["lib/mantis/config"]
}
```

**Problem:** The `@/*` alias is handled by Next.js automatically. But the bare aliases (`components/*`, `utils/*`, etc.) rely on `baseUrl: "./src"` and are Mantis template leftovers. Next.js resolves `@/*` via its own webpack/turbopack config, but these bare aliases may not resolve identically in standalone output if any import uses them outside the Mantis template code. Verify that no project-level (non-Mantis) code imports via these bare paths.

**Fix:** Audit imports. If no project code uses the bare aliases, they're harmless but noisy. If any do, convert them to `@/lib/mantis/...` imports for consistency.

---

### B-04 | No `.nvmrc` or `engines` Field

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `package.json` (missing field) |
| **Component** | Node.js version pinning |

**Problem:** Next.js 16 requires Node.js >= 18.18.0. Azure VMs may have an older system Node. Without an explicit version constraint, `npm install` and `npm run build` may succeed on an incompatible version but produce subtle runtime errors.

**Fix:** Add to `package.json`:

```json
"engines": {
  "node": ">=18.18.0"
}
```

And create `.nvmrc` at repo root:

```
20
```

---

### B-05 | `prisma` Listed Only as DevDependency

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `package.json:50` |
| **Component** | Prisma CLI availability |

**Current:** `"prisma": "^6.19.0"` is in `devDependencies` only.

**Problem:** If the Azure VM runs `npm install --production` (or `npm ci --omit=dev`), the `prisma` CLI won't be available. The `postinstall` script from B-02 (`prisma generate`) will fail because it invokes the CLI.

**Fix:** Either:
- **(Recommended)** Run `npm ci` (with devDeps) during the build phase on Azure, then deploy only `.next/standalone/` — devDeps are not needed at runtime with standalone output.
- Or move `prisma` to `dependencies` (less clean, but works if build and runtime share a single `npm install`).

The recommended approach pairs naturally with B-01 (standalone output): build with full deps, deploy only the standalone folder.

---

### B-06 | `@types/bcryptjs` in Dependencies Instead of DevDependencies

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `package.json:23` |
| **Component** | Package organisation |

**Current:** `"@types/bcryptjs": "^2.4.6"` is in `dependencies`.

**Fix:** Move to `devDependencies` — type packages are only needed at build time:

```json
"devDependencies": {
  "@types/bcryptjs": "^2.4.6",
  ...
}
```

---

### B-07 | `PrismaAdapter` Type Mismatch with NextAuth v4

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `src/lib/auth.ts:3, 9` |
| **Component** | Auth adapter |

**Current code:**

```typescript
import { PrismaAdapter } from "@auth/prisma-adapter";
// ...
adapter: PrismaAdapter(prisma),
```

**Problem:** `@auth/prisma-adapter` v2.x is designed for Auth.js v5 (NextAuth v5). This project uses NextAuth v4 (`next-auth@4.24.13`). The adapter works at runtime because the interface is backward-compatible, but TypeScript may flag a type incompatibility between `@auth/prisma-adapter`'s `Adapter` type and NextAuth v4's expected `Adapter` type during strict builds. This manifests as:

```
Type 'Adapter' is not assignable to type 'Adapter | undefined'.
```

**Fix:** Either:
- **(Quick)** Add a type assertion: `adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],`
- **(Proper)** Downgrade to `@next-auth/prisma-adapter` (the v4-compatible package) instead of `@auth/prisma-adapter`.

---

## 4. ISSUE SUMMARY TABLE

| ID | Severity | File | Component | One-Line Description |
|----|----------|------|-----------|---------------------|
| T-01 | Critical | `src/lib/mantis/types/next-auth.d.ts` | NextAuth types | Session type augmentation incomplete — missing roleKeys, id, tier fields |
| T-02 | Medium | `src/lib/auth.ts` | Auth callbacks | 7x `as any` casts on user/token/session in JWT and session callbacks |
| T-03 | Medium | 7 page files (see section) | Server components | `(session.user as any)` pattern across all page-level session access |
| T-04 | Medium | 6 API route files (see section) | API routes | `session?.user as any \| undefined` pattern in all account routes |
| T-05 | Medium | 6 standalone/account pages | Student pages | Same `as any` pattern in standalone talent discovery pages |
| T-06 | Low | `student-skills-experience/page.tsx` | Data mappers | `exp: any` and `project: any` function parameters |
| T-07 | Medium | `update-user/route.ts` | User update API | `const userUpdate: any = {...}` bypasses Prisma input types |
| T-08 | Low | 3 API routes | Error handling | `catch (e: any)` instead of `catch (e: unknown)` |
| T-09 | Low | `prisma/seed.ts` | Seed script | `apps: any` parameter in seedAppAccessRules |
| T-10 | Low | `prisma/seed.ts` | Seed script | Untyped `new Map()` for roleMap |
| T-11 | High | `prisma/seed.ts` | Seed script | Hardcoded `\|\| 1` fallback on FK fields that use String IDs |
| E-01 | Critical | `.env.example` | NextAuth config | NEXTAUTH_URL must be set to Azure VM public URL |
| E-02 | Critical | `.env.example` | JWT signing | NEXTAUTH_SECRET must be cryptographically random in production |
| E-03 | High | (missing file) | Build pipeline | No build-time env validation — missing vars cause opaque runtime errors |
| E-04 | Medium | `prisma/seed.ts` | Seed script | DATABASE_URL printed to stdout with credentials |
| B-01 | Critical | `next.config.ts` | Build output | Missing `output: "standalone"` for Azure VM deployment |
| B-02 | Critical | `package.json` | Build pipeline | No `postinstall` or `prisma generate` in build — Prisma client is a stub |
| B-03 | Medium | `tsconfig.json` | Path aliases | Bare Mantis aliases may not resolve in standalone build |
| B-04 | Medium | `package.json` | Node version | No `engines` field or `.nvmrc` — Azure VM may use incompatible Node |
| B-05 | High | `package.json` | Prisma CLI | `prisma` in devDependencies only — `postinstall` fails in prod-only installs |
| B-06 | Low | `package.json` | Package hygiene | `@types/bcryptjs` in dependencies instead of devDependencies |
| B-07 | High | `src/lib/auth.ts` | Auth adapter | `@auth/prisma-adapter` v2 targets Auth.js v5, may fail type check with NextAuth v4 |

---

## 5. RECOMMENDED FIX ORDER

This is the dependency-aware order. Items marked with arrows depend on the preceding item.

1. **B-01** — Add `output: "standalone"` to `next.config.ts`
2. **B-02** — Add `postinstall` and update `build` script in `package.json`
3. **T-01** — Create `src/types/next-auth.d.ts`, delete Mantis template version
4. **T-02** -> T-01 — Remove `as any` from `src/lib/auth.ts` callbacks
5. **T-03, T-04, T-05** -> T-01 — Remove `as any` from all pages and API routes (batch job)
6. **B-07** — Fix PrismaAdapter type mismatch
7. **E-01, E-02** — Set production env vars on Azure VM
8. **E-03** — Add `src/lib/env.ts` validation module
9. **B-05** — Ensure Prisma CLI available during build (pair with B-02 approach)
10. **T-11** — Fix hardcoded FK fallback in seed
11. **E-04** — Redact DATABASE_URL from seed console output
12. **B-04** — Add `engines` field and `.nvmrc`
13. **T-06, T-07, T-08, T-09, T-10, B-03, B-06** — Remaining low/medium cleanup

---

## 6. TOTAL `as any` AUDIT

**37 instances** across 22 files. Breakdown:

| Category | Count | Root Cause |
|----------|-------|------------|
| `session.user as any` (pages + API routes) | 24 | T-01 missing type augmentation |
| `token as any` (auth callbacks) | 3 | T-01 missing JWT augmentation |
| `user as any` (auth callbacks + Header) | 3 | T-01 missing User augmentation |
| `catch (e: any)` | 3 | T-08 TypeScript convention |
| Function param `: any` | 3 | T-06, T-09 missing types |
| Object literal `: any` | 1 | T-07 Prisma input type |

**27 of 37 (73%) are eliminated by fixing T-01 alone.** This makes the NextAuth type augmentation the single highest-leverage fix in this report.
