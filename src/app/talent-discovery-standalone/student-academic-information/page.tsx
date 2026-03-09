import StudentSideBar from "@/components/talent-discovery/student-components/StudentSideBar";
import DashboardTopBar from "@/components/talent-discovery/student-components/StudentTopNavBar";
import StudentProfileSideCard from "@/components/talent-discovery/student-components/StudentProfileSideCard";
import StudentAcademicExperienceForm from "@/components/talent-discovery/student-components/StudentAcademicInformationForm";
import { Box } from "@mui/material";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import {
  getStudentAcheivementTags,
  getStudentUniversities,
} from "@/lib/services/student-services";
import { redirect } from "next/navigation";

export default async function StudentAcademicInformationPage() {
  const session = await getServerAuthSession();
  const sessionUser = session?.user as any | undefined;

  if (!sessionUser?.id) {
    redirect("/sign-in");
  }

  const userId = sessionUser.id as string;
  const universities = await getStudentUniversities(userId);
  const acheivementTags = await getStudentAcheivementTags(userId);

  // Convert DB dates into serializable values for the client component
  const transformedUniversities = universities.map((uni) => ({
    id: uni.id,
    universityName: uni.universityName,
    fieldOfStudy: uni.fieldOfStudy,
    grade: uni.grade ?? "",
    degreeProgram: uni.degreeProgram,
    startDate: uni.startDate ? uni.startDate.toISOString() : null,
    endDate: uni.endDate ? uni.endDate.toISOString() : null,
  }));

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <StudentSideBar />

      <Box sx={{ flexGrow: 1, bgcolor: "#fafafb", minWidth: 0 }}>
        <DashboardTopBar title="Student Academic Information" />

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

            <StudentAcademicExperienceForm
              userId={userId}
              university={transformedUniversities}
              acheivementTags={acheivementTags}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
