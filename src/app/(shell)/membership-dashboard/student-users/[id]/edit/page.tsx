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

import SecurityIcon from "@mui/icons-material/Security";
import prisma from "@/lib/prisma";
import AccessControlButtons from "./AccessControlButtons";
import { Card, Typography } from "@mui/material"; // 如果顶部没有 Card 和 Typography，记得加上

type Tab = "personal" | "academic" | "skills" | "access";

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
  const sessionUser = session?.user;
  if (!sessionUser?.id) redirect("/sign-in");

  const roleKeys: string[] = sessionUser.roleKeys ?? [];
  if (!roleKeys.includes("ADMIN")) redirect("/membership-dashboard");

  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const tab: Tab =
    tabParam === "academic" ? "academic"
    : tabParam === "skills"   ? "skills"
    : tabParam === "access"   ? "access"
    : "personal";

  const [user, socialLinks, projects, activeSuspension] = await Promise.all([
    getStudentUserById(id),
    getStudentSocialLinks(id),
    getStudentProjects(id),
    prisma.appSuspension.findFirst({
      where: { userId: id, appKey: "TALENT_DISCOVERY", liftedAt: null },
      orderBy: { suspendedAt: "desc" }
    })
  ]);

  if (!user) notFound();
  
  let currentStatus: "ACTIVE" | "SUSPENDED" | "BANNED" = "ACTIVE";
  if (activeSuspension) {
    currentStatus = activeSuspension.reason === "BANNED" ? "BANNED" : "SUSPENDED";
  }

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
      label: "Manage Access",
      icon: <SecurityIcon fontSize="small" />,
      active: tab === "access",
      href: `/membership-dashboard/student-users/${id}/edit?tab=access`,
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
        studentName={fullName}
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
// --- Access tab --- 
  let accessContent: React.ReactNode = null;
  if (tab === "access") {
    accessContent = (
      <Card sx={{ p: 4, borderRadius: 2, boxShadow: "none", border: "1px solid #e7e9ee" }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: "#d32f2f" }}>
          Access & Security Control
        </Typography>
        <Typography sx={{ mb: 4, color: "#4b5563" }}>
          Manage platform access for this student. Suspending a student revokes their access to the Talent Platform temporarily, while a ban is permanent.
        </Typography>
        <AccessControlButtons userId={id} currentStatus={currentStatus} />
      </Card>
    );
  }
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

        {personalContent ?? academicContent ?? skillsContent ?? accessContent}
      </Box>
    </Box>
  );
}
