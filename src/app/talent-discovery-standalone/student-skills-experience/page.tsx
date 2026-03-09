import { Box, Stack } from "@mui/material";
import { redirect } from "next/navigation";
import StudentSideBar from "@/components/talent-discovery/student-components/StudentSideBar";
import DashboardTopBar from "@/components/talent-discovery/student-components/StudentTopNavBar";
import StudentProfileSideCard from "@/components/talent-discovery/student-components/StudentProfileSideCard";
import StudentWorkExperience from "@/components/talent-discovery/student-components/StudentWorkExperience";
import StudentTechnicalSkills from "@/components/talent-discovery/student-components/StudentTechnicalSkills";
import StudentProjectsSection from "@/components/talent-discovery/student-components/StudentProjectSection";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { getStudentWorkExperiences } from "@/lib/services/student-services";
//TODO: add location field in the work expereince dialog box.
function mapExperience(exp: any) {
  return {
    id: exp.id,
    role: exp.title,
    company: exp.company,
    startDate: exp.startDate ? exp.startDate.toISOString() : "",
    endDate: exp.endDate ? exp.endDate.toISOString() : "",
    description: exp.description ?? "",
  };
}

export default async function StudentCVFunctionsPage() {
  const session = await getServerAuthSession();
  const sessionUser = session?.user as any | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const userId = sessionUser.id as string;
  const experiences = await getStudentWorkExperiences(userId);
  console.log(sessionUser);
  const userName = sessionUser.name;
  const roleName = sessionUser.roleKeys[0] === "STUDENT" ? "Student" : "User";

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
              name={userName}
              role={roleName}
              projectCount={3}
            />

            <Stack spacing={3}>
              <StudentWorkExperience
                userId={userId}
                initialExperiences={experiences.map(mapExperience)}
              />
              <StudentTechnicalSkills />
              <StudentProjectsSection />
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
