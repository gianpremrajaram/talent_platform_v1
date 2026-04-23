import { Box } from "@mui/material";
import StudentPortalShell from "@/components/talent-discovery/student-components/StudentPortalShell";
import StudentCVLibraryList from "@/components/talent-discovery/student-components/StudentCVLibraryList";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { getStudentCVs } from "@/lib/services/student-services";
import { redirect } from "next/navigation";

export default async function StudentCVLibraryPage() {
  const session = await getServerAuthSession();
  const sessionUser = session?.user;

  if (!sessionUser?.id) {
    redirect("/sign-in");
  }

  const userId = sessionUser.id;
  const cvs = await getStudentCVs(userId);

  const serializedCVs = cvs.map((cv) => ({
    id: cv.id,
    title: cv.label,
    fileName: (cv.fileUrl.split("/").pop() ?? cv.fileUrl).replace(/^\d+_/, ""),
    fileUrl: cv.fileUrl,
    uploadedAt: cv.uploadedAt.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    tags: cv.tags,
  }));

  return (
    <StudentPortalShell
      title="CV Library"
      userInitial={sessionUser.name?.charAt(0).toUpperCase() ?? ""}
    >
      <Box sx={{ p: 3, maxWidth: 1200, width: "100%", mx: "auto" }}>
        <StudentCVLibraryList initialCVs={serializedCVs} />
      </Box>
    </StudentPortalShell>
  );
}
