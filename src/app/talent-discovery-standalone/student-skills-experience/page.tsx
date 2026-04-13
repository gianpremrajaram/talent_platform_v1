import { Box, Stack } from "@mui/material";
import { redirect } from "next/navigation";
import StudentSideBar from "@/components/talent-discovery/student-components/StudentSideBar";
import DashboardTopBar from "@/components/talent-discovery/student-components/StudentTopNavBar";
import StudentProfileSideCard from "@/components/talent-discovery/student-components/StudentProfileSideCard";
import StudentWorkExperience from "@/components/talent-discovery/student-components/StudentWorkExperience";
import StudentTechnicalSkills from "@/components/talent-discovery/student-components/StudentTechnicalSkills";
import StudentProjectsSection from "@/components/talent-discovery/student-components/StudentProjectSection";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import {
  getStudentWorkExperiences,
  getStudentProjects,
  getStudentTechnicalSkills,
  getStudentSocialLinks,
} from "@/lib/services/student-services";
import { get } from "node:http";

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

function mapDbPlatformToSidebarPlatform(
  platform: "LINKEDIN" | "FACEBOOK" | "GITHUB" | "TWITTER",
): "linkedin" | "facebook" | "github" | "twitter" {
  switch (platform) {
    case "LINKEDIN":
      return "linkedin";
    case "FACEBOOK":
      return "facebook";
    case "GITHUB":
      return "github";
    case "TWITTER":
      return "twitter";
  }
}

function mapProject(project: any) {
  return {
    id: project.id,
    title: project.title,
    startDate: project.startDate,
    endDate: project.endDate,
    description: project.description ?? "",
    projectLink: project.projectLink ?? undefined,
  };
}

export default async function StudentCVFunctionsPage() {
  const session = await getServerAuthSession();
  const sessionUser = session?.user;
  if (!sessionUser?.id) redirect("/sign-in");

  const userId = sessionUser.id;

  //find the intial data for the student from the DB.
  const experiences = await getStudentWorkExperiences(userId);
  const projects = await getStudentProjects(userId);
  const studentTechnicalSkills = await getStudentTechnicalSkills(userId);
  const socialLinks = await getStudentSocialLinks(userId);
  const sidebarSocialLinks = socialLinks.map((link) => ({
    platform: mapDbPlatformToSidebarPlatform(link.platform),
    href: link.url,
  }));
  console.log(sessionUser);
  const userName = sessionUser.name ?? "";
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
              socialLinks={sidebarSocialLinks}
            />

            <Stack spacing={3}>
              <StudentWorkExperience
                userId={userId}
                initialExperiences={experiences.map(mapExperience)}
              />
              <StudentTechnicalSkills
                userId={userId}
                initialTechnicalSkills={studentTechnicalSkills}
              />
              <StudentProjectsSection
                userId={userId}
                initialStudentProjects={projects.map(mapProject)}
              />
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
