"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

type DashboardTopBarProps = {
  title: string;
  userInitial?: string;
  /** Called when the hamburger is pressed — only rendered when provided (mobile). */
  onMenuToggle?: () => void;
};

export default function DashboardTopBar({
  title,
  userInitial = "S",
  onMenuToggle,
}: DashboardTopBarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="inherit"
      sx={{
        top: 0,
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >
      {/* Skip-to-content target is #main-content defined in StudentPortalShell */}
      <Toolbar
        sx={{
          minHeight: { xs: 60, sm: 70 },
          px: { xs: 1.5, md: 3 },
          display: "flex",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        {/* Left: optional hamburger (mobile only) + page title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          {onMenuToggle && (
            <IconButton
              color="inherit"
              aria-label="Open navigation menu"
              edge="start"
              onClick={onMenuToggle}
              sx={{ display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component="h1"
            noWrap
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {title}
          </Typography>
        </Box>

        {/* Right: settings dropdown + avatar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
          <IconButton
            color="inherit"
            aria-label="Settings"
            aria-controls={menuOpen ? "settings-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? "true" : undefined}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <SettingsOutlinedIcon aria-hidden="true" />
          </IconButton>

          <Menu
            id="settings-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{ paper: { sx: { mt: 0.5, minWidth: 140 } } }}
          >
            <MenuItem
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon sx={{ color: "error.main" }}>
                <LogoutOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>

          <Avatar
            aria-label={`User avatar for ${userInitial}`}
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
  );
}
