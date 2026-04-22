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
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

type DashboardTopBarProps = {
  title: string;
  userInitial?: string;
};

export default function DashboardTopBar({ title, userInitial = "S" }: DashboardTopBarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <AppBar
      position="static"
      elevation={0}
      color="inherit"
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          minHeight: 70,
          px: { xs: 2, md: 3 },
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 500,
            color: "text.primary",
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            color="inherit"
            aria-label="Settings"
            aria-controls={anchorEl ? "settings-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={anchorEl ? "true" : undefined}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <SettingsOutlinedIcon aria-hidden="true" />
          </IconButton>

          <Menu
            id="settings-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
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
            alt="Your profile"
            sx={{ width: 40, height: 40, ml: 1, bgcolor: "primary.main", fontWeight: 700 }}
          >
            {userInitial}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
