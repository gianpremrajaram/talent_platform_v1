// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email.trim().toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            roles: {
              include: { role: true },
            },
            memberships: {
              where: { isActive: true },
              include: {
                membershipTier: true,
              },
            },
          },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );

        if (!passwordValid) {
          throw new Error("Invalid email or password");
        }

        const roleKeys = user.roles.map((ur) => ur.role.key);

        // Choose "highest" membership tier by rank if multiple
        const activeMemberships = user.memberships.filter((m) => m.isActive);
        let membershipTierKey: string | null = null;
        let membershipTierRank: number | null = null;

        if (activeMemberships.length > 0) {
          const highest = activeMemberships.reduce((best, current) => {
            if (!best) return current;
            return current.membershipTier.rank > best.membershipTier.rank
              ? current
              : best;
          }, activeMemberships[0]);

          membershipTierKey = highest.membershipTier.key;
          membershipTierRank = highest.membershipTier.rank;
        }

        // This object is what flows into the jwt callback as `user`
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          roleKeys,
          membershipTierKey,
          membershipTierRank,
        };
      },
    }),
    // ✅ UCL provider is a separate provider
    {
      id: "ucl",
      name: "UCL",
      type: "oauth",

      clientId: process.env.UCL_API_CLIENT_ID!,
      clientSecret: process.env.UCL_API_CLIENT_SECRET!,

      authorization: {
        url: "https://uclapi.com/oauth/authorise",
        params: { scope: "basic" },
      },

      token: "https://uclapi.com/oauth/token",

      userinfo: "https://uclapi.com/oauth/user/data",

      profile(profile: any) {
        return {
          id: profile.upi,
          email: profile.email,
          name: profile.name,
        };
      },
    },
  ],

  pages: {
    signIn: "/sign-in",
  },

  callbacks: {

      async signIn({ user, account }) {
    // Only handle UCL login
    if (account?.provider === "ucl") {
      console.log("UCL LOGIN:", user.email);
      const email = user.email?.toLowerCase();

      if (!email) return false;

      const dbUser = await prisma.user.findUnique({
        where: { email },
        include: {
          roles: { include: { role: true } },
          memberships: {
            where: { isActive: true },
            include: { membershipTier: true },
          },
        },
      });

      let roleKeys: string[] = [];
      let membershipTierKey: string | null = null;
      let membershipTierRank: number | null = null;

      if (dbUser) {
        // Existing seeded user
        roleKeys = dbUser.roles.map((r) => r.role.key);

        if (dbUser.memberships.length > 0) {
          const highest = dbUser.memberships.reduce((best, current) => {
            if (!best) return current;
            return current.membershipTier.rank > best.membershipTier.rank
              ? current
              : best;
          }, dbUser.memberships[0]);

          membershipTierKey = highest.membershipTier.key;
          membershipTierRank = highest.membershipTier.rank;
        }

        user.id = dbUser.id;
      } else {
        // First-time UCL login → create student
        const studentRole = await prisma.role.findUnique({
          where: { key: "STUDENT" },
        });

        const newUser = await prisma.user.create({
          data: {
            email,
            firstName: user.name ?? "UCL",
            lastName: "User",
            passwordHash: "123", // No password since they log in via UCL
            roles: {
              create: { roleId: studentRole!.id },
            },
          },
        });

        roleKeys = ["STUDENT"];
        user.id = newUser.id;
      }

      // Inject into JWT pipeline
      (user as any).roleKeys = roleKeys;
      (user as any).membershipTierKey = membershipTierKey;
      (user as any).membershipTierRank = membershipTierRank;
    }

    return true;
  },

    async jwt({ token, user }) {
      if (user) {
        // Basic identity
        token.id = (user as any).id;
        token.name = user.name;
        token.email = user.email;

        // Roles & membership tier
        token.roleKeys = (user as any).roleKeys ?? [];
        token.membershipTierKey = (user as any).membershipTierKey ?? null;
        token.membershipTierRank = (user as any).membershipTierRank ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        (session.user as any).roleKeys = (token as any).roleKeys ?? [];
        (session.user as any).membershipTierKey =
          (token as any).membershipTierKey ?? null;
        (session.user as any).membershipTierRank =
          (token as any).membershipTierRank ?? null;
      }
      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",
};
