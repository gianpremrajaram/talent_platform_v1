import { Box } from "@mui/material";
import StudentPortalShell from "@/components/talent-discovery/student-components/StudentPortalShell";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { redirect } from "next/navigation";
import AccountManagement from "@/components/talent-discovery/student-components/SecutiySettingsPage";

export default async function StudentSecuritySettingsPage() {
  const session = await getServerAuthSession();
  const sessionUser = session?.user;
  if (!sessionUser?.id) {
    redirect("/sign-in");
  }
  const userId = sessionUser.id;
  const email = sessionUser.email ?? "";

  return (
    <StudentPortalShell
      title="Security Settings"
      userInitial={sessionUser.name?.charAt(0).toUpperCase() ?? ""}
    >
      <Box sx={{ p: 3 }}>
        <AccountManagement userId={userId} email={email} />
      </Box>
    </StudentPortalShell>
  );
}
