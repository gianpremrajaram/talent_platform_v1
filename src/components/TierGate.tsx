'use client';

import { useSession } from 'next-auth/react';
import type { ReactNode } from 'react';

// Canonical tier rank lookup — matches MembershipTier rows seeded in prisma/seed.ts
const TIER_RANK_MAP: Record<string, number> = {
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
};

export interface TierGateProps {
  children: ReactNode;
  /** Minimum tier key required (e.g. "GOLD"). Compared via rank integer. */
  requiredTier?: string;
  /** Role key(s) that grant access (e.g. "STUDENT" or ["STUDENT", "RECRUITER"]). */
  requiredRole?: string | string[];
  /**
   * When true, BOTH tier AND role must pass.
   * When false (default), EITHER passing grants access.
   */
  requireAll?: boolean;
  /** Optional fallback UI when access is denied. Defaults to null (hidden). */
  fallback?: ReactNode;
}

export default function TierGate({
  children,
  requiredTier,
  requiredRole,
  requireAll = false,
  fallback = null,
}: TierGateProps) {
  const { data: session, status } = useSession();

  // Dev bypass — always render children when enabled
  if (process.env.NEXT_PUBLIC_TIER_GATE_BYPASS === 'true') {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[TierGate] Bypass active — all gates are open');
    }
    return <>{children}</>;
  }

  // While session is loading, render nothing to prevent flash of gated content
  if (status === 'loading') {
    return null;
  }

  // No session → deny
  if (!session?.user) {
    return <>{fallback}</>;
  }

  const user = session.user as any;
  const roleKeys: string[] = user.roleKeys ?? [];
  const userTierRank: number | null = user.membershipTierRank ?? null;

  // ADMIN bypass — admins see everything regardless of tier or role props
  if (roleKeys.includes('ADMIN')) {
    return <>{children}</>;
  }

  // No gate props set → render children (no restriction)
  if (!requiredTier && !requiredRole) {
    return <>{children}</>;
  }

  // Evaluate tier check
  let tierPasses = false;
  if (requiredTier) {
    const minRank = TIER_RANK_MAP[requiredTier.toUpperCase()];
    if (minRank != null && userTierRank != null) {
      tierPasses = userTierRank >= minRank;
    }
    // userTierRank is null (STUDENT case) → tierPasses stays false
  }

  // Evaluate role check
  let rolePasses = false;
  if (requiredRole) {
    const required = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    rolePasses = required.some((r) => roleKeys.includes(r));
  }

  // Apply logic
  let granted: boolean;
  if (requiredTier && requiredRole) {
    granted = requireAll ? tierPasses && rolePasses : tierPasses || rolePasses;
  } else if (requiredTier) {
    granted = tierPasses;
  } else {
    granted = rolePasses;
  }

  return granted ? <>{children}</> : <>{fallback}</>;
}
