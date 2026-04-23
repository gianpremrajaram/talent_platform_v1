"use client";
// src/components/membership-dashboard/AdminPortalShell.tsx
// Shared portal layout for membership-dashboard pages (admin + recruiter + member).
// Mirrors StudentPortalShell: skip link, responsive sidebar drawer, sticky top bar,
// and a <main> landmark — giving all roles the same dashboard look and feel.

import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { signOut, useSession } from "next-auth/react";
import AdminSidebar from "@/components/membership-dashboard/AdminSidebar";

const DRAWER_WIDTH = 280;

const roleLabel: Record<string, string> = {
  ADMIN: "Administrator",
  RECRUITER: "Recruiter",
  STUDENT: "Student",
  MODULE_LEADER: "Module Leader",
};

type Props = { children: React.ReactNode };

export default function AdminPortalShell({ children }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"), { noSsr: true });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const { data: session } = useSession();
  const name = session?.user?.name ?? "";
  const roleKeys: string[] = session?.user?.roleKeys ?? [];
  const userInitial = name.trim().charAt(0).toUpperCase() || "U";
  const displayRole =
    roleKeys.map((k) => roleLabel[k] ?? k).join(", ") || "Member";

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Skip to main content — screen reader / keyboard shortcut */}
      <a href="#main-content" className="skip-link" aria-label="Skip to main content">
        Skip to main content
      </a>

      {/* ── Sidebar — permanent on md+, temporary drawer on mobile ──────── */}
      <Box
        component="nav"
        aria-label="Membership portal navigation"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <AdminSidebar />
      </Box>

      {/* Mobile sidebar drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        <Box onClick={() => setMobileOpen(false)}>
          <AdminSidebar />
        </Box>
      </Drawer>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Sticky top bar — same pattern as StudentTopNavBar */}
        <AppBar
          position="sticky"
          elevation={0}
          color="inherit"
          sx={{ top: 0, zIndex: (t) => t.zIndex.drawer - 1 }}
        >
          <Toolbar
            sx={{
              minHeight: { xs: 60, sm: 70 },
              px: { xs: 1.5, md: 3 },
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            {/* Left: hamburger (mobile) + portal name */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="Open navigation menu"
                  edge="start"
                  onClick={() => setMobileOpen((v) => !v)}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Typography
                variant="h6"
                component="span"
                noWrap
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Membership Portal
              </Typography>
            </Box>

            {/* Right: settings menu + avatar */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
              <IconButton
                color="inherit"
                aria-label="User settings"
                aria-controls={menuOpen ? "admin-settings-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? "true" : undefined}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <SettingsOutlinedIcon aria-hidden="true" />
              </IconButton>

              <Menu
                id="admin-settings-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: { mt: 0.5, minWidth: 180 } } }}
              >
                {/* User info — not interactive */}
                <MenuItem
                  disableRipple
                  sx={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    pointerEvents: "none",
                    pb: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {name || "Alliances user"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {displayRole}
                  </Typography>
                </MenuItem>

                <MenuItem
                  onClick={() => signOut({ callbackUrl: "/sign-in" })}
                  sx={{ color: "error.main", mt: 0.5 }}
                >
                  <ListItemIcon sx={{ color: "error.main" }}>
                    <LogoutOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>

              <Avatar
                aria-label={`User avatar for ${name || "portal user"}`}
                sx={{
                  width: 36,
                  height: 36,
                  ml: 0.5,
                  bgcolor: "primary.main",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                }}
              >
                {userInitial}
              </Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{ flexGrow: 1, outline: "none", overflowY: "auto", p: { xs: 2, md: 3 } }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
