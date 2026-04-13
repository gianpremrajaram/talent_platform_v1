// src/types/next-auth.d.ts
// Module augmentation for NextAuth v4 — adds custom session fields
// used across the platform (roleKeys, membershipTier*, id).

import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roleKeys: string[];
      membershipTierKey: string | null;
      membershipTierRank: number | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    roleKeys?: string[];
    membershipTierKey?: string | null;
    membershipTierRank?: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    roleKeys: string[];
    membershipTierKey: string | null;
    membershipTierRank: number | null;
  }
}
