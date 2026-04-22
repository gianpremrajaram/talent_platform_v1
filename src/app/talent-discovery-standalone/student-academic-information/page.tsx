import StudentSideBar from "@/components/talent-discovery/student-components/StudentSideBar";
import DashboardTopBar from "@/components/talent-discovery/student-components/StudentTopNavBar";
import StudentProfileSideCard from "@/components/talent-discovery/student-components/StudentProfileSideCard";
import StudentAcademicExperienceForm from "@/components/talent-discovery/student-components/StudentAcademicInformationForm";
import { Box } from "@mui/material";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import {
  getStudentAcheivementTags,
  getStudentUniversities,
  getStudentSocialLinks,
  getStudentProjectCount,
} from "@/lib/services/student-services";
import { redirect } from "next/navigation";

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
      </Box>
    </Box>
  );
}
