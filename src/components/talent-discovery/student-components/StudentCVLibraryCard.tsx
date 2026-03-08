"use client";

import React from "react";
import { Box, Button, Card, Chip, Stack, Typography } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
//TODO: create a dialog box for download and preview options when the user clicks on those buttons.
type StudentCVLibraryCardProps = {
  title: string;
  fileName: string;
  fileSize?: string;
  uploadedAt: string;
  tags?: string[];
  isPrimary?: boolean;
  onPreview?: () => void;
  onDownload?: () => void;
};

export default function StudentCVLibraryCard({
  title,
  fileName,
  fileSize = "312 KB",
  uploadedAt,
  tags = [],
  isPrimary = false,
  onPreview,
  onDownload,
}: StudentCVLibraryCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "#f1f1f1",
        backgroundColor: "#fff",
        px: { xs: 2, md: 4 },
        py: { xs: 2.5, md: 3.5 },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
          gap: 3,
          alignItems: "center",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              mt: 0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.primary",
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 40 }} />
          </Box>

          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
              sx={{ mb: 0.25 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>

              {isPrimary && (
                <Box
                  sx={{
                    px: 1,
                    py: 0.3,
                    borderRadius: 1,
                    backgroundColor: "#ffe9e9",
                    color: "#ff4d4f",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    lineHeight: 1.2,
                  }}
                >
                  Primary CV
                </Box>
              )}
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {fileName} • {fileSize}
            </Typography>

            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{ mt: 0.5, mb: 1.75 }}
            >
              <AccessTimeOutlinedIcon
                sx={{ fontSize: 16, color: "text.secondary" }}
              />
              <Typography variant="body2" color="text.secondary">
                Uploaded {uploadedAt}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderRadius: 1,
                    backgroundColor: "#fff",
                    borderColor: "#d9d9d9",
                    "& .MuiChip-label": {
                      px: 1,
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={onPreview}
            sx={{
              minWidth: 120,
              textTransform: "none",
              borderRadius: 1.5,
              boxShadow: "none",
            }}
          >
            Preview CV
          </Button>

          <Button
            variant="contained"
            onClick={onDownload}
            sx={{
              minWidth: 130,
              textTransform: "none",
              borderRadius: 1.5,
              boxShadow: "none",
            }}
          >
            Download CV
          </Button>
        </Stack>
      </Box>
    </Card>
  );
}
