// src/app/talent-discovery/page.tsx
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import {
  userCanAccessApp,
  userCanAccessFeature,
} from "@/lib/access-control";
import SignInForm from "@/components/SignInForm";
import { pageCopy } from "@/content/pageCopy";

import TalentDiscoveryPartnerJobBoardView from "@/components/talent-discovery/PartnerJobBoardView";
import TalentDiscoveryPartnerFullView from "@/components/talent-discovery/PartnerFullView";

export const dynamic = "force-dynamic";

type SearchParamsObject = {
  [key: string]: string | string[] | undefined;
};

type TalentDiscoveryPageProps = {
  searchParams: Promise<SearchParamsObject>;
};

function getFirst(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function TalentDiscoveryPage({
  searchParams,
}: TalentDiscoveryPageProps) {
  const sp = await searchParams;
  const view = getFirst(sp.view) ?? "default"; // "student" | "job-board" | "cv-library" | "default"

  const copy = pageCopy.talentDiscovery;
  const session = await getServerAuthSession();

  // 1) Not signed in → public description + sign-in form
  if (!session || !session.user) {
    const redirectSuffix = view !== "default" ? `?view=${view}` : "";
    const defaultRedirect = `/talent-discovery${redirectSuffix}`;

    return (
      <section className="content-section">
        <header className="content-header">
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </header>

        {copy.unauthenticatedIntro && <p>{copy.unauthenticatedIntro}</p>}

        <SignInForm defaultRedirect={defaultRedirect} />
      </section>
    );
  }

  // 2) Extract user info from the session
  const user = session.user;
  const userId = user.id;
  const roleKeys: string[] = user.roleKeys ?? [];

  const hasStudentRole = roleKeys.includes("STUDENT");
  const hasAdminRole = roleKeys.includes("ADMIN");

  // 3) Student view: only STUDENT or ADMIN
  if (view === "student") {
    if (!hasStudentRole && !hasAdminRole) {
      redirect(
        "/access-denied?reason=student-view-role&appKey=TALENT_DISCOVERY",
      );
    }
    redirect("/talent-discovery-standalone/student-dashboard");
  }

  // 4) App-level gate for partner views. Defence-in-depth: DB-backed check
  //    via userCanAccessApp. Admin bypass is handled inside that function.
  if (!hasAdminRole) {
    const canAccessApp = await userCanAccessApp(userId, "TALENT_DISCOVERY");
    if (!canAccessApp) {
      redirect("/access-denied?reason=access-denied&appKey=TALENT_DISCOVERY");
    }
  }

  // 5) CV Library entry: requires Gold+ (via feature config)
  if (view === "cv-library") {
    const canAccess = await userCanAccessFeature(userId, "cv-library");
    if (!canAccess) {
      redirect(
        "/access-denied?reason=cv-library-tier&appKey=TALENT_DISCOVERY",
      );
    }

    return (
      <TalentDiscoveryPartnerFullView
        title={copy.title}
        description={copy.description}
      />
    );
  }

  // 6) Job board or default entry for partners. Uses centralised feature
  //    config for tier routing.
  if (hasAdminRole) {
    return (
      <TalentDiscoveryPartnerFullView
        title={copy.title}
        description={copy.description}
      />
    );
  }

  // Silver and above: full partner view with tabbed Job Board, Talent Search,
  // and Recommended Students. Each tab is independently TierGate-wrapped, and
  // the backing API routes re-check permissions server-side.
  const canAccessTalentSearch = await userCanAccessFeature(userId, "talent-search");
  if (canAccessTalentSearch) {
    return (
      <TalentDiscoveryPartnerFullView
        title={copy.title}
        description={copy.description}
      />
    );
  }

  // Bronze: job board only (no talent-search permission).
  const canAccessJobBoard = await userCanAccessFeature(
    userId,
    "job-board-browse",
  );
  if (canAccessJobBoard) {
    return (
      <TalentDiscoveryPartnerJobBoardView
        title={copy.title}
        description={copy.description}
      />
    );
  }

  // 7) Fallback: should rarely be reached (middleware catches most cases).
  redirect("/access-denied?reason=access-denied&appKey=TALENT_DISCOVERY");
}
