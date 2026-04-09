import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_IDLE_TIMEOUT_SECONDS = Number(
  process.env.AUTH_IDLE_TIMEOUT_SECONDS ?? 60 * 30,
);
const LAST_ACTIVITY_COOKIE = "tp_last_activity";

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
    allowedRoles: ["STUDENT"],
    denyReason: "student-view-role",
  },
  "cv-library": {
    minTierRank: 3, // GOLD
    allowedRoles: [],
    denyReason: "cv-library-tier",
  },
  "job-board": {
    minTierRank: 2, // SILVER
    allowedRoles: ["STUDENT"],
    denyReason: "middleware-job-board",
  },
};

// Static route rules (matched by pathname)
const STATIC_ROUTE_RULES: Record<string, RouteRule> = {
  "/account/add-user": {
    minTierRank: null,
    allowedRoles: ["ADMIN"],
    denyReason: "middleware-admin-only",
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
  if (roleKeys.includes("ADMIN")) return true;

  // Check allowed roles
  const rolePasses =
    rule.allowedRoles.length > 0 &&
    rule.allowedRoles.some((r) => roleKeys.includes(r));

  // Check tier rank
  const tierPasses =
    rule.minTierRank != null &&
    tierRank != null &&
    tierRank >= rule.minTierRank;

  // Either passing grants access (OR logic)
  return rolePasses || tierPasses;
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function withRefreshedActivityCookie(response: NextResponse): NextResponse {
  response.cookies.set(LAST_ACTIVITY_COOKIE, String(nowSeconds()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_IDLE_TIMEOUT_SECONDS,
  });
  return response;
}

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isStandalonePath =
    pathname === "/talent-discovery-standalone" ||
    pathname.startsWith("/talent-discovery-standalone/");
  const isStandaloneHeartbeatPath =
    pathname === "/api/account/session-activity";
  const isStandaloneTimeoutScope =
    isStandalonePath || isStandaloneHeartbeatPath;

  const token = await getToken({ req: request });

  // ── Not authenticated → redirect to sign-in ──
  if (!token) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }

  if (isStandaloneTimeoutScope) {
    const lastActivityRaw = request.cookies.get(LAST_ACTIVITY_COOKIE)?.value;
    const lastActivity = lastActivityRaw ? Number(lastActivityRaw) : null;

    if (lastActivity != null && Number.isFinite(lastActivity)) {
      const idleForSeconds = nowSeconds() - lastActivity;

      if (idleForSeconds > AUTH_IDLE_TIMEOUT_SECONDS) {
        const signInUrl = new URL("/sign-in", request.url);
        signInUrl.searchParams.set("reason", "idle-timeout");
        signInUrl.searchParams.set("callbackUrl", request.nextUrl.href);

        const response = NextResponse.redirect(signInUrl);

        response.cookies.delete(LAST_ACTIVITY_COOKIE);
        response.cookies.delete("next-auth.session-token");
        response.cookies.delete("__Secure-next-auth.session-token");

        return response;
      }
    }
  }

  const roleKeys = (token.roleKeys as string[]) ?? [];
  const tierRank = (token.membershipTierRank as number | null) ?? null;

  // ── Static route rules ──
  const staticRule = STATIC_ROUTE_RULES[pathname];
  if (staticRule) {
    if (!checkAccess(roleKeys, tierRank, staticRule)) {
      const denyUrl = new URL("/access-denied", request.url);
      denyUrl.searchParams.set("reason", staticRule.denyReason);
      return NextResponse.redirect(denyUrl);
    }
    return NextResponse.next();
  }

  // ── Talent discovery view-specific rules ──
  if (
    pathname === "/talent-discovery" ||
    pathname.startsWith("/talent-discovery/") ||
    pathname.startsWith("/talent-discovery-standalone/")
  ) {
    const view = request.nextUrl.searchParams.get("view");

    if (view && TALENT_DISCOVERY_VIEW_RULES[view]) {
      const rule = TALENT_DISCOVERY_VIEW_RULES[view];
      if (!checkAccess(roleKeys, tierRank, rule)) {
        const denyUrl = new URL("/access-denied", request.url);
        denyUrl.searchParams.set("reason", rule.denyReason);
        denyUrl.searchParams.set("appKey", "TALENT_DISCOVERY");
        return NextResponse.redirect(denyUrl);
      }
    }

    // Base talent-discovery and standalone routes: authenticated is sufficient
    // (sub-view gating handled above, page-level defence-in-depth via userCanAccessApp)
    if (isStandaloneTimeoutScope) {
      return withRefreshedActivityCookie(NextResponse.next());
    }
    return NextResponse.next();
  }

  // ── API account routes and other matched routes: authenticated is sufficient ──
  if (isStandaloneTimeoutScope) {
    return withRefreshedActivityCookie(NextResponse.next());
  }
  return NextResponse.next();
}

// ─────────────────────────────────────────────
// Matcher — only these URL patterns trigger middleware
// ─────────────────────────────────────────────

export const config = {
  matcher: [
    "/talent-discovery/:path*",
    "/talent-discovery-standalone/:path*",
    "/membership-dashboard/:path*",
    "/account/:path*",
    "/api/account/:path*",
  ],
};
