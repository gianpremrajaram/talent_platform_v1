"use client";

import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

type MenuItem = {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
};

type SocialLink = {
  platform: "twitter" | "facebook" | "linkedin";
  href?: string;
};

type ProfileSidebarCardProps = {
  name: string;
  role: string;
  avatarSrc?: string;
  projectCount: string | number;
  socialLinks?: SocialLink[];
  menuItems?: MenuItem[];
};

function SocialIcon({ platform }: { platform: SocialLink["platform"] }) {
  if (platform === "twitter") return <TwitterIcon fontSize="small" />;
  if (platform === "facebook") return <FacebookIcon fontSize="small" />;
  return <LinkedInIcon fontSize="small" />;
}

export default function StudentProfileSideCard({
  name,
  role,
  avatarSrc,
  projectCount,
  socialLinks = [
    { platform: "twitter" },
    { platform: "facebook" },
    { platform: "linkedin" },
  ],
  menuItems = [
    {
      label: "Personal Information",
      icon: <PersonOutlineIcon fontSize="small" />,
      active: true,
    },
    {
      label: "Settings",
      icon: <SettingsOutlinedIcon fontSize="small" />,
    },
  ],
}: ProfileSidebarCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 260,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        boxShadow: "none",
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Profile Section */}
        <Box sx={{ px: 2, pt: 3, pb: 2, textAlign: "center" }}>
          <Box
            sx={{
              width: 90,
              height: 90,
              mx: "auto",
              mb: 2,
              p: 0.5,
              borderRadius: "50%",
              border: "2px dashed",
              borderColor: "primary.light",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Avatar
              src={avatarSrc}
              alt={name}
              sx={{
                width: 80,
                height: 80,
                bgcolor: "grey.100",
                fontSize: 28,
              }}
            >
              {name?.charAt(0)}
            </Avatar>
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {name}
          </Typography>

          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            {role}
          </Typography>

          {/* Social Icons */}
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            sx={{ mb: 2 }}
          >
            {socialLinks.map((item, index) => (
              <IconButton
                key={`${item.platform}-${index}`}
                component={item.href ? "a" : "button"}
                href={item.href}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  bgcolor: "primary.main",
                  color: "common.white",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                <SocialIcon platform={item.platform} />
              </IconButton>
            ))}
          </Stack>

          {/* Stats */}
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem />}
            justifyContent="center"
          >
            <Box sx={{ px: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {projectCount}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Project
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Menu Section */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Stack spacing={0.5}>
            {menuItems.map((item, index) => (
              <Box
                key={`${item.label}-${index}`}
                onClick={item.onClick}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: 1.5,
                  cursor: item.onClick ? "pointer" : "default",
                  bgcolor: item.active ? "primary.lighter" : "transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: item.active ? "primary.lighter" : "action.hover",
                  },
                }}
              >
                <Box
                  sx={{
                    color: item.active ? "text.primary" : "text.secondary",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {item.icon}
                </Box>

                <Typography variant="body2">{item.label}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
