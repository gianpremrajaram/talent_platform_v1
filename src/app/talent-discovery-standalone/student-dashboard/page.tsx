import { Box, Divider, Typography } from "@mui/material";
import StudentSideBar from "@/components/talent-discovery/student-components/StudentSideBar";
import DashboardTopBar from "@/components/talent-discovery/student-components/StudentTopNavBar";
import StatisticsCard from "@/components/talent-discovery/student-components/StatisticsCard";
import JobOpeningsTable from "@/components/talent-discovery/student-components/JobOpeningsTable";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { getStudentCVs } from "@/lib/services/student-services";
import { redirect } from "next/navigation";

export default async function StudentDashboardPage() {
  const session = await getServerAuthSession();
  const sessionUser = session?.user;
  if (!sessionUser?.id) redirect("/sign-in");

  const cvs = await getStudentCVs(sessionUser.id);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <StudentSideBar />
      <Box sx={{ flexGrow: 1, bgcolor: "#fafafb" }}>
        <DashboardTopBar title="Student Dashboard" />
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Current Job Openings
          </Typography>
          <Box sx={{ maxWidth: 280, mb: 3 }}>
            <StatisticsCard
              title="CVs Uploaded"
              value={cvs.length}
              subtitle="Manage your CVs in the CV Library"
            />
          </Box>
          <Divider sx={{ mb: 3 }} />
          {/* render the job table */}
          <JobOpeningsTable />
        </Box>
      </Box>
    </Box>
  );
}
