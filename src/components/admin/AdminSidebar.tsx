"use client";

import Link from "next/link";
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
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";

type AdminSidebarItemKey =
  | "dashboard"
  | "partners"
  | "students"
  | "statistics"
  | "mail"
  | "calendar"
  | "approvals";

type Props = {
  activeItem?: AdminSidebarItemKey;
};

const groups = [
  {
    title: "Dashboard",
    items: [
      {
        key: "dashboard" as const,
        label: "Dashboard",
        href: "/admin/partners",
        icon: <DashboardRoundedIcon fontSize="small" />,
      },
    ],
  },
  {
    title: "Manage",
    items: [
      {
        key: "partners" as const,
        label: "Partners",
        href: "/admin/partners",
        icon: <HandshakeRoundedIcon fontSize="small" />,
      },
      {
        key: "approvals" as const,
        label: "Approvals",
        href: "/admin/approvals",
        icon: <BarChartRoundedIcon fontSize="small" />,
      },
      {
        key: "students" as const,
        label: "Students",
        href: "#",
        icon: <SchoolRoundedIcon fontSize="small" />,
      },
    ],
  },
  {
    title: "Widgets",
    items: [
      {
        key: "statistics" as const,
        label: "Statistics",
        href: "#",
        icon: <BarChartRoundedIcon fontSize="small" />,
      },
    ],
  },
  {
    title: "Application",
    items: [
      {
        key: "mail" as const,
        label: "Mail",
        href: "#",
        icon: <MailOutlineRoundedIcon fontSize="small" />,
      },
      {
        key: "calendar" as const,
        label: "Calendar",
        href: "#",
        icon: <CalendarMonthRoundedIcon fontSize="small" />,
      },
    ],
  },
];

export default function AdminSidebar({ activeItem = "partners" }: Props) {
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
        {groups.map((group) => (
          <Box key={group.title} sx={{ mb: 1.2 }}>
            <Typography
              sx={{
                px: 2,
                pt: 1,
                pb: 0.5,
                fontSize: 11,
                color: "#9ca3af",
              }}
            >
              {group.title}
            </Typography>

            <List sx={{ px: 1, py: 0 }}>
              {group.items.map((item) => {
                const selected = item.key === activeItem;

                return (
                  <ListItemButton
                    key={item.key}
                    component={item.href === "#" ? "button" : Link}
                    href={item.href === "#" ? undefined : item.href}
                    selected={selected}
                    sx={{
                      minHeight: 38,
                      borderRadius: "8px",
                      px: 1.25,
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
                        minWidth: 28,
                        color: selected ? "#0b63d7" : "#6b7280",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: 13,
                        fontWeight: selected ? 600 : 500,
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
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