import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { redirect } from "next/navigation";
import { userCanAccessApp } from "@/lib/access-control";

export default async function TalentDiscoveryStandaloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Get the currently logged-in user
  const session = await getServerAuthSession();
  const userId = session?.user?.id as string | undefined;

  // If not logged in, redirect to the sign-in page
  if (!userId) {
    redirect("/sign-in");
  }

  // 2. Check the user's suspension/ban status for "TALENT_DISCOVERY"
  const canAccess = await userCanAccessApp(userId, "TALENT_DISCOVERY");

  // If suspended/banned, redirect to the access denied page
  if (!canAccess) {
    redirect("/access-denied?reason=access-denied&appKey=TALENT_DISCOVERY");
  }

  // 3. All checks passed, allow access! Render the specific page in this directory
  return <>{children}</>;
}