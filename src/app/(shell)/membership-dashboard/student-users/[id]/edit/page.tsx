import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Box, Button, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import StudentProfileSideCard from "@/components/talent-discovery/student-components/StudentProfileSideCard";
import StudentPersonalInfoForm from "@/components/talent-discovery/student-components/StudentPersonalInfoForm";
import StudentAcademicExperienceForm from "@/components/talent-discovery/student-components/StudentAcademicInformationForm";
import StudentWorkExperience from "@/components/talent-discovery/student-components/StudentWorkExperience";
import StudentTechnicalSkills from "@/components/talent-discovery/student-components/StudentTechnicalSkills";
import StudentProjectsSection from "@/components/talent-discovery/student-components/StudentProjectSection";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import {
  getStudentPersonalInfo,
  getStudentSocialLinks,
  getStudentProjects,
  getStudentUserById,
  getStudentUniversities,
  getStudentAcheivementTags,
  getStudentWorkExperiences,
  getStudentTechnicalSkills,
} from "@/lib/services/student-services";

type Tab = "personal" | "academic" | "skills";

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

export default async function StudentEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getServerAuthSession();
  const sessionUser = session?.user as any | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const roleKeys: string[] = sessionUser.roleKeys ?? [];
  if (!roleKeys.includes("ADMIN")) redirect("/membership-dashboard");

  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const tab: Tab =
    tabParam === "academic" ? "academic"
    : tabParam === "skills"   ? "skills"
    : "personal";

  const [user, socialLinks, projects] = await Promise.all([
    getStudentUserById(id),
    getStudentSocialLinks(id),
    getStudentProjects(id),
  ]);

  if (!user) notFound();

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const sidebarSocialLinks = socialLinks.map((link) => ({
    platform: mapDbPlatformToSidebarPlatform(link.platform),
    href: link.url,
  }));

  const baseUrl = `/membership-dashboard/student-users/${id}/edit`;

  const menuItems = [
    {
      label: "Personal Info",
      icon: <PersonOutlineIcon fontSize="small" />,
      active: tab === "personal",
      href: `${baseUrl}?tab=personal`,
    },
    {
      label: "Academic Information",
      icon: <SchoolOutlinedIcon fontSize="small" />,
      active: tab === "academic",
      href: `${baseUrl}?tab=academic`,
    },
    {
      label: "Skills and Experience",
      icon: <WorkOutlineIcon fontSize="small" />,
      active: tab === "skills",
      href: `${baseUrl}?tab=skills`,
    },
    {
      label: "Manage Account",
      icon: <ManageAccountsOutlinedIcon fontSize="small" />,
      active: false,
      href: `/membership-dashboard/student-users/${id}/manage`,
    },
  ];

  // --- Personal tab ---
  let personalContent: React.ReactNode = null;
  if (tab === "personal") {
    const personalInfo = await getStudentPersonalInfo(id);
    const initialValues = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
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
    personalContent = (
      <StudentPersonalInfoForm
        userId={id}
        initialValues={initialValues}
        initialSocialLinks={socialLinks}
      />
    );
  }

  // --- Academic tab ---
  let academicContent: React.ReactNode = null;
  if (tab === "academic") {
    const [universities, acheivementTags] = await Promise.all([
      getStudentUniversities(id),
      getStudentAcheivementTags(id),
    ]);
    const transformedUniversities = universities.map((uni) => ({
      id: uni.id,
      universityName: uni.universityName,
      fieldOfStudy: uni.fieldOfStudy,
      grade: uni.grade ?? "",
      degreeProgram: uni.degreeProgram,
      startDate: uni.startDate ? uni.startDate.toISOString() : null,
      endDate: uni.endDate ? uni.endDate.toISOString() : null,
    }));
    academicContent = (
      <StudentAcademicExperienceForm
        userId={id}
        university={transformedUniversities}
        acheivementTags={acheivementTags}
      />
    );
  }

  // --- Skills tab ---
  let skillsContent: React.ReactNode = null;
  if (tab === "skills") {
    const [experiences, skills] = await Promise.all([
      getStudentWorkExperiences(id),
      getStudentTechnicalSkills(id),
    ]);
    skillsContent = (
      <Stack spacing={3}>
        <StudentWorkExperience
          userId={id}
          initialExperiences={experiences.map(mapExperience)}
        />
        <StudentTechnicalSkills
          userId={id}
          initialTechnicalSkills={skills}
        />
        <StudentProjectsSection
          userId={id}
          initialStudentProjects={projects.map(mapProject)}
        />
      </Stack>
    );
  }

  const tabTitles: Record<Tab, string> = {
    personal: "Personal Info",
    academic: "Academic Information",
    skills: "Skills and Experience",
  };

  return (
    <Box>
      <Link href="/membership-dashboard/student-users" style={{ textDecoration: "none" }}>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2, bgcolor: "#1e3a5f", textTransform: "none", fontSize: 15, px: 3, py: 1, "&:hover": { bgcolor: "#162f4d" } }}
        >
          Back to Students
        </Button>
      </Link>


      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "260px 1fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <StudentProfileSideCard
          name={fullName || "Student"}
          role="Student"
          projectCount={projects.length}
          socialLinks={sidebarSocialLinks}
          menuItems={menuItems}
        />

        {personalContent ?? academicContent ?? skillsContent}
      </Box>
    </Box>
  );
}
