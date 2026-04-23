import { Box } from "@mui/material";
import { redirect } from "next/navigation";
import StudentPortalShell from "@/components/talent-discovery/student-components/StudentPortalShell";
import StudentProfileSideCard from "@/components/talent-discovery/student-components/StudentProfileSideCard";
import StudentAcademicExperienceForm from "@/components/talent-discovery/student-components/StudentAcademicInformationForm";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import {
  getStudentAcheivementTags,
  getStudentUniversities,
  getStudentSocialLinks,
  getStudentProjectCount,
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

export default async function StudentAcademicInformationPage() {
  const session = await getServerAuthSession();
  const sessionUser = session?.user;

  if (!sessionUser?.id) {
    redirect("/sign-in");
  }

  const userId = sessionUser.id;
  const userName = sessionUser.name ?? "";
  const [universities, acheivementTags, socialLinks, projectCount] = await Promise.all([
    getStudentUniversities(userId),
    getStudentAcheivementTags(userId),
    getStudentSocialLinks(userId),
    getStudentProjectCount(userId),
  ]);
  const sidebarSocialLinks = socialLinks.map((link) => ({
    platform: mapDbPlatformToSidebarPlatform(link.platform),
    href: link.url,
  }));
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
    <StudentPortalShell
      title="Academic Information"
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
            role="Student"
            projectCount={projectCount}
            socialLinks={sidebarSocialLinks}
          />
          <StudentAcademicExperienceForm
            userId={userId}
            university={transformedUniversities}
            acheivementTags={acheivementTags}
          />
        </Box>
      </Box>
    </StudentPortalShell>
  );
}
