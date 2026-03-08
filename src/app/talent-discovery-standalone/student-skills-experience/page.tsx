"use client";

import { Box, Stack } from "@mui/material";
import StudentSideBar from "@/components/talent-discovery/student-components/StudentSideBar";
import DashboardTopBar from "@/components/talent-discovery/student-components/StudentTopNavBar";
import StudentProfileSideCard from "@/components/talent-discovery/student-components/StudentProfileSideCard";
import StudentWorkExperience from "@/components/talent-discovery/student-components/StudentWorkExperience";
import StudentTechnicalSkills from "@/components/talent-discovery/student-components/StudentTechnicalSkills";
import StudentProjectsSection from "@/components/talent-discovery/student-components/StudentProjectSection";
export default function StudentCVFunctionsPage() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <StudentSideBar />

      <Box sx={{ flexGrow: 1, bgcolor: "#fafafb", minWidth: 0 }}>
        <DashboardTopBar title="Student Skills and Experience" />

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

            <Stack spacing={3}>
              <StudentWorkExperience />
              <StudentTechnicalSkills />
              <StudentProjectsSection />
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
