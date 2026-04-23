"use client";
// src/components/talent-discovery/TalentPortalShell.tsx
// Full portal shell for the /talent-discovery recruiter page.
// Mirrors AdminPortalShell: permanent sidebar on desktop, temporary Drawer on mobile,
// sticky top bar with hamburger (mobile) + user avatar + settings menu.

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
import RecruiterSideBar from "@/components/talent-discovery/RecruiterSideBar";

const SIDEBAR_WIDTH = 280;

const roleLabel: Record<string, string> = {
  ADMIN: "Administrator",
  RECRUITER: "Recruiter",
  STUDENT: "Student",
  MODULE_LEADER: "Module Leader",
};

type Props = { children: React.ReactNode };

export default function TalentPortalShell({ children }: Props) {
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

  const toggleDrawer = () => setMobileOpen((prev) => !prev);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Skip to main content */}
      <a href="#main-content" className="skip-link" aria-label="Skip to main content">
        Skip to main content
      </a>

      {/* Desktop permanent sidebar */}
      <Box
        component="nav"
        aria-label="Recruiter navigation"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
        }}
      >
        <RecruiterSideBar />
      </Box>

      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        aria-label="Recruiter navigation menu"
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, boxSizing: "border-box" },
        }}
      >
        <Box onClick={toggleDrawer}>
          <RecruiterSideBar />
        </Box>
      </Drawer>

      {/* Main content area */}
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        {/* Sticky top bar */}
        <AppBar
          position="sticky"
          elevation={0}
          color="inherit"
          sx={{
            top: 0,
            borderBottom: "1px solid",
            borderColor: "divider",
            zIndex: (t) => t.zIndex.drawer - 1,
          }}
        >
          <Toolbar
            sx={{
              minHeight: { xs: 60, sm: 70 },
              px: { xs: 1.5, md: 3 },
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            {/* Left: hamburger (mobile) + app name */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="Open navigation menu"
                  edge="start"
                  onClick={toggleDrawer}
                >
                  <MenuIcon aria-hidden="true" />
                </IconButton>
              )}
              <Typography
                variant="h6"
                component="span"
                noWrap
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Talent Discovery
              </Typography>
            </Box>

            {/* Right: settings + avatar */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton
                color="inherit"
                aria-label="User settings"
                aria-controls={menuOpen ? "talent-settings-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? "true" : undefined}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <SettingsOutlinedIcon aria-hidden="true" />
              </IconButton>

              <Menu
                id="talent-settings-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: { mt: 0.5, minWidth: 180 } } }}
              >
                {/* User info */}
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
                    <LogoutOutlinedIcon fontSize="small" aria-hidden="true" />
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
          sx={{
            flexGrow: 1,
            outline: "none",
            p: { xs: 2, md: 3 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
