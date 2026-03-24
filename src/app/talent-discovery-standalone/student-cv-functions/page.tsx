import { Box } from "@mui/material";
import StudentSideBar from "@/components/talent-discovery/student-components/StudentSideBar";
import DashboardTopBar from "@/components/talent-discovery/student-components/StudentTopNavBar";
import StudentCVUploadCard from "@/components/talent-discovery/student-components/StudentCVUploadCard";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { redirect } from "next/navigation";

export default async function StudentCVFunctionsPage() {
  const session = await getServerAuthSession();
  const sessionUser = session?.user as any | undefined;
  if (!sessionUser?.id) {
    redirect("/sign-in");
  }
  const userId = sessionUser.id as string;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <StudentSideBar />

      <Box sx={{ flexGrow: 1, bgcolor: "#fafafb", minWidth: 0 }}>
        <DashboardTopBar title="Student CV Management" />

        <Box
          sx={{
            p: 3,
            maxWidth: 1200,
            width: "100%",
            mx: "auto",
          }}
        >
          <StudentCVUploadCard userId={userId} />
        </Box>
      </Box>
    </Box>
  );
}
