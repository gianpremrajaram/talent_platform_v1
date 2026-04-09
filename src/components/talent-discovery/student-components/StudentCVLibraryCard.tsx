"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { deleteStudentCVAction } from "@/app/talent-discovery-standalone/student-cv-functions/action";
//TODO: there some formatting error while rendering it shows file name as id_name.pdf instead of name.pdf
type StudentCVLibraryCardProps = {
  id: string;
  title: string;
  fileName: string;
  fileSize?: string;
  fileUrl: string;
  uploadedAt: string;
  tags?: string[];
  onDeleted: (id: string) => void;
};

export default function StudentCVLibraryCard({
  id,
  title,
  fileName,
  fileSize,
  fileUrl,
  uploadedAt,
  tags = [],
  onDeleted,
}: StudentCVLibraryCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handlePreview = () => {
    window.open(fileUrl, "_blank");
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    await deleteStudentCVAction(id);
    setDeleting(false);
    setConfirmOpen(false);
    onDeleted(id);
  };

  return (
    <>
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
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.25 }}>
                {title}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {fileName}
                {fileSize ? ` • ${fileSize}` : ""}
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
                      "& .MuiChip-label": { px: 1 },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="contained"
              onClick={handlePreview}
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
              onClick={handleDownload}
              sx={{
                minWidth: 130,
                textTransform: "none",
                borderRadius: 1.5,
                boxShadow: "none",
              }}
            >
              Download CV
            </Button>

            <Tooltip title="Delete CV">
              <IconButton
                aria-label={`Delete CV: ${title}`}
                onClick={() => setConfirmOpen(true)}
                sx={{
                  color: "error.main",
                  "&:hover": { backgroundColor: "error.50" },
                }}
              >
                <DeleteOutlineIcon aria-hidden="true" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Card>

      {/* ── Confirmation dialog ── */}
      <Dialog
        open={confirmOpen}
        onClose={() => !deleting && setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete CV?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{title}</strong>? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            color="inherit"
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleting}
            startIcon={
              deleting ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
