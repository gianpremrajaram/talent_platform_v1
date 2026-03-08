import { Box } from "@mui/material";
import StudentSideBar from "@/components/talent-discovery/student-components/StudentSideBar";
import DashboardTopBar from "@/components/talent-discovery/student-components/StudentTopNavBar";
import StudentCVUploadCard from "@/components/talent-discovery/student-components/StudentCVUploadCard";

export default function StudentCVFunctionsPage() {
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
          <h1>Student CV library page goes here</h1>
        </Box>
      </Box>
    </Box>
  );
}
