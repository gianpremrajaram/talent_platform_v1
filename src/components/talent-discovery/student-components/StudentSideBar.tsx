"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Toolbar,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const profileItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/talent-discovery-standalone/student-dashboard",
    icon: <DashboardOutlinedIcon />,
  },
  {
    label: "My Applications",
    href: "/talent-discovery-standalone/student-applications",
    icon: <AssignmentOutlinedIcon />,
  },
  {
    label: "Personal Info",
    href: "/talent-discovery-standalone/student-personal-information",
    icon: <PersonOutlineOutlinedIcon />,
  },
  {
    label: "Academic Information",
    href: "/talent-discovery-standalone/student-academic-information",
    icon: <SchoolOutlinedIcon />,
  },
  {
    label: "Skills and Experience",
    href: "/talent-discovery-standalone/student-skills-experience",
    icon: <WorkOutlineOutlinedIcon />,
  },
];

const cvItems: NavItem[] = [
  {
    label: "Upload CV",
    href: "/talent-discovery-standalone/student-cv-functions",
    icon: <UploadFileOutlinedIcon />,
  },
  {
    label: "CV Library",
    href: "/talent-discovery-standalone/student-cv-library",
    icon: <FolderOpenOutlinedIcon />,
  },
];

const settingsItems: NavItem[] = [
  {
    label: "Company Consent",
    href: "/talent-discovery-standalone/student-company-consent",
    icon: <SettingsOutlinedIcon />,
  },
  {
    label: "Security Settings",
    href: "/talent-discovery-standalone/student-security-settings",
    icon: <SettingsOutlinedIcon />,
  },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="caption"
      sx={{
        px: 3,
        pt: 2,
        pb: 1,
        display: "block",
        color: "text.secondary",
        fontSize: 13,
        fontWeight: 600,
        textTransform: "none",
      }}
    >
      {children}
    </Typography>
  );
}

function NavSection({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <List disablePadding sx={{ px: 2 }}>
      {items.map((item) => {
        const selected = pathname === item.href;

        return (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={selected}
            sx={{
              minHeight: 48,
              borderRadius: 2,
              mb: 0.5,
              "&.Mui-selected": {
                bgcolor: "primary.lighter",
                color: "primary.main",
                "& .MuiListItemIcon-root": {
                  color: "primary.main",
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "text.secondary" }} aria-hidden="true">
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        );
      })}
    </List>
  );
}

export default function StudentSidebar() {
  return (
    <Box
      component="nav"
      aria-label="Student portal navigation"
      sx={{
        width: 280,
        height: "100vh",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflowY: "auto",
      }}
    >
      <Toolbar>
        <Typography variant="h6" fontWeight={700}>
          Student Portal
        </Typography>
      </Toolbar>

      <Divider />

      <List disablePadding sx={{ px: 2, pt: 1 }}>
        <ListItemButton
          component={Link}
          href="/"
          aria-label="Back to Alliances home page"
          sx={{
            minHeight: 44,
            borderRadius: 2,
            mb: 0.5,
            color: "text.secondary",
            "&:hover": {
              bgcolor: "action.hover",
              color: "primary.main",
              "& .MuiListItemIcon-root": { color: "primary.main" },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: "text.secondary" }} aria-hidden="true">
            <ArrowBackRoundedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Back to Alliances"
            primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
          />
        </ListItemButton>
      </List>

      <Divider sx={{ mt: 1 }} />

      <SectionTitle>Profile</SectionTitle>
      <NavSection items={profileItems} />

      <SectionTitle>CV Management</SectionTitle>
      <NavSection items={cvItems} />

      <SectionTitle>Account and Security</SectionTitle>
      <NavSection items={settingsItems} />
    </Box>
  );
}
