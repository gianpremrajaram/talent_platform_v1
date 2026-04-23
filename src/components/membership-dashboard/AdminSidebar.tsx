"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import RecommendRoundedIcon from "@mui/icons-material/RecommendRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import type { ReactNode } from "react";

type NavItem = {
  label: string;
  href: string;
  exact?: boolean;
  adminOnly?: boolean;
  icon: ReactNode;
  ariaLabel?: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Navigation",
    items: [
      {
        label: "Home",
        href: "/membership-dashboard",
        exact: true,
        icon: <HomeRoundedIcon aria-hidden="true" />,
        ariaLabel: "Home. Opens Membership Dashboard, Admin View",
      },
      {
        label: "Job Postings Approvals",
        href: "/membership-dashboard/project",
        adminOnly: true,
        icon: <HandshakeRoundedIcon aria-hidden="true" />,
        ariaLabel: "Job Postings Approvals. Opens Job Postings Approvals page",
      },
    ],
  },
  {
    title: "Users",
    items: [
      {
        label: "Partners",
        href: "/membership-dashboard/partner-users",
        adminOnly: true,
        icon: <BusinessRoundedIcon aria-hidden="true" />,
        ariaLabel: "Partners. Opens Partner access management page",
      },
      {
        label: "Students",
        href: "/membership-dashboard/student-users",
        adminOnly: true,
        icon: <SchoolRoundedIcon aria-hidden="true" />,
        ariaLabel: "Students. Opens Student access management page",
      },
    ],
  },
  {
    title: "Matchmaking",
    items: [
      {
        label: "Recommendations",
        href: "/membership-dashboard/recommendations",
        adminOnly: true,
        icon: <RecommendRoundedIcon aria-hidden="true" />,
        ariaLabel: "Recommendations. Opens Admin recommendations page",
      },
    ],
  },
];

const roleLabel: Record<string, string> = {
  ADMIN: "Administrator",
  RECRUITER: "Recruiter",
  STUDENT: "Student",
  MODULE_LEADER: "Module Leader",
};

function normalizePath(path: string) {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function isActive(pathname: string, href: string, exact?: boolean) {
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  if (exact) return current === target;
  return current === target || current.startsWith(`${target}/`);
}

function SectionTitle({ children }: { children: ReactNode }) {
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

function NavSectionList({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <List disablePadding sx={{ px: 2 }}>
      {items.map((item) => {
        const selected = isActive(pathname, item.href, item.exact);
        return (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={selected}
            aria-label={item.ariaLabel ?? item.label}
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

export default function AdminSidebar() {
  const { data: session } = useSession();

  const name = session?.user?.name ?? "";
  const roleKeys: string[] = session?.user?.roleKeys ?? [];
  const displayRole = roleKeys.map((k) => roleLabel[k] ?? k).join(", ") || "Member";
  const initial = name.trim().charAt(0).toUpperCase();
  const isAdmin = roleKeys.includes("ADMIN");

  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.adminOnly || isAdmin),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <Box
      component="nav"
      aria-label="Membership navigation"
      sx={{
        width: 280,
        height: "100vh",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      <Toolbar>
        <Typography variant="h6" fontWeight={700}>
          Membership
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
              "& .MuiListItemIcon-root": {
                color: "primary.main",
              },
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

      {visibleSections.map((section) => (
        <Box key={section.title}>
          <SectionTitle>{section.title}</SectionTitle>
          <NavSectionList items={section.items} />
        </Box>
      ))}

      <Divider sx={{ mt: 1 }} />

      <Box
        aria-label={`Signed in as ${name || "user"}, ${displayRole}`}
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.2,
        }}
      >
        <Box
          aria-label={`Profile photo of ${name || "user"}`}
          aria-hidden="true"
          sx={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            backgroundColor: "#f4c26b",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            fontSize: 13,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {initial}
        </Box>

        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>
            {name}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#4b5563" }}>
            {displayRole}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
