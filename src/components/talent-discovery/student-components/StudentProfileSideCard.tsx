"use client";

import React from "react";
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
import XIcon from "@mui/icons-material/X";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

type MenuItem = {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  href?: string;
};

export type SocialLink = {
  platform: "twitter" | "facebook" | "linkedin" | "github";
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

const socialLabels: Record<SocialLink["platform"], string> = {
  linkedin: "LinkedIn profile (opens in new tab)",
  twitter: "Twitter / X profile (opens in new tab)",
  facebook: "Facebook profile (opens in new tab)",
  github: "GitHub profile (opens in new tab)",
};

function SocialIcon({ platform }: { platform: SocialLink["platform"] }) {
  if (platform === "twitter") return <XIcon fontSize="small" aria-hidden="true" />;
  if (platform === "facebook") return <FacebookIcon fontSize="small" aria-hidden="true" />;
  if (platform === "github") return <GitHubIcon fontSize="small" aria-hidden="true" />;
  return <LinkedInIcon fontSize="small" aria-hidden="true" />;
}

function getSocialBg(platform: SocialLink["platform"]) {
  switch (platform) {
    case "linkedin":
      return "#0A66C2";
    case "facebook":
      return "#1877F2";
    case "github":
      return "#171515";
    case "twitter":
      return "#000000";
  }
}

export default function StudentProfileSideCard({
  name,
  role,
  avatarSrc,
  projectCount,
  socialLinks = [],
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
  const clickableSocialLinks = socialLinks.filter((item) => !!item.href);

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

          {!!clickableSocialLinks.length && (
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              sx={{ mb: 2 }}
            >
              {clickableSocialLinks.map((item, index) => (
                <IconButton
                  key={`${item.platform}-${index}`}
                  component="a"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={socialLabels[item.platform]}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1,
                    bgcolor: getSocialBg(item.platform),
                    color: "common.white",
                    "&:hover": {
                      opacity: 0.9,
                      bgcolor: getSocialBg(item.platform),
                    },
                  }}
                >
                  <SocialIcon platform={item.platform} />
                </IconButton>
              ))}
            </Stack>
          )}

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

        <Box sx={{ px: 2, pb: 2 }}>
          <Stack spacing={0.5}>
            {menuItems.map((item, index) => (
              <Box
                key={`${item.label}-${index}`}
                component={item.href ? "a" : item.onClick ? "button" : "div"}
                href={item.href}
                type={!item.href && item.onClick ? "button" : undefined}
                onClick={item.onClick}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: 1.5,
                  cursor: item.onClick || item.href ? "pointer" : "default",
                  bgcolor: item.active ? "primary.lighter" : "transparent",
                  transition: "all 0.2s ease",
                  textDecoration: "none",
                  color: "inherit",
                  border: "none",
                  background: item.active ? undefined : "none",
                  width: "100%",
                  textAlign: "left",
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
                  {React.isValidElement(item.icon)
                    ? React.cloneElement(item.icon as React.ReactElement<any>, { "aria-hidden": true })
                    : item.icon}
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
