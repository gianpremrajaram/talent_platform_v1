import { Box } from "@mui/material";
import StudentSideBar from "@/components/talent-discovery/student-components/StudentSideBar";
import DashboardTopBar from "@/components/talent-discovery/student-components/StudentTopNavBar";
import StudentCVLibraryList from "@/components/talent-discovery/student-components/StudentCVLibraryList";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { getStudentCVs } from "@/lib/services/student-services";
import { redirect } from "next/navigation";

export default async function StudentCVLibraryPage() {
  const session = await getServerAuthSession();
  const sessionUser = session?.user as any | undefined;

  if (!sessionUser?.id) {
    redirect("/sign-in");
  }

  const userId = sessionUser.id as string;
  const cvs = await getStudentCVs(userId);

  const serializedCVs = cvs.map((cv) => ({
    id: cv.id,
    title: cv.label,
    fileName: cv.fileUrl.split("/").pop() ?? cv.fileUrl,
    fileUrl: cv.fileUrl,
    uploadedAt: cv.uploadedAt.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    tags: cv.tags,
  }));

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <StudentSideBar />

      <Box sx={{ flexGrow: 1, bgcolor: "#fafafb", minWidth: 0 }}>
        <DashboardTopBar title="Student CV Library" />

        <Box sx={{ p: 3, maxWidth: 1200, width: "100%", mx: "auto" }}>
          <StudentCVLibraryList initialCVs={serializedCVs} />
        </Box>
      </Box>
    </Box>
  );
}
