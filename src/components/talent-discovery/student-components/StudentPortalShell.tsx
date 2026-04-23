"use client";
// src/components/talent-discovery/student-components/StudentPortalShell.tsx
// Shared layout wrapper for all student portal pages.
// Handles responsive sidebar (permanent on desktop, drawer on mobile),
// the top nav bar, skip-to-content link, and semantic <main> landmark.

import { useState } from "react";
import { Box, Drawer, useMediaQuery, useTheme } from "@mui/material";
import StudentSideBar from "@/components/talent-discovery/student-components/StudentSideBar";
import DashboardTopBar from "@/components/talent-discovery/student-components/StudentTopNavBar";

const DRAWER_WIDTH = 280;

type Props = {
  title: string;
  userInitial: string;
  children: React.ReactNode;
};

export default function StudentPortalShell({ title, userInitial, children }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"), { noSsr: true });
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => setMobileOpen((v) => !v);

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* ── Skip to main content (screen-reader / keyboard user helper) ─── */}
      <a
        href="#main-content"
        className="skip-link"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>

      {/* ── Sidebar — permanent on md+, temporary drawer on mobile ──────── */}
      {/* Desktop permanent sidebar */}
      <Box
        component="nav"
        aria-label="Student portal navigation"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <StudentSideBar />
      </Box>

      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }} // better mobile performance
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {/* Close drawer when a link is clicked (navigation happens) */}
        <Box onClick={() => setMobileOpen(false)}>
          <StudentSideBar />
        </Box>
      </Drawer>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <DashboardTopBar
          title={title}
          userInitial={userInitial}
          onMenuToggle={isMobile ? toggleDrawer : undefined}
        />

        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{
            flexGrow: 1,
            outline: "none", // suppress focus ring on programmatic focus from skip link
            overflowY: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
