import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { redirect } from "next/navigation";
import { userCanAccessApp } from "@/lib/access-control";
import MuiThemeProvider from "@/components/MuiThemeProvider";

export default async function TalentDiscoveryStandaloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Get the currently logged-in user
  const session = await getServerAuthSession();
  const userId = (session?.user as { id?: string })?.id;

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

  // 3. Wrap with MUI theme so all student portal pages share the same
  //    design system (UCL colours, typography, component styles).
  //    SessionProvider is not needed here — student components receive session
  //    data as server-fetched props rather than using useSession().
  return <MuiThemeProvider>{children}</MuiThemeProvider>;
}
