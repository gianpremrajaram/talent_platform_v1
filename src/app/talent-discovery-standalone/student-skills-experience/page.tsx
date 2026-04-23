import { Box, Stack } from "@mui/material";
import { redirect } from "next/navigation";
import StudentPortalShell from "@/components/talent-discovery/student-components/StudentPortalShell";
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

function mapDbPlatformToSidebarPlatform(
  platform: "LINKEDIN" | "FACEBOOK" | "GITHUB" | "TWITTER",
): "linkedin" | "facebook" | "github" | "twitter" {
  switch (platform) {
    case "LINKEDIN": return "linkedin";
    case "FACEBOOK": return "facebook";
    case "GITHUB":   return "github";
    case "TWITTER":  return "twitter";
  }
}

function mapExperience(exp: {
  id: string;
  title: string;
  company: string;
  startDate: Date | null;
  endDate: Date | null;
  description: string | null;
}) {
  return {
    id: exp.id,
    role: exp.title,
    company: exp.company,
    startDate: exp.startDate ? exp.startDate.toISOString() : "",
    endDate: exp.endDate ? exp.endDate.toISOString() : "",
    description: exp.description ?? "",
  };
}

function mapProject(project: {
  id: string;
  title: string;
  startDate: Date | null;
  endDate: Date | null;
  description: string | null;
  projectLink: string | null;
}) {
  return {
    id: project.id,
    title: project.title,
    startDate: project.startDate ?? undefined,
    endDate: project.endDate ?? undefined,
    description: project.description ?? "",
    projectLink: project.projectLink ?? undefined,
  };
}

export default async function StudentSkillsExperiencePage() {
  const session = await getServerAuthSession();
  const sessionUser = session?.user;
  if (!sessionUser?.id) redirect("/sign-in");

  const userId = sessionUser.id;

  const [experiences, projects, studentTechnicalSkills, socialLinks] = await Promise.all([
    getStudentWorkExperiences(userId),
    getStudentProjects(userId),
    getStudentTechnicalSkills(userId),
    getStudentSocialLinks(userId),
  ]);

  const sidebarSocialLinks = socialLinks.map((link) => ({
    platform: mapDbPlatformToSidebarPlatform(link.platform),
    href: link.url,
  }));

  const userName = sessionUser.name ?? "";
  const roleName = sessionUser.roleKeys[0] === "STUDENT" ? "Student" : "User";

  return (
    <StudentPortalShell
      title="Skills and Experience"
      userInitial={sessionUser.name?.charAt(0).toUpperCase() ?? ""}
    >
      <Box sx={{ p: 3, maxWidth: 1200, width: "100%", mx: "auto" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "260px 1fr" },
            gap: 3,
            alignItems: "start",
          }}
        >
          <StudentProfileSideCard
            name={userName}
            role={roleName}
            projectCount={projects.length}
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
    </StudentPortalShell>
  );
}
