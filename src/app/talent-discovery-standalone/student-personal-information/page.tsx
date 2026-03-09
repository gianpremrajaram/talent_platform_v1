import { redirect } from "next/navigation";
import StudentSideBar from "@/components/talent-discovery/student-components/StudentSideBar";
import DashboardTopBar from "@/components/talent-discovery/student-components/StudentTopNavBar";
import StudentProfileSideCard from "@/components/talent-discovery/student-components/StudentProfileSideCard";
import StudentPersonalInfoForm from "@/components/talent-discovery/student-components/StudentPersonalInfoForm";
import { Box } from "@mui/material";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import {
  getStudentPersonalInfo,
  getStudentSocialLinks,
} from "@/lib/services/student-services";

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

export default async function StudentPersonalInformationPage() {
  const session = await getServerAuthSession();
  const sessionUser = session?.user as any | undefined;
  if (!sessionUser?.id) {
    redirect("/sign-in");
  }

  const userId = sessionUser.id as string;
  const fullName = sessionUser.name ?? "";

  const [firstName, ...rest] = fullName.split(" ");
  const lastName = rest.join(" ");
  const personalInfo = await getStudentPersonalInfo(userId);
  const socialLinks = await getStudentSocialLinks(userId);
  const sidebarSocialLinks = socialLinks.map((link) => ({
    platform: mapDbPlatformToSidebarPlatform(link.platform),
    href: link.url,
  }));
  const initialValues = {
    firstName: firstName ?? undefined,
    lastName: lastName ?? undefined,
    email: sessionUser.email ?? undefined,
    dateOfBirth: personalInfo?.dateOfBirth?.toISOString() ?? null,
    gender: personalInfo?.gender ?? undefined,
    phoneCode: personalInfo?.phoneCode ?? "+44",
    phoneNumber: personalInfo?.phoneNumber ?? undefined,
    designation: personalInfo?.designation ?? undefined,
    address1: personalInfo?.address1 ?? undefined,
    address2: personalInfo?.address2 ?? undefined,
    country: personalInfo?.country ?? undefined,
    state: personalInfo?.state ?? undefined,
    city: personalInfo?.city ?? undefined,
    postalCode: personalInfo?.postalCode ?? undefined,
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <StudentSideBar />

      <Box sx={{ flexGrow: 1, bgcolor: "#fafafb" }}>
        <DashboardTopBar title="Student Personal Information" />

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
              socialLinks={sidebarSocialLinks}
            />
            <StudentPersonalInfoForm
              userId={userId}
              initialValues={initialValues}
              initialSocialLinks={socialLinks}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
