"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Card,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import type { ReactNode } from "react";

type SidebarItem = {
  label: string;
  href?: string;
  icon: ReactNode;
  children?: SidebarItem[];
};

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: <DashboardRoundedIcon fontSize="small" />,
  },
  {
    label: "Project",
    href: "/admin/project",
    icon: <HandshakeRoundedIcon fontSize="small" />,
  },
  {
    label: "User",
    icon: <PersonRoundedIcon fontSize="small" />,
    children: [
      {
        label: "Partners",
        href: "/admin/partner-users",
        icon: <BusinessRoundedIcon fontSize="small" />,
      },
      {
        label: "Students",
        href: "/admin/student-users",
        icon: <SchoolRoundedIcon fontSize="small" />,
      },
    ],
  },
];

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

function isPathActive(pathname: string, href?: string) {
  if (!href) return false;
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  return current === target || current.startsWith(`${target}/`);
}

function isItemActive(pathname: string, item: SidebarItem): boolean {
  if (isPathActive(pathname, item.href)) return true;
  return item.children?.some((child) => isItemActive(pathname, child)) ?? false;
}

export default function AdminSidebar() {
  const pathname = usePathname();

  const renderItems = (items: SidebarItem[], level = 0) =>
    items.map((item) => {
      const selected = isPathActive(pathname, item.href);
      const hasActiveChild = item.children?.some((child) => isItemActive(pathname, child)) ?? false;
      const hasChildren = (item.children?.length ?? 0) > 0;
      const isParentWithActiveChild = hasChildren && !selected && hasActiveChild;

      return (
        <Box key={`${item.label}-${item.href ?? "group"}`}>
          {item.href ? (
            <ListItemButton
              component={Link}
              href={item.href}
              selected={selected}
              sx={{
                minHeight: 38,
                borderRadius: "8px",
                px: 1.25,
                pl: level === 0 ? 1.25 : 4,
                "&.Mui-selected": {
                  backgroundColor: "#eaf3ff",
                  color: "#0b63d7",
                  borderRight: "2px solid #0b63d7",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "#eaf3ff",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: level === 0 ? 28 : 24,
                  color: selected || isParentWithActiveChild ? "#0b63d7" : "#6b7280",
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 13,
                  fontWeight: selected || isParentWithActiveChild ? 600 : 500,
                  color: isParentWithActiveChild ? "#0b63d7" : undefined,
                }}
              />
            </ListItemButton>
          ) : (
            <ListItemButton
              component="button"
              disableRipple
              sx={{
                minHeight: 38,
                borderRadius: "8px",
                px: 1.25,
                pl: level === 0 ? 1.25 : 4,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: level === 0 ? 28 : 24,
                  color: hasActiveChild ? "#0b63d7" : "#6b7280",
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 13,
                  fontWeight: hasActiveChild ? 600 : 500,
                  color: hasActiveChild ? "#0b63d7" : undefined,
                }}
              />
            </ListItemButton>
          )}

          {hasChildren ? <List sx={{ px: 1, py: 0 }}>{renderItems(item.children!, level + 1)}</List> : null}
        </Box>
      );
    });

  return (
    <Card
      sx={{
        borderRadius: "10px",
        border: "1px solid #e5e7eb",
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #eef0f3" }}>
        <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>Dashboard</Typography>
      </Box>

      <Box sx={{ py: 1 }}>
        <List sx={{ px: 1, py: 0 }}>{renderItems(sidebarItems)}</List>
      </Box>

      <Box
        sx={{
          mt: 2,
          px: 2,
          py: 1.5,
          borderTop: "1px solid #eef0f3",
          display: "flex",
          alignItems: "center",
          gap: 1.2,
        }}
      >
        <Box
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
          }}
        >
          S
        </Box>

        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>
            Stein Ben
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
            Administrator
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
