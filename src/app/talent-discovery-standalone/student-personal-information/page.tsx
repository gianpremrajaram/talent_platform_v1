import StudentSideBar from "@/components/talent-discovery/student-components/StudentSideBar";
import DashboardTopBar from "@/components/talent-discovery/student-components/StudentTopNavBar";
import StudentProfileSideCard from "@/components/talent-discovery/student-components/StudentProfileSideCard";
import StudentPersonalInfoForm from "@/components/talent-discovery/student-components/StudentPersonalInfoForm";
import { Box } from "@mui/material";

export default function StudentPersonalInformationPage() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <StudentSideBar />

      <Box sx={{ flexGrow: 1, bgcolor: "#fafafb" }}>
        <DashboardTopBar title="Student Personal Information" />

        <Box
          sx={{
            p: 3,
            maxWidth: 1200,
            width: "100%",
            mx: "auto",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "260px 1fr",
              },
              gap: 3,
              alignItems: "start",
            }}
          >
            <StudentProfileSideCard
              name="Sadhana"
              role="Student"
              projectCount={3}
            />

            <StudentPersonalInfoForm />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
