"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import XIcon from "@mui/icons-material/X";

export type SocialPlatform = "linkedin" | "facebook" | "github" | "twitter";

export type StudentSocialLink = {
  id: string;
  platform: SocialPlatform;
  url: string;
};

type FormErrors = Record<string, string>;

type StudentSocialLinksSectionProps = {
  value?: StudentSocialLink[];
  onChange?: (links: StudentSocialLink[]) => void;
  onSave?: (links: StudentSocialLink[]) => Promise<void> | void;
};

type SocialOption = {
  value: SocialPlatform;
  label: string;
  placeholder: string;
  color: string;
};

const SOCIAL_OPTIONS: SocialOption[] = [
  {
    value: "linkedin",
    label: "LinkedIn",
    placeholder: "https://www.linkedin.com/in/username",
    color: "#0A66C2",
  },
  {
    value: "facebook",
    label: "Facebook",
    placeholder: "https://www.facebook.com/username",
    color: "#1877F2",
  },
  {
    value: "github",
    label: "GitHub",
    placeholder: "https://github.com/username",
    color: "#171515",
  },
  {
    value: "twitter",
    label: "Twitter / X",
    placeholder: "https://x.com/username",
    color: "#000000",
  },
];

function createEmptyLink(
  usedPlatforms: SocialPlatform[] = [],
): StudentSocialLink {
  const nextPlatform =
    SOCIAL_OPTIONS.find((option) => !usedPlatforms.includes(option.value))
      ?.value ?? "linkedin";

  return {
    id: crypto.randomUUID(),
    platform: nextPlatform,
    url: "",
  };
}

function isValidUrl(url: string) {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function getPlatformMeta(platform: SocialPlatform) {
  return SOCIAL_OPTIONS.find((option) => option.value === platform)!;
}

function renderPlatformIcon(platform: SocialPlatform) {
  const meta = getPlatformMeta(platform);
  const iconSx = { color: meta.color };

  switch (platform) {
    case "linkedin":
      return <LinkedInIcon fontSize="small" sx={iconSx} />;
    case "facebook":
      return <FacebookIcon fontSize="small" sx={iconSx} />;
    case "github":
      return <GitHubIcon fontSize="small" sx={iconSx} />;
    case "twitter":
      return <XIcon fontSize="small" sx={iconSx} />;
    default:
      return null;
  }
}

export default function StudentSocialLinksSection({
  value = [],
  onChange,
  onSave,
}: StudentSocialLinksSectionProps) {
  const theme = useTheme();
  const [links, setLinks] = React.useState<StudentSocialLink[]>(value);
  const [savedLinks, setSavedLinks] =
    React.useState<StudentSocialLink[]>(value);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isEditing, setIsEditing] = React.useState(value.length === 0);

  React.useEffect(() => {
    setLinks(value);
    setSavedLinks(value);
    setErrors({});
    setIsEditing(value.length === 0);
  }, [value]);

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 1.5,
      backgroundColor: theme.palette.background.paper,
    },
    "& .MuiInputBase-input": {
      paddingTop: "12px",
      paddingBottom: "12px",
    },
  };

  const readOnlySx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 1.5,
      backgroundColor: theme.palette.action.hover,
    },
    "& .MuiInputBase-input.Mui-disabled": {
      WebkitTextFillColor: theme.palette.text.primary,
      opacity: 1,
      cursor: "default",
    },
  };

  const availablePlatforms = (currentId: string) => {
    const usedByOthers = links
      .filter((item) => item.id !== currentId)
      .map((item) => item.platform);

    return SOCIAL_OPTIONS.filter(
      (option) => !usedByOthers.includes(option.value),
    );
  };

  const handleAdd = () => {
    if (links.length >= SOCIAL_OPTIONS.length) return;

    const usedPlatforms = links.map((item) => item.platform);
    const next = [...links, createEmptyLink(usedPlatforms)];
    setLinks(next);
    onChange?.(next);
  };

  const handleRemove = (id: string) => {
    const next = links.filter((item) => item.id !== id);
    setLinks(next);

    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });

    onChange?.(next);
  };

  const handleChange =
    (id: string, field: "platform" | "url") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = links.map((item) =>
        item.id === id ? { ...item, [field]: event.target.value } : item,
      );
      setLinks(next);

      if (errors[id]) {
        setErrors((prev) => ({
          ...prev,
          [id]: "",
        }));
      }

      onChange?.(next);
    };

  const handleCancel = () => {
    setLinks(savedLinks);
    setErrors({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    const nextErrors: FormErrors = {};

    links.forEach((link) => {
      if (!link.url.trim()) {
        nextErrors[link.id] = "URL is required";
        return;
      }

      if (!isValidUrl(link.url.trim())) {
        nextErrors[link.id] = "Enter a valid URL";
      }
    });

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    await onSave?.(links);

    setSavedLinks(links);
    setIsEditing(false);
  };

  return (
    <Card
      elevation={0}
      sx={{
        mt: 3,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        boxShadow: "none",
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Social Links
          </Typography>

          {!isEditing && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
        </Stack>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {links.length === 0 && !isEditing ? (
          <Box
            sx={(theme) => ({
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 2,
              px: 3,
              py: 5,
              textAlign: "center",
              backgroundColor: theme.palette.action.hover,
            })}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              No social links added yet
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Add LinkedIn, Facebook, GitHub, or Twitter / X profile URLs.
            </Typography>

            <Button variant="contained" onClick={() => setIsEditing(true)}>
              Add Social Links
            </Button>
          </Box>
        ) : (
          <>
            <Stack spacing={2}>
              {links.map((link) => {
                const meta = getPlatformMeta(link.platform);

                return (
                  <Stack
                    key={link.id}
                    direction={{ xs: "column", md: "row" }}
                    spacing={1.5}
                  >
                    <TextField
                      select
                      value={link.platform}
                      onChange={handleChange(link.id, "platform")}
                      disabled={!isEditing}
                      sx={{
                        ...(isEditing ? inputSx : readOnlySx),
                        minWidth: { xs: "100%", md: 220 },
                      }}
                      SelectProps={{
                        renderValue: (selected) => {
                          const selectedPlatform = selected as SocialPlatform;
                          const selectedMeta =
                            getPlatformMeta(selectedPlatform);

                          return (
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              {renderPlatformIcon(selectedPlatform)}
                              <span>{selectedMeta.label}</span>
                            </Stack>
                          );
                        },
                      }}
                    >
                      {availablePlatforms(link.id).map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            {renderPlatformIcon(option.value)}
                            <span>{option.label}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      fullWidth
                      value={link.url}
                      onChange={handleChange(link.id, "url")}
                      error={!!errors[link.id]}
                      helperText={errors[link.id]}
                      disabled={!isEditing}
                      placeholder={meta.placeholder}
                      InputProps={{
                        startAdornment: (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mr: 1,
                              flexShrink: 0,
                            }}
                          >
                            {renderPlatformIcon(link.platform)}
                          </Box>
                        ),
                      }}
                      sx={isEditing ? inputSx : readOnlySx}
                    />

                    {isEditing && (
                      <IconButton
                        aria-label="Remove social link"
                        onClick={() => handleRemove(link.id)}
                        sx={{ alignSelf: { xs: "flex-end", md: "center" } }}
                      >
                        <CloseIcon />
                      </IconButton>
                    )}
                  </Stack>
                );
              })}
            </Stack>

            {isEditing && (
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mt: 3 }}
              >
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAdd}
                  disabled={links.length >= SOCIAL_OPTIONS.length}
                >
                  Add Link
                </Button>

                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleSave}>
                    Save
                  </Button>
                </Stack>
              </Stack>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
