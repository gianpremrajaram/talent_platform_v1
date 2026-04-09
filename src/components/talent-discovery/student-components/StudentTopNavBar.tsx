"use client";

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

type DashboardTopBarProps = {
  title: string;
};

export default function DashboardTopBar({ title }: DashboardTopBarProps) {
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
          <IconButton color="inherit" aria-label="Notifications — 9 unread">
            <Badge badgeContent={9} color="primary" aria-hidden="true">
              <NotificationsNoneOutlinedIcon aria-hidden="true" />
            </Badge>
          </IconButton>

          <IconButton color="inherit" aria-label="Settings">
            <SettingsOutlinedIcon aria-hidden="true" />
          </IconButton>

          <Avatar
            alt="Your profile"
            src="/images/avatar/avatar-1.png"
            sx={{ width: 40, height: 40, ml: 1 }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
