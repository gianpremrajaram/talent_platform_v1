import { Box } from "@mui/material";
import StudentSideBar from "@/components/talent-discovery/student-components/StudentSideBar";
import DashboardTopBar from "@/components/talent-discovery/student-components/StudentTopNavBar";

export default function StudentDashboardPage() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <StudentSideBar />

      {/* Right side content */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Navigation */}
        <DashboardTopBar title="Student Dashboard" />

        {/* Page Content */}
        <Box sx={{ p: 3 }}>Page content goes here</Box>
      </Box>
    </Box>
  );
}
