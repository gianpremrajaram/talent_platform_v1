"use client";
import { Box, Stack, Typography } from "@mui/material";
import StudentSideBar from "@/components/talent-discovery/student-components/StudentSideBar";
import DashboardTopBar from "@/components/talent-discovery/student-components/StudentTopNavBar";
import StudentCVLibraryCard from "@/components/talent-discovery/student-components/StudentCVLibraryCard";
//TODO: Replace with real data from backend when API is ready and fetch tags from the join of student, cv and tags.
const studentCVs = [
  {
    id: 1,
    title: "Software Engineer CV",
    fileName: "John_Smith_SE_CV_2025.pdf",
    fileSize: "312 KB",
    uploadedAt: "Feb 5, 2025",
    tags: ["ReactJS", "MERN", "C++"],
    isPrimary: true,
  },
  {
    id: 2,
    title: "Data Science CV",
    fileName: "John_Smith_DS_CV_2025.pdf",
    fileSize: "312 KB",
    uploadedAt: "Feb 24, 2026",
    tags: ["ML", "Regression", "Python"],
    isPrimary: false,
  },
];

export default function StudentCVFunctionsPage() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <StudentSideBar />

      <Box sx={{ flexGrow: 1, bgcolor: "#fafafb", minWidth: 0 }}>
        <DashboardTopBar title="Student CV Library" />

        <Box
          sx={{
            p: 3,
            maxWidth: 1200,
            width: "100%",
            mx: "auto",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 3,
            }}
          >
            You have {studentCVs.length} CVs in your library:
          </Typography>

          <Stack spacing={3}>
            {studentCVs.map((cv) => (
              <StudentCVLibraryCard
                key={cv.id}
                title={cv.title}
                fileName={cv.fileName}
                fileSize={cv.fileSize}
                uploadedAt={cv.uploadedAt}
                tags={cv.tags}
                isPrimary={cv.isPrimary}
                onPreview={() => console.log("Preview CV:", cv.fileName)}
                onDownload={() => console.log("Download CV:", cv.fileName)}
              />
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
