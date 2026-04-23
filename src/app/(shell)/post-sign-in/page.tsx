// src/app/post-sign-in/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { prisma } from "@/lib/prisma";

function appKeyToPath(appKey: string): string | null {
  switch (appKey) {
    case "MEMBERSHIP_DASHBOARD":
      return "/membership-dashboard";
    case "IXN_WORKFLOW_MANAGER":
      return "/ixn-workflow-manager";
    case "TALENT_DISCOVERY":
      return "/talent-discovery";
    default:
      return null;
  }
}

export default async function PostSignInRouterPage() {
  noStore();

  const session = await getServerAuthSession();

  if (!session?.user) redirect("/");

  const roleKeys: string[] = session.user.roleKeys ?? [];
  const isAdmin = roleKeys.includes("ADMIN");
  const isStudent = roleKeys.includes("STUDENT");

  // Admin always lands on membership dashboard (admin view handled inside that page)
  if (isAdmin) {
    redirect("/membership-dashboard");
  }

  // Student always lands on their standalone dashboard
  if (isStudent) {
    redirect("/talent-discovery-standalone/student-dashboard");
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      userStatus: true,
      defaultApp: { select: { key: true } },
    },
  });

  // Pending recruiters are blocked until admin approves them
  if (user?.userStatus === "PENDING_APPROVAL") {
    redirect("/register/pending");
  }

  const defaultAppKey = user?.defaultApp?.key ?? null;
  if (!defaultAppKey) redirect("/");

  const basePath = appKeyToPath(defaultAppKey);
  if (!basePath) redirect("/");

  // Role-aware entry points for Talent Discovery
  // Students are handled earlier with a hard-coded redirect to their standalone dashboard.
  if (defaultAppKey === "TALENT_DISCOVERY") {
    redirect("/talent-discovery?view=job-board");
  }

  redirect(basePath);
}
