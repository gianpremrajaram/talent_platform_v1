import { Box, Divider, Typography } from "@mui/material";
import StudentPortalShell from "@/components/talent-discovery/student-components/StudentPortalShell";
import StatisticsCard from "@/components/talent-discovery/student-components/StatisticsCard";
import JobOpeningsTable from "@/components/talent-discovery/student-components/JobOpeningsTable";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { getStudentCVs } from "@/lib/services/student-services";
import { getStudentApplications } from "@/lib/services/applications";
import { redirect } from "next/navigation";

export default async function StudentDashboardPage() {
  const session = await getServerAuthSession();
  const sessionUser = session?.user;
  if (!sessionUser?.id) redirect("/sign-in");

  const [cvs, applications] = await Promise.all([
    getStudentCVs(sessionUser.id),
    getStudentApplications(sessionUser.id),
  ]);
  const cvProps = cvs.map((cv) => ({ id: cv.id, label: cv.label, fileUrl: cv.fileUrl }));
  const appliedJobIds = applications.map((a) => a.jobId);

  return (
    <StudentPortalShell
      title="Student Dashboard"
      userInitial={sessionUser.name?.charAt(0).toUpperCase() ?? ""}
    >
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
        <JobOpeningsTable cvs={cvProps} initialAppliedJobIds={appliedJobIds} />
      </Box>
    </StudentPortalShell>
  );
}
