import { Box } from "@mui/material";
import StudentSideBar from "@/components/talent-discovery/student-components/StudentSideBar";
import DashboardTopBar from "@/components/talent-discovery/student-components/StudentTopNavBar";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { redirect } from "next/navigation";
import AccountManagement from "@/components/talent-discovery/student-components/SecutiySettingsPage";
export default async function StudentCVFunctionsPage() {
  const session = await getServerAuthSession();
  const sessionUser = session?.user as any | undefined;
  if (!sessionUser?.id) {
    redirect("/sign-in");
  }
  const userId = sessionUser.id as string;
  const email = sessionUser.email as string;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <StudentSideBar />

      <Box sx={{ flexGrow: 1, bgcolor: "#fafafb", minWidth: 0 }}>
        <DashboardTopBar title="Student Security Settings" />

        <Box
          sx={{
            p: 3,
          }}
        >
          <AccountManagement userId={userId} email={email} />
        </Box>
      </Box>
    </Box>
  );
}
