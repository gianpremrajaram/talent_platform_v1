import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import {
  getStudentUserById,
  getStudentSocialLinks,
  getStudentProjects,
} from "@/lib/services/student-services";
import StudentProfileSideCard from "@/components/talent-discovery/student-components/StudentProfileSideCard";
import StudentManageAccountPanel from "@/components/talent-discovery/student-components/StudentManageAccountPanel";
import SecurityIcon from "@mui/icons-material/Security";

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

export default async function StudentManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerAuthSession();
  const sessionUser = session?.user as any | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const roleKeys: string[] = sessionUser.roleKeys ?? [];
  if (!roleKeys.includes("ADMIN")) redirect("/membership-dashboard");

  const { id } = await params;

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

  const editBase = `/membership-dashboard/student-users/${id}/edit`;
  const menuItems = [
    {
      label: "Personal Info",
      icon: <PersonOutlineIcon fontSize="small" />,
      active: false,
      href: `${editBase}?tab=personal`,
    },
    {
      label: "Academic Information",
      icon: <SchoolOutlinedIcon fontSize="small" />,
      active: false,
      href: `${editBase}?tab=academic`,
    },
    {
      label: "Skills and Experience",
      icon: <WorkOutlineIcon fontSize="small" />,
      active: false,
      href: `${editBase}?tab=skills`,
    },
    {
    label: "Manage Access",
    icon: <SecurityIcon fontSize="small" />,
    active: false,
    href: `/membership-dashboard/student-users/${id}/edit?tab=access`,
    },
    {
      label: "Manage Account",
      icon: <ManageAccountsOutlinedIcon fontSize="small" />,
      active: true,
      href: `/membership-dashboard/student-users/${id}/manage`,
    },
  ];

  return (
    <Box>
      <Link href="/membership-dashboard/student-users" style={{ textDecoration: "none" }}>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          sx={{
            mb: 2,
            bgcolor: "#1e3a5f",
            textTransform: "none",
            fontSize: 15,
            px: 3,
            py: 1,
            "&:hover": { bgcolor: "#162f4d" },
          }}
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

        <StudentManageAccountPanel
          userId={id}
          userName={fullName || "Student"}
          userEmail={user.email}
        />
      </Box>
    </Box>
  );
}
