import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// ─────────────────────────────────────────────
// Route protection config
// ─────────────────────────────────────────────

type RouteRule = {
  /** Minimum tier rank required. null = no tier requirement. */
  minTierRank: number | null;
  /** Roles that grant access regardless of tier. ADMIN is always implicit. */
  allowedRoles: string[];
  /** Denial reason code for the access-denied page. */
  denyReason: string;
};

// Talent discovery sub-view rules (matched by ?view= query param)
const TALENT_DISCOVERY_VIEW_RULES: Record<string, RouteRule> = {
  student: {
    minTierRank: null,
    allowedRoles: ['STUDENT'],
    denyReason: 'student-view-role',
  },
  'cv-library': {
    minTierRank: 3, // GOLD
    allowedRoles: [],
    denyReason: 'cv-library-tier',
  },
  'job-board': {
    minTierRank: 2, // SILVER
    allowedRoles: ['STUDENT'],
    denyReason: 'middleware-job-board',
  },
};

// Static route rules (matched by pathname)
const STATIC_ROUTE_RULES: Record<string, RouteRule> = {
  '/account/add-user': {
    minTierRank: null,
    allowedRoles: ['ADMIN'],
    denyReason: 'middleware-admin-only',
  },
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function checkAccess(
  roleKeys: string[],
  tierRank: number | null,
  rule: RouteRule,
): boolean {
  // ADMIN always passes
  if (roleKeys.includes('ADMIN')) return true;

  // Check allowed roles
  const rolePasses = rule.allowedRoles.length > 0
    && rule.allowedRoles.some((r) => roleKeys.includes(r));

  // Check tier rank
  const tierPasses = rule.minTierRank != null
    && tierRank != null
    && tierRank >= rule.minTierRank;

  // Either passing grants access (OR logic)
  return rolePasses || tierPasses;
}

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({ req: request });

  // ── Not authenticated → redirect to sign-in ──
  if (!token) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }

  const roleKeys = (token.roleKeys as string[]) ?? [];
  const tierRank = (token.membershipTierRank as number | null) ?? null;

  // ── Static route rules ──
  const staticRule = STATIC_ROUTE_RULES[pathname];
  if (staticRule) {
    if (!checkAccess(roleKeys, tierRank, staticRule)) {
      const denyUrl = new URL('/access-denied', request.url);
      denyUrl.searchParams.set('reason', staticRule.denyReason);
      return NextResponse.redirect(denyUrl);
    }
    return NextResponse.next();
  }

  // ── Talent discovery view-specific rules ──
  if (
    pathname === '/talent-discovery'
    || pathname.startsWith('/talent-discovery/')
    || pathname.startsWith('/talent-discovery-standalone/')
  ) {
    const view = request.nextUrl.searchParams.get('view');

    if (view && TALENT_DISCOVERY_VIEW_RULES[view]) {
      const rule = TALENT_DISCOVERY_VIEW_RULES[view];
      if (!checkAccess(roleKeys, tierRank, rule)) {
        const denyUrl = new URL('/access-denied', request.url);
        denyUrl.searchParams.set('reason', rule.denyReason);
        denyUrl.searchParams.set('appKey', 'TALENT_DISCOVERY');
        return NextResponse.redirect(denyUrl);
      }
    }

    // Base talent-discovery and standalone routes: authenticated is sufficient
    // (sub-view gating handled above, page-level defence-in-depth via userCanAccessApp)
    return NextResponse.next();
  }

  // ── API account routes and other matched routes: authenticated is sufficient ──
  return NextResponse.next();
}

// ─────────────────────────────────────────────
// Matcher — only these URL patterns trigger middleware
// ─────────────────────────────────────────────

export const config = {
  matcher: [
    '/talent-discovery/:path*',
    '/talent-discovery-standalone/:path*',
    '/membership-dashboard/:path*',
    '/account/:path*',
    '/api/account/:path*',
  ],
};
