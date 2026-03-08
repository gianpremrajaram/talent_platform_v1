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
import TagOutlinedIcon from "@mui/icons-material/TagOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

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
  {
    label: "CV Tags",
    href: "/talent-discovery-standalone/student-cv-tags",
    icon: <TagOutlinedIcon />,
  },
];

const settingsItems: NavItem[] = [
  {
    label: "Visibility Settings",
    href: "/talent-discovery-standalone/student-visibility-settings",
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
            <ListItemIcon sx={{ minWidth: 40, color: "text.secondary" }}>
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

      <SectionTitle>Profile</SectionTitle>
      <NavSection items={profileItems} />

      <SectionTitle>CV Management</SectionTitle>
      <NavSection items={cvItems} />

      <SectionTitle>Account and Security</SectionTitle>
      <NavSection items={settingsItems} />
    </Box>
  );
}
