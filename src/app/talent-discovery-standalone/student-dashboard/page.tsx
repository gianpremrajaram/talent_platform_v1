import { Box, Typography } from "@mui/material";
import StudentSideBar from "@/components/talent-discovery/student-components/StudentSideBar";
import DashboardTopBar from "@/components/talent-discovery/student-components/StudentTopNavBar";
import DashboardStatsRow from "@/components/talent-discovery/student-components/StatisticsCardRow";
import JobOpeningsTable from "@/components/talent-discovery/student-components/JobOpeningsTable";

export default function StudentDashboardPage() {
  const stats = [
    {
      title: "Total CV views",
      value: 247,
      subtitle: "+12% from last month",
      subtitleColor: "success.main",
    },
    {
      title: "Your profile score",
      value: "85%",
      subtitle: "Complete your profile!",
    },
    {
      title: "CVs Uploaded",
      value: 3,
      subtitle: "Last updated 2 days ago",
    },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <StudentSideBar />
      <Box sx={{ flexGrow: 1, bgcolor: "#fafafb" }}>
        <DashboardTopBar title="Student Dashboard" />
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Current Job Openings
          </Typography>
          <DashboardStatsRow items={stats} />
          <JobOpeningsTable />
        </Box>
      </Box>
    </Box>
  );
}
