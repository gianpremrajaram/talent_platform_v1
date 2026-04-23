import StudentPortalShell from "@/components/talent-discovery/student-components/StudentPortalShell";
import StudentCVUploadCard from "@/components/talent-discovery/student-components/StudentCVUploadCard";
import { Box } from "@mui/material";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { redirect } from "next/navigation";

export default async function StudentCVFunctionsPage() {
  const session = await getServerAuthSession();
  const sessionUser = session?.user;
  if (!sessionUser?.id) {
    redirect("/sign-in");
  }
  const userId = sessionUser.id;

  return (
    <StudentPortalShell
      title="Student CV Management"
      userInitial={sessionUser.name?.charAt(0).toUpperCase() ?? ""}
    >
      <Box sx={{ p: 3, maxWidth: 1200, width: "100%", mx: "auto" }}>
        <StudentCVUploadCard userId={userId} />
      </Box>
    </StudentPortalShell>
  );
}
